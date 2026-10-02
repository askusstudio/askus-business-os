'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProjectFileManager from '@/components/ProjectFileManager';
import ProjectTimeTracker from '@/components/ProjectTimeTracker';
import NotificationBell from '@/components/NotificationBell';
import SlackWorkspaceChat from '@/components/SlackWorkspaceChat';
import { 
  FolderKanban, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  Image as ImageIcon, 
  X,
  Hourglass
} from 'lucide-react';

export function calculateDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any[]>>({});
  const [internalNotes, setInternalNotes] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'tasks' | 'notes' | 'files' | 'timelog'>>({});
  const [mainView, setMainView] = useState<'workspaces' | 'slack'>('workspaces');
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});

  // Availability status state
  const [availability, setAvailability] = useState<'available' | 'busy' | 'on_leave'>('available');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Shift Stopwatch State
  const [timerActive, setTimerActive] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState<Record<string, number>>({});
  const [timerNotes, setTimerNotes] = useState<Record<string, string>>({});
  const [timerSaving, setTimerSaving] = useState(false);

  // Proof of Work Modal State
  const [submittingProofTask, setSubmittingProofTask] = useState<any | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Stopwatch ticking
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
    const desc = timerNotes[projectId]?.trim() || 'Verified Sprint Session';

    const { error } = await supabase.from('project_time_logs').insert([
      {
        project_id: Number(projectId) || projectId,
        employee_id: user?.id,
        hours_logged: hours,
        description: desc,
        is_verified: true,
      },
    ]);

    setTimerSaving(false);
    if (!error) {
      setTimerActive({ ...timerActive, [projectId]: false });
      setTimerSeconds({ ...timerSeconds, [projectId]: 0 });
      setTimerNotes({ ...timerNotes, [projectId]: '' });
      alert(`Shift successfully logged: ${hours} hrs.`);
    } else {
      alert('Error logging shift: ' + error.message);
    }
  };

  const fetchEmployeeData = useCallback(async () => {
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      setUser(currentUser);

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!prof) {
        router.push('/login');
        return;
      }
      setProfile(prof);
      setAvailability(prof.availability_status || 'available');

      // Projects where user is owner / lead
      const { data: leadProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('assigned_to', currentUser.id);

      // Tasks directly assigned to this employee
      const { data: myAssignedTasks } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('assigned_to', currentUser.id);

      const taskProjectIds = (myAssignedTasks || []).map((t) => t.project_id);
      const leadProjectIds = (leadProjects || []).map((p) => p.id);
      const allUniqueProjectIds = Array.from(new Set([...leadProjectIds, ...taskProjectIds]));

      if (allUniqueProjectIds.length > 0) {
        const { data: allProjs } = await supabase
          .from('projects')
          .select('*')
          .in('id', allUniqueProjectIds)
          .order('created_at', { ascending: false });

        if (allProjs) setAssignedProjects(allProjs);

        const groupedTasks: Record<string, any[]> = {};
        (myAssignedTasks || []).forEach((t) => {
          if (!groupedTasks[t.project_id]) groupedTasks[t.project_id] = [];
          groupedTasks[t.project_id].push(t);
        });
        setTasks(groupedTasks);

        const { data: notesData } = await supabase
          .from('project_internal_notes')
          .select(`id, project_id, note, created_at, author:profiles(full_name, role)`)
          .in('project_id', allUniqueProjectIds)
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
        setTasks({});
      }
    } catch (err) {
      console.error('Error fetching employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const handleAvailabilityChange = async (newStatus: 'available' | 'busy' | 'on_leave') => {
    if (!user) return;
    setUpdatingAvailability(true);
    setAvailability(newStatus);

    const { error } = await supabase
      .from('profiles')
      .update({ availability_status: newStatus })
      .eq('id', user.id);

    setUpdatingAvailability(false);
    if (error) {
      alert('Error updating status: ' + error.message);
      setAvailability(profile?.availability_status || 'available');
    }
  };

  const handleInitiateTaskCompletion = (task: any, projectId: string | number) => {
    if (task.is_completed) return;
    if (task.status === 'Under Review') {
      alert('Aapka proof already submit ho chuka hai aur Admin review ke liye pending hai.');
      return;
    }
    setSubmittingProofTask({ ...task, currentProjectId: projectId });
    setProofUrl(task.proof_url || '');
    setProofNotes(task.proof_notes || '');
    setProofFile(null);
  };

  const handleSubmitProofOfWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingProofTask) return;

    if (!proofUrl.trim() && !proofFile) {
      alert('Deliverable link ya screenshot file me se kam se kam ek cheez provide karein.');
      return;
    }

    setProofLoading(true);

    try {
      let attachmentPublicUrl = submittingProofTask.proof_attachment_url || null;

      // 1. File Upload to Supabase Storage
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${submittingProofTask.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('task-proofs')
          .upload(fileName, proofFile);

        if (uploadError) {
          throw new Error('Screenshot upload fail: ' + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from('task-proofs')
          .getPublicUrl(fileName);

        attachmentPublicUrl = urlData.publicUrl;
      }

      // 2. Exact Duration Calculation (Time Taken)
      const now = new Date();
      const startTime = submittingProofTask.started_at 
        ? new Date(submittingProofTask.started_at) 
        : (submittingProofTask.created_at ? new Date(submittingProofTask.created_at) : now);
      
      const diffMinutes = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / (1000 * 60)));

      // 3. Database Update with Time & Next Stage
      const { error } = await supabase
        .from('project_tasks')
        .update({
          status: 'Under Review',
          proof_url: proofUrl.trim() || null,
          proof_notes: proofNotes.trim() || null,
          proof_attachment_url: attachmentPublicUrl,
          proof_submitted_at: now.toISOString(),
          completed_at: now.toISOString(),
          time_taken_minutes: diffMinutes,
          is_completed: false,
        })
        .eq('id', submittingProofTask.id);

      if (error) throw error;

      alert(`Proof submitted! Stage updated to 'Under Review'. Time taken: ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`);
      setSubmittingProofTask(null);
      setProofFile(null);
      setProofUrl('');
      setProofNotes('');
      fetchEmployeeData();
    } catch (err: any) {
      alert(err.message || 'Error submitting proof');
    } finally {
      setProofLoading(false);
    }
  };

  const handleAddTask = async (projectId: string | number) => {
    const titleText = newTaskTitle[projectId]?.trim();
    if (!titleText || !user) return;

    const { data, error } = await supabase
      .from('project_tasks')
      .insert([{ 
        project_id: Number(projectId) || projectId, 
        title: titleText, 
        status: 'To Do', 
        is_completed: false, 
        assigned_to: user.id,
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), data],
      }));
      setNewTaskTitle({ ...newTaskTitle, [projectId]: '' });
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
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center shrink-0 bg-white">
              <img src="/logo/site-logo.jpg" alt="Askus" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 truncate">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 uppercase truncate">
                  WORKSPACE
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
                  {profile?.role?.replace('_', ' ') || 'Team'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{profile?.full_name || 'Team Member'}</p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative">
              <select
                value={availability}
                disabled={updatingAvailability}
                onChange={(e) => handleAvailabilityChange(e.target.value as any)}
                className={`text-[10px] sm:text-xs font-bold rounded-lg px-2 py-1 sm:py-1.5 border outline-none cursor-pointer transition-all shadow-2xs ${
                  availability === 'available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : availability === 'busy'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                <option value="available">🟢 Available</option>
                <option value="busy">🟡 Busy</option>
                <option value="on_leave">🔴 On Leave</option>
              </select>
            </div>

            {user && <NotificationBell userId={user.id} />}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex gap-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setMainView('workspaces')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer ${
              mainView === 'workspaces' ? 'border-black text-black' : 'border-transparent text-slate-400'
            }`}
          >
            <FolderKanban size={13} />
            <span>Tasks & Projects ({assignedProjects.length})</span>
          </button>
          <button
            onClick={() => setMainView('slack')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer ${
              mainView === 'slack' ? 'border-black text-black' : 'border-transparent text-slate-400'
            }`}
          >
            <MessageSquare size={13} />
            <span>Slack Live Room</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-5">
        {mainView === 'slack' ? (
          user && profile && (
            <SlackWorkspaceChat
              currentUser={{
                id: user.id,
                full_name: profile.full_name || 'Team Member',
                role: profile.role || 'employee',
              }}
            />
          )
        ) : (
          <>
            {/* KPI Cards */}
            <section className="grid grid-cols-3 gap-2 sm:gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Projects</span>
                <span className="text-lg sm:text-2xl font-bold mt-1 text-slate-900 block">{assignedProjects.length}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pending</span>
                <span className="text-lg sm:text-2xl font-bold mt-1 text-emerald-700 block">
                  {Object.values(tasks).flat().filter((t) => !t.is_completed).length}
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Verified</span>
                <span className="text-lg sm:text-2xl font-bold mt-1 text-slate-900 block">
                  {Object.values(tasks).flat().filter((t) => t.is_completed).length}
                </span>
              </div>
            </section>

            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400 font-mono">Loading workspace...</div>
            ) : assignedProjects.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 p-8 rounded-xl text-center text-xs text-slate-400">
                No active projects assigned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {assignedProjects.map((p) => {
                  const currentTab = activeTab[p.id] || 'tasks';
                  const projTasks = tasks[p.id] || [];
                  const isTiming = timerActive[p.id] || false;
                  const currentSecs = timerSeconds[p.id] || 0;

                  return (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{p.title}</h3>
                          <span className="text-[10px] font-mono text-slate-400">PRJ-#{p.id}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {p.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-slate-500">
                          <span className="text-[10px] uppercase">Progress</span>
                          <span className="font-bold text-slate-900">{p.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-black transition-all" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>

                      {/* Sub-tabs */}
                      <div className="border-t border-slate-100 pt-3 space-y-3">
                        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-center">
                          {[
                            { key: 'tasks', label: `Tasks (${projTasks.length})` },
                            { key: 'notes', label: 'Notes' },
                            { key: 'files', label: 'Files' },
                            { key: 'timelog', label: 'Timer' },
                          ].map((t) => (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setActiveTab({ ...activeTab, [p.id]: t.key as any })}
                              className={`py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold truncate transition-colors cursor-pointer ${
                                currentTab === t.key ? 'bg-white text-black shadow-2xs' : 'text-slate-500'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Task Checklist */}
                        {currentTab === 'tasks' && (
                          <div className="space-y-2 pt-1">
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {projTasks.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2 text-center">No tasks assigned.</p>
                              ) : (
                                projTasks.map((t) => (
                                  <div
                                    key={t.id}
                                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                                      t.is_completed ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <button
                                        type="button"
                                        onClick={() => handleInitiateTaskCompletion(t, p.id)}
                                        className="shrink-0 cursor-pointer"
                                      >
                                        {t.is_completed ? (
                                          <CheckCircle2 size={16} className="text-emerald-600" />
                                        ) : t.status === 'Under Review' ? (
                                          <Clock size={16} className="text-amber-500" />
                                        ) : (
                                          <div className="w-3.5 h-3.5 rounded border border-slate-300" />
                                        )}
                                      </button>
                                      
                                      <div className="truncate">
                                        <p className={`truncate text-xs ${t.is_completed ? 'line-through' : 'text-slate-800'}`}>
                                          {t.title || t.task_title}
                                        </p>
                                        {/* Time duration badge if recorded */}
                                        {t.time_taken_minutes ? (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">
                                            <Hourglass size={9} /> {Math.floor(t.time_taken_minutes / 60)}h {t.time_taken_minutes % 60}m
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-1.5">
                                      {t.is_completed ? (
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Done</span>
                                      ) : t.status === 'Under Review' ? (
                                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Review</span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleInitiateTaskCompletion(t, p.id)}
                                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-black text-white hover:bg-slate-800 cursor-pointer"
                                        >
                                          Proof
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Add task..."
                                value={newTaskTitle[p.id] || ''}
                                onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [p.id]: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(p.id); }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddTask(p.id)}
                                className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Internal Notes */}
                        {currentTab === 'notes' && (
                          <div className="space-y-2 pt-1">
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {(!internalNotes[p.id] || internalNotes[p.id].length === 0) ? (
                                <p className="text-xs text-slate-400 italic py-2 text-center">No internal notes.</p>
                              ) : (
                                internalNotes[p.id].map((n: any) => (
                                  <div key={n.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                                    <span className="text-[9px] font-bold text-emerald-800 block">{n.author?.full_name || 'Member'}</span>
                                    <p className="text-slate-700 text-[11px] mt-0.5">{n.note}</p>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Add note..."
                                value={newNoteText[p.id] || ''}
                                onChange={(e) => setNewNoteText({ ...newNoteText, [p.id]: e.target.value })}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddNote(p.id)}
                                className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Files */}
                        {currentTab === 'files' && user && (
                          <ProjectFileManager projectId={p.id} userId={user.id} canUpload={true} />
                        )}

                        {/* Stopwatch */}
                        {currentTab === 'timelog' && (
                          <div className="space-y-3 pt-1">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">Shift Timer</span>
                                <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {formatTimer(currentSecs)}
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Working notes..."
                                value={timerNotes[p.id] || ''}
                                onChange={(e) => setTimerNotes({ ...timerNotes, [p.id]: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                              />
                              <div className="flex gap-2">
                                {!isTiming ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTimer(p.id)}
                                    className="w-full py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                                  >
                                    ▶ Start Shift
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleTimer(p.id)}
                                      className="py-1.5 px-3 bg-amber-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                      Pause
                                    </button>
                                    <button
                                      type="button"
                                      disabled={timerSaving}
                                      onClick={() => handleStopAndLogShift(p.id)}
                                      className="flex-1 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                      {timerSaving ? 'Saving...' : 'Stop & Log'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {user && <ProjectTimeTracker projectId={p.id} userId={user.id} />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Proof Submission Modal */}
      {submittingProofTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-700" />
                Submit Proof of Work
              </h3>
              <button 
                type="button" 
                onClick={() => setSubmittingProofTask(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-semibold line-clamp-1">{submittingProofTask.title}</p>
            
            <form onSubmit={handleSubmitProofOfWork} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Deliverable / PR / Staging Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-black"
                />
              </div>

              {/* Screenshot / File attachment input */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Upload Screenshot / Proof File
                </label>
                <label className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf,.zip"
                    className="hidden"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {proofFile ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium w-full justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <ImageIcon size={14} className="text-emerald-600 shrink-0" />
                        <span className="truncate text-[11px]">{proofFile.name}</span>
                      </div>
                      <span 
                        className="text-[10px] text-rose-500 font-bold hover:underline shrink-0" 
                        onClick={(e) => { e.preventDefault(); setProofFile(null); }}
                      >
                        Remove
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <UploadCloud size={20} />
                      <span className="text-[11px]">Click to upload screenshot or file</span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Summary Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  placeholder="Brief details about what you completed..."
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSubmittingProofTask(null)}
                  disabled={proofLoading}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proofLoading || (!proofUrl.trim() && !proofFile)}
                  className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {proofLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}