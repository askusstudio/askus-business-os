'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { triggerNotification } from '@/lib/notifications';
import { ShieldCheck, ExternalLink, Image as ImageIcon, Hourglass, CheckCircle2 } from 'lucide-react';

export default function AdminVerificationQueue() {
  const [reviewTasks, setReviewTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentReviewer, setCurrentReviewer] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentReviewer(data.user);
    });
  }, []);

  const fetchPendingReviews = useCallback(async () => {
    try {
      const { data: tasksData, error } = await supabase
        .from('project_tasks')
        .select('*')
        .in('status', ['Under Review', 'Review'])
        .order('proof_submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching review tasks:', error);
        setLoading(false);
        return;
      }

      if (!tasksData || tasksData.length === 0) {
        setReviewTasks([]);
        setLoading(false);
        return;
      }

      const projectIds = Array.from(new Set(tasksData.map((t) => t.project_id).filter(Boolean)));
      const assigneeIds = Array.from(new Set(tasksData.map((t) => t.assigned_to).filter(Boolean)));

      const [projectsRes, profilesRes] = await Promise.all([
        projectIds.length > 0 
          ? supabase.from('projects').select('id, title').in('id', projectIds) 
          : Promise.resolve({ data: [] }),
        assigneeIds.length > 0 
          ? supabase.from('profiles').select('id, full_name, role').in('id', assigneeIds) 
          : Promise.resolve({ data: [] }),
      ]);

      const projectMap = new Map((projectsRes.data || []).map((p) => [p.id, p.title]));
      const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));

      const mergedTasks = tasksData.map((t) => ({
        ...t,
        project_title: projectMap.get(t.project_id) || `Project #${t.project_id}`,
        assignee_name: profileMap.get(t.assigned_to)?.full_name || 'Team Member',
      }));

      setReviewTasks(mergedTasks);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingReviews();

    const channel = supabase
      .channel('review_tasks_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks' }, () => {
        fetchPendingReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPendingReviews]);

  const handleApprove = async (task: any) => {
    setActionLoading(task.id);

    try {
      // 1. Mark task as Done
      const { error: taskError } = await supabase
        .from('project_tasks')
        .update({
          status: 'Done',
          is_completed: true,
          verified_at: new Date().toISOString(),
          verified_by: currentReviewer?.id || null,
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      // 2. Fetch all tasks for this project to calculate progress %
      const { data: allProjTasks } = await supabase
        .from('project_tasks')
        .select('id, status, is_completed')
        .eq('project_id', task.project_id);

      if (allProjTasks && allProjTasks.length > 0) {
        const completedCount = allProjTasks.filter(
          (t) => t.id === task.id || t.status === 'Done' || t.is_completed
        ).length;

        const newProgress = Math.round((completedCount / allProjTasks.length) * 100);

        // 3. Update project progress & status in DB
        await supabase
          .from('projects')
          .update({
            progress: newProgress,
            status: newProgress === 100 ? 'Completed' : 'In Progress',
          })
          .eq('id', task.project_id);
      }

      // 4. Trigger Notification to Employee
      if (task.assigned_to) {
        triggerNotification({
          userId: task.assigned_to,
          title: 'Task Approved! 🎉',
          message: `Your deliverable for "${task.title}" has been verified and marked Done.`,
          type: 'system',
          link: '/dashboard/employee',
        }).catch((err) => console.log('Notification error:', err));
      }

      fetchPendingReviews();
    } catch (err: any) {
      alert('Approval error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (task: any) => {
    const reason = prompt('Please specify rework feedback or rework notes:');
    if (!reason) return;

    setActionLoading(task.id);
    const { error } = await supabase
      .from('project_tasks')
      .update({
        status: 'In Progress',
        is_completed: false,
        proof_notes: `Rework Required: ${reason}`,
      })
      .eq('id', task.id);

    if (!error) {
      if (task.assigned_to) {
        triggerNotification({
          userId: task.assigned_to,
          title: 'Deliverable Needs Rework ⚠️',
          message: `Feedback for "${task.title}": ${reason}`,
          type: 'system',
          link: '/dashboard/employee',
        }).catch((err) => console.log('Notification error:', err));
      }
      fetchPendingReviews();
    } else {
      alert('Rejection error: ' + error.message);
    }
    setActionLoading(null);
  };

  if (loading) {
    return <div className="text-xs text-slate-400 font-mono py-4 text-center">Checking verification queue...</div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-700" size={16} />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Deliverable Proof Review Queue</h3>
            <p className="text-[10px] text-slate-400">Primary inspection by Manager & Admin</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
          {reviewTasks.length} Pending
        </span>
      </div>

      {reviewTasks.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-4 text-center flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600" /> All deliverables verified. No pending proof submissions.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {reviewTasks.map((t) => (
            <div key={t.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5 max-w-lg min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{t.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({t.project_title})</span>

                  {t.time_taken_minutes ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Hourglass size={10} />
                      {Math.floor(t.time_taken_minutes / 60)}h {t.time_taken_minutes % 60}m
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Submitted by: <strong>{t.assignee_name}</strong></span>
                  {t.proof_submitted_at && (
                    <>
                      <span>•</span>
                      <span>{new Date(t.proof_submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                </div>

                {t.proof_notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 wrap-break-word">
                    "{t.proof_notes}"
                  </p>
                )}

                <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                  {t.proof_url && (
                    <a
                      href={t.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline"
                    >
                      <ExternalLink size={12} /> Deliverable Link
                    </a>
                  )}

                  {t.proof_attachment_url && (
                    <a
                      href={t.proof_attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md"
                    >
                      <ImageIcon size={12} /> View Screenshot / File ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleReject(t)}
                  disabled={actionLoading === t.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer disabled:opacity-50"
                >
                  ✕ Rework
                </button>
                <button
                  onClick={() => handleApprove(t)}
                  disabled={actionLoading === t.id}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-black hover:bg-slate-800 text-white cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {actionLoading === t.id ? 'Approving...' : '✓ Approve as Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}