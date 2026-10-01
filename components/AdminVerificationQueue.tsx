'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react';

export default function AdminVerificationQueue() {
  const [reviewTasks, setReviewTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPendingReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('project_tasks')
      .select(`
        id,
        project_id,
        title,
        status,
        proof_url,
        proof_notes,
        proof_submitted_at,
        assigned_to,
        project:projects(title),
        assignee:profiles(full_name, role)
      `)
      .eq('status', 'Under Review')
      .order('proof_submitted_at', { ascending: false });

    if (data) setReviewTasks(data);
    setLoading(false);
  };

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
  }, []);

  const handleApprove = async (taskId: number) => {
    setActionLoading(taskId);
    await supabase
      .from('project_tasks')
      .update({
        status: 'Done',
        is_completed: true,
      })
      .eq('id', taskId);

    fetchPendingReviews();
    setActionLoading(null);
  };

  const handleReject = async (taskId: number) => {
    const reason = prompt('Please specify rejection feedback or rework notes:');
    if (!reason) return;

    setActionLoading(taskId);
    await supabase
      .from('project_tasks')
      .update({
        status: 'In Progress',
        is_completed: false,
        proof_notes: `Rejected by Admin: ${reason}`,
      })
      .eq('id', taskId);

    fetchPendingReviews();
    setActionLoading(null);
  };

  if (loading) {
    return <div className="text-xs text-slate-400 font-mono py-6 text-center">Checking verification queue...</div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-slate-800" size={16} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Deliverable Proof Review Queue</h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
          {reviewTasks.length} Pending Verifications
        </span>
      </div>

      {reviewTasks.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-5 text-center flex items-center justify-center gap-1.5">
          <span className="text-emerald-600 font-bold">✓</span> All deliverables verified. No pending proof submissions for review.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {reviewTasks.map((t) => (
            <div key={t.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-lg min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">{t.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({t.project?.title || `PRJ-${t.project_id}`})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Submitted by: <strong>{t.assignee?.full_name || 'Team Member'}</strong></span>
                  <span>•</span>
                  <span>{new Date(t.proof_submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {t.proof_notes && <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">"{t.proof_notes}"</p>}
                {t.proof_url && (
                  <a
                    href={t.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    <ExternalLink size={12} /> Inspect Deliverable ({t.proof_url})
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReject(t.id)}
                  disabled={actionLoading === t.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                >
                  ✕ Reject / Rework
                </button>
                <button
                  onClick={() => handleApprove(t.id)}
                  disabled={actionLoading === t.id}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-black hover:bg-slate-800 text-white cursor-pointer shadow-xs"
                >
                  ✓ Approve as Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}