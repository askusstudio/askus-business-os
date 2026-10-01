'use client'
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { triggerNotification } from '@/lib/notifications';
import { Calendar, Edit3, X } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Under Review', 'Done'];

interface TeamMember {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  phone?: string;
  employee_code?: string;
  availability_status?: 'available' | 'busy' | 'on_leave';
}

export default function ProjectKanbanBoard({
  projectId,
  projectTitle = 'Workspace',
  teamRoster = [],
}: {
  projectId: number | string;
  projectTitle?: string;
  teamRoster?: any[];
}) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<string>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Task State
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('admin');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(teamRoster);

  useEffect(() => {
    if (teamRoster && teamRoster.length > 0) {
      setTeamMembers(teamRoster);
    }
  }, [teamRoster]);

  useEffect(() => {
    initUserAndBoard();

    // Supabase Realtime Channel: sync board across members
    const channel = supabase
      .channel(`kanban_tasks_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchTasks(userRole, currentUser?.id || '');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, userRole, currentUser?.id]);

  const initUserAndBoard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let role = 'admin';

      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role) {
          role = profile.role;
          setUserRole(role);
        }
      }

      if (!teamRoster || teamRoster.length === 0) {
        const { data: members } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, phone, employee_code, availability_status')
          .neq('role', 'client');

        if (members && members.length > 0) {
          setTeamMembers(members);
        }
      }

      await fetchTasks(role, user?.id || '');
    } catch (err) {
      console.error('Board init error:', err);
    }
  };

  const fetchTasks = async (role: string, userId: string) => {
    let query = supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', Number(projectId) || projectId);

    if (role === 'admin' || role === 'director' || role === 'manager' || role === 'senior_manager') {
      // Elevated roles see all tasks in this board
    } else if (userId) {
      query = query.eq('assigned_to', userId);
    }

    const { data, error } = await query.order('position', { ascending: true });
    if (!error && data) {
      setTasks(data);
    }
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

    const destTasks = updatedTasks.filter((t) => t.status !== destCol);
    destTasks.splice(destination.index, 0, movedTask);

    setTasks([...updatedTasks.filter((t) => t.status !== destCol), ...destTasks]);

    await supabase
      .from('project_tasks')
      .update({
        status: destCol,
        is_completed: destCol === 'Done',
        position: destination.index,
      })
      .eq('id', draggableId);
  };

  const handleCreateTask = async (col: string) => {
    if (!newTaskTitle.trim()) return;
    setIsSubmitting(true);

    try {
      const parsedProjectId = isNaN(Number(projectId)) ? projectId : Number(projectId);
      const colTasks = tasks.filter((t) => t.status === col);
      const titleToCreate = newTaskTitle.trim();
      const targetAssignee = assignedTo && assignedTo.trim() !== '' ? assignedTo : null;

      const taskPayload: any = {
        project_id: parsedProjectId,
        title: titleToCreate,
        priority: newTaskPriority || 'Medium',
        due_date: newTaskDueDate || null,
        status: col,
        is_completed: col === 'Done',
        position: colTasks.length,
      };

      if (targetAssignee) {
        taskPayload.assigned_to = targetAssignee;
      }

      // Foreign key error fixed: using clean .select().single()
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([taskPayload])
        .select()
        .single();

      if (error) {
        console.error('Task insert error:', error);
        alert('Task creation failed: ' + error.message);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        setTasks((prev) => [...prev, data]);
        setNewTaskTitle('');
        setAssignedTo('');
        setNewTaskDueDate('');
        setNewTaskPriority('Medium');
        setAddingToCol(null);

        const assignedMember = teamMembers.find((m) => String(m.id) === String(targetAssignee));

        // 1. In-App Notification
        if (targetAssignee && targetAssignee !== currentUser?.id) {
          triggerNotification({
            userId: targetAssignee,
            title: 'New Task Assigned 📌',
            message: `You were assigned "${titleToCreate}" in project #${parsedProjectId}`,
            type: 'task_assigned',
            link: '/dashboard/employee',
          }).catch((err) => console.log('Notification trigger error:', err));
        }

        // 2. Automatic Email Notification via Resend
        if (assignedMember?.email) {
          fetch('/api/tasks/notify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeEmail: assignedMember.email,
              employeeName: assignedMember.full_name || 'Team Member',
              taskTitle: titleToCreate,
              projectName: projectTitle,
              priority: data.priority || newTaskPriority,
              dueDate: data.due_date || newTaskDueDate,
            }),
          }).catch((err) => console.error('Task notification email error:', err));
        }
      }
    } catch (err: any) {
      alert('Error creating task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setIsUpdatingTask(true);

    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          title: editingTask.title,
          priority: editingTask.priority || 'Medium',
          due_date: editingTask.due_date || null,
          assigned_to: editingTask.assigned_to || null,
        })
        .eq('id', editingTask.id);

      if (!error) {
        await fetchTasks(userRole, currentUser?.id || '');
        setEditingTask(null);
      } else {
        alert('Error updating task: ' + error.message);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Low':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-300';
    }
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Access Mode Banner */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
        <span className="text-slate-600">
          Access Mode: <strong className="text-slate-900 uppercase font-bold">{userRole}</strong>
          {userRole === 'employee' || userRole === 'intern' ? ' (Showing tasks assigned to you)' : ' (Full Board Visibility)'}
        </span>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {tasks.length} Active Tasks
        </span>
      </div>

      {/* Kanban Board Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => (t.status || 'To Do') === col);

            return (
              <div key={col} className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between min-h-[300px]">
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
                          const assignee = teamMembers.find((m) => String(m.id) === String(t.assigned_to));

                          return (
                            <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-2.5 rounded-lg border text-xs bg-white transition-all shadow-2xs space-y-1.5 ${
                                    snapshot.isDragging
                                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {/* Task Title + Quick Edit Button */}
                                  <div className="flex items-start justify-between gap-1">
                                    <p className={`text-slate-800 font-medium leading-snug ${t.is_completed ? 'line-through text-slate-400' : ''}`}>
                                      {t.title || t.task_title}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTask(t)}
                                      className="text-slate-400 hover:text-black cursor-pointer p-0.5 rounded"
                                      title="Edit Task"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                  </div>

                                  {/* Priority and Due Date Badges */}
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                    <span className={`px-1.5 py-0.2 rounded border font-bold ${getPriorityBadge(t.priority || 'Medium')}`}>
                                      {t.priority || 'Medium'}
                                    </span>
                                    {t.due_date && (
                                      <span className="text-slate-500 font-mono flex items-center gap-0.5">
                                        <Calendar size={10} /> {t.due_date}
                                      </span>
                                    )}
                                  </div>

                                  {/* Assignee Details */}
                                  <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-1.5 flex items-center justify-between">
                                    {assignee ? (
                                      <div className="flex items-center gap-1 truncate">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          assignee.availability_status === 'busy' ? 'bg-amber-500' :
                                          assignee.availability_status === 'on_leave' ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`} />
                                        <span className="font-semibold text-slate-700 truncate">
                                          {assignee.full_name?.split(' ')[0] || assignee.email?.split('@')[0]}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">Unassigned</span>
                                    )}

                                    <span className="text-[9px] text-slate-400 font-mono">#{t.id}</span>
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

                {/* Add Task Form with Priority and Due Date */}
                <div className="pt-2 border-t border-slate-200 mt-2">
                  {addingToCol === col ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-black"
                        autoFocus
                      />

                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value)}
                          className="w-full text-[11px] bg-white border border-slate-300 rounded-lg p-1.5 text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">🚨 Urgent</option>
                        </select>

                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full text-[11px] bg-white border border-slate-300 rounded-lg p-1.5 text-slate-700 outline-none cursor-pointer"
                        />
                      </div>

                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-300 rounded-lg p-1.5 text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="">Assign to (Default: Unassigned)</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.full_name || m.email?.split('@')[0]} ({m.employee_code || m.role || 'Member'})
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleCreateTask(col)}
                          className="flex-1 text-[10px] font-bold bg-black hover:bg-slate-800 text-white rounded-lg p-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingToCol(null);
                            setNewTaskTitle('');
                            setAssignedTo('');
                            setNewTaskDueDate('');
                          }}
                          className="flex-1 text-[10px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg p-1.5 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
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

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Edit Task Details</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveTaskEdit} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority</label>
                  <select
                    value={editingTask.priority || 'Medium'}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2 cursor-pointer outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">🚨 Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingTask.due_date || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2 cursor-pointer outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assignee</label>
                <select
                  value={editingTask.assigned_to || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, assigned_to: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 cursor-pointer outline-none"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name || m.email?.split('@')[0]} ({m.employee_code || m.role || 'Member'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTask}
                  className="flex-1 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {isUpdatingTask ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}