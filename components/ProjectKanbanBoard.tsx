'use client'
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { Users, Edit3, Trash2, Check, X, ShieldAlert } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Under Review', 'Done'];

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  availability_status?: 'available' | 'busy' | 'on_leave';
}

export default function ProjectKanbanBoard({ projectId }: { projectId: number | string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [addingToCol, setAddingToCol] = useState<string | null>(null);

  // User auth & role state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('employee');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Team management panel & modal state
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    initUserAndBoard();
  }, [projectId]);

  const initUserAndBoard = async () => {
    // 1. Fetch current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    // 2. Fetch role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'employee';
    setUserRole(role);

    // 3. Fetch tasks with strict hierarchy
    await fetchTasks(role, user.id);

    // 4. Fetch team members for assignment & management
    await fetchTeamMembers();
  };

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, availability_status')
      .order('full_name', { ascending: true });

    if (data) {
      setTeamMembers(data as TeamMember[]);
    }
  };

  const fetchTasks = async (role: string, userId: string) => {
    let query = supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId);

    // Strict Tasks Visibility Hierarchy
    if (role === 'admin' || role === 'director') {
      // Admin sees everything
    } else if (role === 'manager' || role === 'senior_manager') {
      // Manager sees tasks assigned to them OR created by them
      query = query.or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
    } else {
      // Regular employee/intern sees strictly their own tasks
      query = query.eq('assigned_to', userId);
    }

    const { data } = await query.order('position', { ascending: true });
    if (data) setTasks(data);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const destCol = destination.droppableId;

    const updatedTasks = Array.from(tasks);
    const movedTaskIndex = updatedTasks.findIndex((t) => String(t.id) === draggableId);
    if (movedTaskIndex === -1) return;

    const [movedTask] = updatedTasks.splice(movedTaskIndex, 1);
    movedTask.status = destCol;
    movedTask.is_completed = destCol === 'Done';

    const destTasks = updatedTasks.filter((t) => t.status === destCol);
    destTasks.splice(destination.index, 0, movedTask);

    setTasks([...updatedTasks.filter((t) => t.status !== destCol), ...destTasks]);

    await supabase
      .from('project_tasks')
      .update({ status: destCol, is_completed: destCol === 'Done', position: destination.index })
      .eq('id', draggableId);
  };

  const handleCreateTask = async (col: string) => {
    if (!newTaskTitle.trim()) return;

    const taskPayload = {
      project_id: projectId,
      task_title: newTaskTitle,
      status: col,
      is_completed: col === 'Done',
      position: tasks.filter((t) => t.status === col).length,
      assigned_to: assignedTo || currentUser?.id,
      created_by: currentUser?.id,
    };

    const { data, error } = await supabase
      .from('project_tasks')
      .insert([taskPayload])
      .select()
      .single();

    if (!error && data) {
      setTasks([...tasks, data]);
      setNewTaskTitle('');
      setAssignedTo('');
      setAddingToCol(null);
    }
  };

  // Availability & User Management Functions
  const handleUpdateAvailability = async (memberId: string, status: 'available' | 'busy' | 'on_leave') => {
    await supabase.from('profiles').update({ availability_status: status }).eq('id', memberId);
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, availability_status: status } : m))
    );
  };

  const handleSaveMemberDetails = async () => {
    if (!editingMember) return;
    await supabase
      .from('profiles')
      .update({
        full_name: editingMember.full_name,
        role: editingMember.role,
        availability_status: editingMember.availability_status || 'available',
      })
      .eq('id', editingMember.id);

    setTeamMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? editingMember : m))
    );
    setEditingMember(null);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this user from the workspace?')) return;
    await supabase.from('profiles').delete().eq('id', memberId);
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const isPrivileged = userRole === 'admin' || userRole === 'director' || userRole === 'manager';

  return (
    <div className="space-y-4 pt-2">
      {/* Top Header & Team Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Workspace Access
          </span>
          <p className="text-xs font-semibold text-slate-800">
            Role: <span className="text-emerald-700 font-bold uppercase">{userRole}</span>
            {userRole === 'employee' && ' (Viewing your assigned tasks only)'}
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={() => setShowTeamPanel(!showTeamPanel)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Users size={14} />
            <span>{showTeamPanel ? 'Hide Team Panel' : 'Manage Team & Availability'}</span>
          </button>
        )}
      </div>

      {/* Team Availability & Management Panel */}
      {showTeamPanel && isPrivileged && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Team Availability & Actions</h4>
              <p className="text-[11px] text-slate-500">Monitor workload status, edit permissions, or remove users.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {teamMembers.length} Members
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {teamMembers.map((member) => {
              const status = member.availability_status || 'available';
              return (
                <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{member.full_name || 'Unnamed Member'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{member.email}</p>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mt-1 inline-block">
                        {member.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 size={13} />
                      </button>
                      {(userRole === 'admin' || userRole === 'director') && (
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700 cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Availability Dropdown */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium">Availability:</span>
                    <select
                      value={status}
                      onChange={(e) => handleUpdateAvailability(member.id, e.target.value as any)}
                      className={`text-[10px] font-bold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                        status === 'available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : status === 'busy'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <option value="available">🟢 Available</option>
                      <option value="busy">🟡 In Meeting / Busy</option>
                      <option value="on_leave">🔴 On Leave</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Edit Member Details</h3>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">Full Name</label>
              <input
                type="text"
                value={editingMember.full_name || ''}
                onChange={(e) => setEditingMember({ ...editingMember, full_name: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 mt-1 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">Role</label>
              <select
                value={editingMember.role}
                onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 mt-1 focus:outline-none focus:border-slate-800"
              >
                <option value="intern">Intern</option>
                <option value="employee">Employee / Executive</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveMemberDetails}
                className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
              >
                <Check size={14} /> Save Changes
              </button>
              <button
                onClick={() => setEditingMember(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => (t.status || 'To Do') === col);

            return (
              <div key={col} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                    <span className="text-xs font-bold text-slate-700">{col}</span>
                    <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[160px]">
                        {colTasks.map((t, index) => {
                          const assignee = teamMembers.find((m) => m.id === t.assigned_to);

                          return (
                            <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-2.5 rounded-lg border text-xs bg-white transition-all shadow-2xs ${
                                    snapshot.isDragging
                                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <p className={`text-slate-800 font-medium ${t.is_completed ? 'line-through text-slate-400' : ''}`}>
                                    {t.task_title || t.title}
                                  </p>

                                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-50 pt-1.5">
                                    <span>#{t.id}</span>
                                    {assignee ? (
                                      <span className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          assignee.availability_status === 'busy' ? 'bg-amber-500' :
                                          assignee.availability_status === 'on_leave' ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`} />
                                        {assignee.full_name.split(' ')[0]}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">Unassigned</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                <div className="pt-2 border-t border-slate-200 mt-2">
                  {addingToCol === col ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-slate-800"
                        autoFocus
                      />

                      {/* Assignee selector for Privileged Roles */}
                      {isPrivileged && (
                        <select
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          className="w-full text-[11px] bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700"
                        >
                          <option value="">Assign to (Default: You)</option>
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name} ({m.role}) - {m.availability_status || 'available'}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCreateTask(col)}
                          className="flex-1 text-[10px] font-bold bg-slate-900 hover:bg-black text-white rounded p-1.5 cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingToCol(null); setNewTaskTitle(''); setAssignedTo(''); }}
                          className="flex-1 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded p-1.5 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingToCol(col); setNewTaskTitle(''); }}
                      className="w-full text-left text-[11px] font-medium text-slate-500 hover:text-slate-900 py-1 hover:bg-white rounded px-1.5 transition-colors cursor-pointer"
                    >
                      + Add task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}