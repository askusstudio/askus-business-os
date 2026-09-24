'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProjectFileManager from '@/components/ProjectFileManager';
import NotificationBell from '@/components/NotificationBell';
import VisualFeedbackCanvas from '@/components/VisualFeedbackCanvas';

export default function ClientDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, any[]>>({});
  const [invoices, setInvoices] = useState<Record<string, any[]>>({});
  const [newFeedback, setNewFeedback] = useState<Record<string, string>>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const loadData = async () => {
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
    setProfile(prof);

    // Fetch projects assigned to this client
    const { data: projData } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (projData && projData.length > 0) {
      setProjects(projData);
      const projectIds = projData.map((p) => p.id);

      // Fetch feedbacks for client's projects
      const { data: fbData } = await supabase
        .from('project_feedbacks')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: true });

      if (fbData) {
        const groupedFb: Record<string, any[]> = {};
        fbData.forEach((fb) => {
          if (!groupedFb[fb.project_id]) groupedFb[fb.project_id] = [];
          groupedFb[fb.project_id].push(fb);
        });
        setFeedbacks(groupedFb);
      }

      // Fetch Invoices for client's projects
      const { data: invData } = await supabase
        .from('project_invoices')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (invData) {
        const groupedInv: Record<string, any[]> = {};
        invData.forEach((inv) => {
          if (!groupedInv[inv.project_id]) groupedInv[inv.project_id] = [];
          groupedInv[inv.project_id].push(inv);
        });
        setInvoices(groupedInv);
      }
    } else {
      setProjects([]);
    }

    // Active Global Broadcasts
    const { data: annoData } = await supabase
      .from('studio_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (annoData) setAnnouncements(annoData);

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('client_master_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_feedbacks' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_invoices' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleUpdateSignoff = async (proj: any, decision: 'Approved' | 'Changes Requested') => {
    const confirmMsg = decision === 'Approved'
      ? 'Sign off and approve this deliverable as completed?'
      : 'Request revisions from the studio team? This will consume 1 revision credit.';

    if (!confirm(confirmMsg)) return;

    let updatedRevisions = proj.used_revisions || 0;
    if (decision === 'Changes Requested') {
      updatedRevisions += 1;
    }

    const { error } = await supabase
      .from('projects')
      .update({
        client_signoff: decision,
        used_revisions: updatedRevisions,
      })
      .eq('id', proj.id);

    if (!error) {
      await supabase.from('studio_activity_logs').insert([
        {
          project_id: proj.id,
          actor_name: profile?.full_name || 'Client',
          action: `Deliverable milestone marked as: ${decision}`,
        },
      ]);
      loadData();
    } else {
      alert('Error updating milestone: ' + error.message);
    }
  };

  const handlePurchaseExtraRevisions = async (proj: any) => {
    const confirmed = confirm('Your revision limit is reached. Generate an invoice of ₹4,999 for 2 additional revisions?');
    if (!confirmed) return;

    const { error } = await supabase.from('project_invoices').insert([
      {
        project_id: proj.id,
        invoice_number: `INV-REV-${Date.now().toString().slice(-4)}`,
        amount: 4999,
        description: 'Scope Add-on: 2 Extra Project Revisions Pack',
        status: 'Unpaid',
      },
    ]);

    if (!error) {
      await supabase
        .from('projects')
        .update({ max_revisions: (proj.max_revisions || 3) + 2 })
        .eq('id', proj.id);

      alert('Add-on revision invoice generated! You can now request further changes.');
      loadData();
    } else {
      alert('Failed to generate add-on invoice: ' + error.message);
    }
  };

  const handleSendFeedback = async (projectId: string | number) => {
    const text = newFeedback[projectId]?.trim();
    if (!text || !user) return;

    setSending(true);
    const { error } = await supabase.from('project_feedbacks').insert([
      {
        project_id: projectId,
        client_id: user.id,
        message: text,
      },
    ]);

    setSending(false);
    if (!error) {
      setNewFeedback({ ...newFeedback, [projectId]: '' });
      loadData();
    } else {
      alert('Error sending message: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Broadcast Announcement Bar */}
      {announcements.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-2.5 max-w-5xl truncate">
            <span className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wide">
              Notice
            </span>
            <span className="font-medium truncate">{announcements[0].message}</span>
          </div>
        </div>
      )}

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
                CLIENT PORTAL
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Workspace
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">Welcome, {profile?.full_name || 'Client'}</p>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 font-mono">Loading your project workspace...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 p-12 rounded-2xl text-center space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">No Active Projects Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your account is active. Once our administration team allocates a project to your account, live deliverables and milestones will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {projects.map((proj) => {
              const projInvoices = invoices[proj.id] || [];
              const projFeedbacks = feedbacks[proj.id] || [];
              const revisionsExhausted = (proj.used_revisions || 0) >= (proj.max_revisions || 3);

              return (
                <div key={proj.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
                  {/* Project Title Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{proj.title}</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          #{proj.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Live tracking and asset collaboration</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {proj.status}
                      </span>
                      <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                        revisionsExhausted
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        Revisions: {proj.used_revisions || 0} / {proj.max_revisions || 3}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500 uppercase tracking-wider font-semibold">Completion Status</span>
                      <span className="text-emerald-700 font-bold">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones & Deliverables Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Current Milestone / Next Action
                      </span>
                      <p className="text-xs text-slate-800 font-medium">
                        {proj.pending_tasks || 'Ongoing sprint work'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Project Deliverable / Preview Link
                      </span>
                      {proj.preview_url ? (
                        <a
                          href={proj.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1.5 truncate"
                        >
                          ↗ Open Deliverable Link ({proj.preview_url})
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Deliverable will be posted here upon review</span>
                      )}
                    </div>
                  </div>

                  {/* Visual Frame Pin Feedback Canvas */}
                  {proj.preview_url && user && (
                    <div className="border-t border-slate-100 pt-5">
                      <VisualFeedbackCanvas
                        projectId={proj.id}
                        userId={user.id}
                        previewUrl={proj.preview_url}
                      />
                    </div>
                  )}

                  {/* Milestone Official Sign-Off with Scope Creep Blocker */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Milestone Approval & Sign-Off</span>
                      <span className="text-[11px] text-slate-500">
                        Current Status: <strong className="text-slate-700">{proj.client_signoff || 'Pending Review'}</strong> • Credits: <strong>{proj.used_revisions || 0} / {proj.max_revisions || 3} used</strong>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {revisionsExhausted ? (
                        <button
                          onClick={() => handlePurchaseExtraRevisions(proj)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          ⚡ Purchase Extra Revisions (₹4,999)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateSignoff(proj, 'Changes Requested')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors cursor-pointer"
                        >
                          🔄 Request Changes
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateSignoff(proj, 'Approved')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        ✅ Approve & Sign Off
                      </button>
                    </div>
                  </div>

                  {/* Project Assets & Files */}
                  <div className="border-t border-slate-100 pt-5">
                    {user && (
                      <ProjectFileManager projectId={proj.id} userId={user.id} canUpload={true} />
                    )}
                  </div>

                  {/* Invoices & Billing Strip */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">💳 Invoices & Payments</h3>
                      <span className="text-xs font-mono text-slate-500">{projInvoices.length} Bills</span>
                    </div>

                    {projInvoices.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-1">No pending invoices for this project.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {projInvoices.map((inv) => (
                          <div key={inv.id} className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{inv.invoice_number}</span>
                                <span className="text-emerald-700 font-semibold">₹{Number(inv.amount).toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] text-slate-500">{inv.description || 'Deliverable fee'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                inv.status === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {inv.status}
                              </span>
                              {inv.status !== 'Paid' && (
                                <button
                                  onClick={() => alert('Please complete the bank transfer / UPI payment to our studio account. Mark as paid will be reflected after verification.')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] cursor-pointer shadow-xs"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback & Discussion Channel */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">💬 Project Notes & Feedback</h3>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {projFeedbacks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No notes or revision requests yet. Leave a message below for the lead developer.</p>
                      ) : (
                        projFeedbacks.map((fb) => (
                          <div key={fb.id} className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
                            <p className="text-slate-800">{fb.message}</p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(fb.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a revision request or feedback message..."
                        value={newFeedback[proj.id] || ''}
                        onChange={(e) => setNewFeedback({ ...newFeedback, [proj.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendFeedback(proj.id); }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        disabled={sending}
                        onClick={() => handleSendFeedback(proj.id)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {sending ? 'Posting...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}