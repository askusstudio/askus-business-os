'use client'
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { triggerNotification } from '@/lib/notifications';

const COLUMNS = ['To Do', 'In Progress', 'Under Review', 'Done'];

interface TeamMember {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  availability_status?: 'available' | 'busy' | 'on_leave';
}

export default function ProjectKanbanBoard({
  projectId,
  teamRoster = [],
}: {
  projectId: number | string;
  teamRoster?: any[];
}) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          .select('id, full_name, email, role, availability_status')
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
        status: col,
        is_completed: col === 'Done',
        position: colTasks.length,
      };

      if (targetAssignee) {
        taskPayload.assigned_to = targetAssignee;
      }

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
        setAddingToCol(null);

        // Automation Trigger: Notify member about new task assignment
        if (targetAssignee && targetAssignee !== currentUser?.id) {
          triggerNotification({
            userId: targetAssignee,
            title: 'New Task Assigned 📌',
            message: `You were assigned "${titleToCreate}" in project #${parsedProjectId}`,
            type: 'task_assigned',
            link: '/dashboard/employee',
          }).catch((err) => console.log('Notification trigger error:', err));
        }
      }
    } catch (err: any) {
      alert('Error creating task: ' + err.message);
    } finally {
      setIsSubmitting(false);
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
                                  className={`p-2.5 rounded-lg border text-xs bg-white transition-all shadow-2xs ${
                                    snapshot.isDragging
                                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <p className={`text-slate-800 font-medium ${t.is_completed ? 'line-through text-slate-400' : ''}`}>
                                    {t.title || t.task_title}
                                  </p>

                                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-50 pt-1.5">
                                    <span>#{t.id}</span>
                                    {assignee ? (
                                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          assignee.availability_status === 'busy' ? 'bg-amber-500' :
                                          assignee.availability_status === 'on_leave' ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`} />
                                        {assignee.full_name?.split(' ')[0] || assignee.email?.split('@')[0]}
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
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-black"
                        autoFocus
                      />

                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-300 rounded-lg p-1.5 text-slate-700 outline-none"
                      >
                        <option value="">Assign to (Default: Unassigned)</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.full_name || m.email?.split('@')[0]} ({m.role || 'Member'}) — {m.availability_status || 'available'}
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
                          onClick={() => { setAddingToCol(null); setNewTaskTitle(''); setAssignedTo(''); }}
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
    </div>
  );
}