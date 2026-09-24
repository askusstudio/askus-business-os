'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProjectFileManager from '@/components/ProjectFileManager';
import ProjectTimeTracker from '@/components/ProjectTimeTracker';
import NotificationBell from '@/components/NotificationBell';

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any[]>>({});
  const [internalNotes, setInternalNotes] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'tasks' | 'notes' | 'files' | 'timelog'>>({});
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});

  // Live Shift Stopwatch States
  const [timerActive, setTimerActive] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState<Record<string, number>>({});
  const [timerNotes, setTimerNotes] = useState<Record<string, string>>({});
  const [timerSaving, setTimerSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [editingProj, setEditingProj] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Stopwatch ticking interval
  useEffect(() => {
    const activeProjectIds = Object.keys(timerActive).filter((id) => timerActive[id]);
    if (activeProjectIds.length === 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        const updated = { ...prev };
        activeProjectIds.forEach((id) => {
          updated[id] = (updated[id] || 0) + 1;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTimer = (totalSecs: number = 0) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = (projectId: string | number) => {
    const current = timerActive[projectId] || false;
    setTimerActive({ ...timerActive, [projectId]: !current });
  };

  const handleStopAndLogShift = async (projectId: string | number) => {
    const secs = timerSeconds[projectId] || 0;
    if (secs < 30) {
      alert('Shift timer minimum 30 seconds chalna chahiye log karne ke liye.');
      return;
    }

    setTimerSaving(true);
    const hours = Number((secs / 3600).toFixed(2));
    const desc = timerNotes[projectId]?.trim() || 'Sprint Task Session';

    const { error } = await supabase.from('project_time_logs').insert([
      {
        project_id: projectId,
        employee_id: user.id,
        hours_logged: hours,
        description: desc,
      },
    ]);

    setTimerSaving(false);
    if (!error) {
      setTimerActive({ ...timerActive, [projectId]: false });
      setTimerSeconds({ ...timerSeconds, [projectId]: 0 });
      setTimerNotes({ ...timerNotes, [projectId]: '' });
      alert(`Shift successfully logged: ${hours} hrs.`);
    } else {
      alert('Error logging shift hours: ' + error.message);
    }
  };

  const fetchEmployeeData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    const employeeRoles = ['director', 'senior_manager', 'manager', 'executive', 'intern', 'employee', 'admin'];
    if (!prof || !employeeRoles.includes(prof.role)) {
      router.push('/login');
      return;
    }

    setProfile(prof);

    // Fetch projects assigned to this employee
    const { data: projs } = await supabase
      .from('projects')
      .select('*')
      .eq('assigned_to', currentUser.id)
      .order('created_at', { ascending: false });

    if (projs && projs.length > 0) {
      setAssignedProjects(projs);
      const projectIds = projs.map((p) => p.id);

      // Fetch Tasks
      const { data: taskData } = await supabase
        .from('project_tasks')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: true });

      if (taskData) {
        const groupedTasks: Record<string, any[]> = {};
        taskData.forEach((t) => {
          if (!groupedTasks[t.project_id]) groupedTasks[t.project_id] = [];
          groupedTasks[t.project_id].push(t);
        });
        setTasks(groupedTasks);
      }

      // Fetch Studio Internal Notes
      const { data: notesData } = await supabase
        .from('project_internal_notes')
        .select(`
          id,
          project_id,
          note,
          created_at,
          author:profiles(full_name, role)
        `)
        .in('project_id', projectIds)
        .order('created_at', { ascending: true });

      if (notesData) {
        const groupedNotes: Record<string, any[]> = {};
        notesData.forEach((n: any) => {
          if (!groupedNotes[n.project_id]) groupedNotes[n.project_id] = [];
          groupedNotes[n.project_id].push(n);
        });
        setInternalNotes(groupedNotes);
      }
    } else {
      setAssignedProjects([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployeeData();

    // Realtime listener for live sync
    const channel = supabase
      .channel('employee_live_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchEmployeeData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks' }, () => fetchEmployeeData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_internal_notes' }, () => fetchEmployeeData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj) return;
    setSaving(true);

    const { error } = await supabase
      .from('projects')
      .update({
        status: editingProj.status,
        progress: Number(editingProj.progress),
        pending_tasks: editingProj.pending_tasks,
      })
      .eq('id', editingProj.id);

    setSaving(false);
    if (!error) {
      setEditingProj(null);
      fetchEmployeeData();
    } else {
      alert('Error updating project: ' + error.message);
    }
  };

  const handleAddTask = async (projectId: string | number) => {
    const title = newTaskTitle[projectId]?.trim();
    if (!title || !user) return;

    const { data, error } = await supabase
      .from('project_tasks')
      .insert([{ project_id: projectId, task_title: title, title: title, assigned_to: user.id }])
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), data],
      }));
      setNewTaskTitle({ ...newTaskTitle, [projectId]: '' });
    } else if (error) {
      alert('Error creating task: ' + error.message);
    }
  };

  const handleToggleTask = async (taskId: number, projectId: string | number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from('project_tasks')
      .update({ is_completed: nextStatus })
      .eq('id', taskId);

    if (!error) {
      setTasks((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, is_completed: nextStatus } : t
        ),
      }));
    }
  };

  const handleAddNote = async (projectId: string | number) => {
    const note = newNoteText[projectId]?.trim();
    if (!note || !user) return;

    const { error } = await supabase
      .from('project_internal_notes')
      .insert([{ project_id: projectId, author_id: user.id, note }]);

    if (!error) {
      setNewNoteText({ ...newNoteText, [projectId]: '' });
      fetchEmployeeData();
    } else {
      alert('Error posting internal note: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Official Askus Studio Logo */}
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center shrink-0 select-none bg-white">
              <img
                src="/logo/site-logo.jpg"
                alt="Askus Studio"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
                EMPLOYEE WORKSPACE
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {profile?.role?.replace('_', ' ') || 'Team'}
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">Welcome back, {profile?.full_name || 'Team Member'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && <NotificationBell userId={user.id} />}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* KPI Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Projects</span>
            <span className="text-2xl font-bold mt-2 text-slate-900 tracking-tight">{assignedProjects.length}</span>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <span className="text-2xl font-bold mt-2 text-emerald-700 tracking-tight">
              {Object.values(tasks).flat().filter((t) => !t.is_completed).length} Tasks
            </span>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed Deliverables</span>
            <span className="text-2xl font-bold mt-2 text-slate-900 tracking-tight">
              {Object.values(tasks).flat().filter((t) => t.is_completed).length} Done
            </span>
          </div>
        </section>

        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 font-mono">Loading your workspace...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Assigned Tasks & Projects</h2>
              <span className="text-xs font-mono text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {assignedProjects.length} Total
              </span>
            </div>

            {assignedProjects.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 p-12 rounded-2xl text-center space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-base">
                  📂
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Projects Allocated Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your team profile is active as <strong className="text-slate-700 uppercase">{profile?.role?.replace('_', ' ')}</strong>. Once the Admin assigns you as the lead for a project, your task sprints, files, and time tracking tabs will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {assignedProjects.map((p) => {
                  const currentTab = activeTab[p.id] || 'tasks';
                  const projTasks = tasks[p.id] || [];
                  const completedTasksCount = projTasks.filter((t) => t.is_completed).length;
                  const isTiming = timerActive[p.id] || false;
                  const currentSecs = timerSeconds[p.id] || 0;

                  return (
                    <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-slate-300 transition-all">
                      <div className="space-y-4">
                        {/* Title & Status Header */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-base text-slate-900 leading-tight">{p.title}</h3>
                            <span className="text-[10px] font-mono text-slate-400">Project #{p.id}</span>
                          </div>
                          <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {p.status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs font-mono text-slate-500 mb-1.5">
                            <span className="uppercase font-semibold text-[10px]">Progress</span>
                            <span className="text-emerald-700 font-bold">{p.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>

                        {/* Current Task Box */}
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700">
                          <span className="text-slate-400 font-bold block mb-1 text-[10px] uppercase">Current Milestone Task:</span>
                          {p.pending_tasks || 'No immediate blockers listed'}
                        </div>

                        {/* Update Project Status Button */}
                        <button
                          onClick={() => setEditingProj({ ...p })}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl transition-all text-slate-700 border border-slate-200 cursor-pointer"
                        >
                          Update Project Status ✎
                        </button>

                        {/* Drawer Tabs */}
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setActiveTab({ ...activeTab, [p.id]: 'tasks' })}
                              className={`py-1.5 rounded-lg text-[11px] font-bold transition-all truncate cursor-pointer ${
                                currentTab === 'tasks' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              Tasks ({completedTasksCount}/{projTasks.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab({ ...activeTab, [p.id]: 'notes' })}
                              className={`py-1.5 rounded-lg text-[11px] font-bold transition-all truncate cursor-pointer ${
                                currentTab === 'notes' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              Notes ({(internalNotes[p.id] || []).length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab({ ...activeTab, [p.id]: 'files' })}
                              className={`py-1.5 rounded-lg text-[11px] font-bold transition-all truncate cursor-pointer ${
                                currentTab === 'files' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              Files
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab({ ...activeTab, [p.id]: 'timelog' })}
                              className={`py-1.5 rounded-lg text-[11px] font-bold transition-all truncate cursor-pointer ${
                                currentTab === 'timelog' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              ⏱️ Logs
                            </button>
                          </div>

                          {/* Tab 1: Task Checklist */}
                          {currentTab === 'tasks' && (
                            <div className="space-y-3 pt-1">
                              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {projTasks.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic py-2">No tasks added for this project yet.</p>
                                ) : (
                                  projTasks.map((t) => (
                                    <div
                                      key={t.id}
                                      onClick={() => handleToggleTask(t.id, p.id, t.is_completed)}
                                      className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={t.is_completed}
                                        onChange={() => {}}
                                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                                      />
                                      <span className={`text-xs ${t.is_completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'}`}>
                                        {t.task_title || t.title}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add checklist item..."
                                  value={newTaskTitle[p.id] || ''}
                                  onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [p.id]: e.target.value })}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(p.id); }}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddTask(p.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Tab 2: Studio Internal Notes */}
                          {currentTab === 'notes' && (
                            <div className="space-y-3 pt-1">
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-44 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {(!internalNotes[p.id] || internalNotes[p.id].length === 0) ? (
                                  <p className="text-xs text-slate-400 italic">No internal notes yet. Internal team notes are strictly hidden from clients.</p>
                                ) : (
                                  internalNotes[p.id].map((note: any) => (
                                    <div key={note.id} className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-1">
                                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                        <span className="font-bold text-emerald-700">
                                          {note.author?.full_name || 'Team Member'} ({note.author?.role})
                                        </span>
                                        <span>{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-xs text-slate-800">{note.note}</p>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Internal team note..."
                                  value={newNoteText[p.id] || ''}
                                  onChange={(e) => setNewNoteText({ ...newNoteText, [p.id]: e.target.value })}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(p.id); }}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddNote(p.id)}
                                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Tab 3: Project Files */}
                          {currentTab === 'files' && (
                            <div className="pt-1">
                              {user && (
                                <ProjectFileManager
                                  projectId={p.id}
                                  userId={user.id}
                                  canUpload={true}
                                />
                              )}
                            </div>
                          )}

                          {/* Tab 4: Time Tracking with Live Stopwatch & History */}
                          {currentTab === 'timelog' && (
                            <div className="pt-1 space-y-4">
                              {/* Live Stopwatch Module */}
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                                      Live Shift Stopwatch
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                      Track real-time sprint session
                                    </span>
                                  </div>
                                  <div className="font-mono font-bold text-base text-emerald-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                    {formatTimer(currentSecs)}
                                  </div>
                                </div>

                                <input
                                  type="text"
                                  placeholder="What module or task are you currently coding?"
                                  value={timerNotes[p.id] || ''}
                                  onChange={(e) => setTimerNotes({ ...timerNotes, [p.id]: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                                />

                                <div className="flex gap-2">
                                  {!isTiming ? (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleTimer(p.id)}
                                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                                    >
                                      ▶ Start Shift Timer
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleTimer(p.id)}
                                        className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                                      >
                                        ⏸ Pause
                                      </button>
                                      <button
                                        type="button"
                                        disabled={timerSaving}
                                        onClick={() => handleStopAndLogShift(p.id)}
                                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer animate-pulse disabled:opacity-50"
                                      >
                                        {timerSaving ? 'Saving...' : '⏹ Stop & Log Hours'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Manual Logs & History Table */}
                              {user && (
                                <ProjectTimeTracker
                                  projectId={p.id}
                                  userId={user.id}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Update Modal Popup */}
        {editingProj && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 md:p-7 rounded-2xl w-full max-w-md shadow-xl">
              <h3 className="text-base font-bold text-slate-900 mb-0.5">Update Sprint Progress</h3>
              <p className="text-xs text-slate-500 mb-4">{editingProj.title}</p>

              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={editingProj.status}
                    onChange={(e) => setEditingProj({ ...editingProj, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                    <label className="font-semibold text-[11px] uppercase">Progress Percentage</label>
                    <span className="text-emerald-700 font-bold">{editingProj.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingProj.progress || 0}
                    onChange={(e) => setEditingProj({ ...editingProj, progress: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Current Working Task</label>
                  <textarea
                    rows={3}
                    value={editingProj.pending_tasks || ''}
                    onChange={(e) => setEditingProj({ ...editingProj, pending_tasks: e.target.value })}
                    placeholder="E.g., Working on responsive navbar and API routes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProj(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}