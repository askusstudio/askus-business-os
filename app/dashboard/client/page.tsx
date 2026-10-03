'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProjectFileManager from '@/components/ProjectFileManager';
import NotificationBell from '@/components/NotificationBell';
import VisualFeedbackCanvas from '@/components/VisualFeedbackCanvas';
import SlackWorkspaceChat from '@/components/SlackWorkspaceChat';
import { 
  FolderKanban, 
  FileCheck2, 
  CreditCard, 
  MessageSquare, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  QrCode,
  X,
  FileText
} from 'lucide-react';

export default function ClientDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any[]>>({});
  const [invoices, setInvoices] = useState<Record<string, any[]>>({});
  const [activeProjectTab, setActiveProjectTab] = useState<Record<string, 'overview' | 'tasks' | 'files' | 'invoices' | 'slack' | 'canvas'>>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Client Payment Modal State
  const [payingInvoice, setPayingInvoice] = useState<any | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const router = useRouter();

  const loadData = useCallback(async () => {
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
      setProfile(prof);

      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (projData && projData.length > 0) {
        setProjects(projData);
        const projectIds = projData.map((p) => p.id);

        const { data: taskData } = await supabase
          .from('project_tasks')
          .select('*')
          .in('project_id', projectIds)
          .order('position', { ascending: true });

        if (taskData) {
          const groupedTasks: Record<string, any[]> = {};
          taskData.forEach((t) => {
            if (!groupedTasks[t.project_id]) groupedTasks[t.project_id] = [];
            groupedTasks[t.project_id].push(t);
          });
          setTasks(groupedTasks);
        }

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

      const { data: annoData } = await supabase
        .from('studio_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (annoData) setAnnouncements(annoData);
    } catch (err) {
      console.error('Error loading client portal:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateSignoff = async (proj: any, decision: 'Approved' | 'Changes Requested') => {
    const confirmMsg = decision === 'Approved'
      ? 'Sign off and approve this deliverable milestone as completed?'
      : 'Request revisions from our engineering team? This will consume 1 revision credit.';

    if (!confirm(confirmMsg)) return;

    let updatedRevisions = proj.used_revisions || 0;
    if (decision === 'Changes Requested') updatedRevisions += 1;

    const { error } = await supabase
      .from('projects')
      .update({
        client_signoff: decision,
        used_revisions: updatedRevisions,
      })
      .eq('id', proj.id);

    if (!error) {
      loadData();
    } else {
      alert('Error updating milestone: ' + error.message);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setPaymentSubmitting(true);

    try {
      const { error } = await supabase
        .from('project_invoices')
        .update({
          payment_method: 'UPI',
          transaction_ref: paymentRef.trim() || `UPI-TXN-${Date.now().toString().slice(-6)}`,
          status: 'Processing',
        })
        .eq('id', payingInvoice.id);

      if (!error) {
        alert('Payment reference submitted! Verification in progress by AskUs Studio.');
        setPayingInvoice(null);
        setPaymentRef('');
        loadData();
      } else {
        alert('Error recording payment: ' + error.message);
      }
    } catch (err: any) {
      alert(err.message || 'Payment submission failed');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-black selection:text-white">
      {announcements.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-2 text-[11px] flex items-center gap-2 text-emerald-950">
          <span className="bg-emerald-700 text-white font-bold text-[9px] uppercase px-1.5 py-0.2 rounded-full">
            Notice
          </span>
          <span className="truncate">{announcements[0].message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs shrink-0">
              A
            </div>
            <div className="truncate">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate flex items-center gap-1.5">
                Client Portal
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                  External
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Deliverables, Invoices & Approvals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && <NotificationBell userId={user.id} />}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <section className="grid grid-cols-3 gap-2 sm:gap-3.5">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center sm:text-left">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Projects</span>
            <span className="text-base sm:text-2xl font-black text-slate-900 mt-0.5 block">{projects.length}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center sm:text-left">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Finished</span>
            <span className="text-base sm:text-2xl font-black text-emerald-700 mt-0.5 block">
              {projects.filter((p) => p.status === 'Completed' || p.progress === 100).length}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center sm:text-left">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Invoices</span>
            <span className="text-base sm:text-2xl font-black text-amber-700 mt-0.5 block">
              {Object.values(invoices).flat().filter((i) => i.status !== 'Paid').length}
            </span>
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-mono">Synchronizing workspace...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 p-8 rounded-xl text-center text-xs text-slate-400">
            No active projects connected to your account.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {projects.map((proj) => {
              const projInvoices = invoices[proj.id] || [];
              const projTasks = tasks[proj.id] || [];
              const currentTab = activeProjectTab[proj.id] || 'overview';
              const revisionsExhausted = (proj.used_revisions || 0) >= (proj.max_revisions || 3);
              const completedTasksCount = projTasks.filter((t) => t.is_completed).length;

              return (
                <div key={proj.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex flex-wrap justify-between items-start gap-2 pb-2 border-b border-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">{proj.title}</h2>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          #{proj.id}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {proj.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700">
                      Revisions: {proj.used_revisions || 0} / {proj.max_revisions || 3}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500 font-sans">Sprint Completion</span>
                      <span className="font-bold text-slate-900">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black transition-all" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>

                  {/* Sign-Off Action Card */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Milestone Status</span>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        Approval: <strong className="uppercase">{proj.client_signoff || 'Pending'}</strong>
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleUpdateSignoff(proj, 'Changes Requested')}
                        disabled={revisionsExhausted}
                        className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 cursor-pointer disabled:opacity-50"
                      >
                        Changes
                      </button>
                      <button
                        onClick={() => handleUpdateSignoff(proj, 'Approved')}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white cursor-pointer"
                      >
                        Approve ✓
                      </button>
                    </div>
                  </div>

                  {/* Sub-tabs Horizontal Scroll */}
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <div className="flex gap-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                      {[
                        { key: 'overview', label: '📌 Overview', icon: Layers },
                        { key: 'tasks', label: `🎯 Tasks (${completedTasksCount}/${projTasks.length})`, icon: FolderKanban },
                        { key: 'files', label: '📁 Files', icon: FileCheck2 },
                        { key: 'invoices', label: `💳 Invoices (${projInvoices.length})`, icon: CreditCard },
                        { key: 'slack', label: '💬 Slack', icon: MessageSquare },
                        ...(proj.preview_url ? [{ key: 'canvas', label: '🎨 Feedback', icon: ExternalLink }] : []),
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveProjectTab({ ...activeProjectTab, [proj.id]: tab.key as any })}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                              isActive ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon size={12} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {currentTab === 'overview' && (
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Sprint Focus</span>
                          <p className="text-slate-800 font-medium">{proj.pending_tasks || 'Ongoing deliverable sprint'}</p>
                        </div>
                        {proj.preview_url && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Live Staging Preview</span>
                            <a href={proj.preview_url} target="_blank" rel="noreferrer" className="font-bold text-slate-900 underline flex items-center gap-1 truncate">
                              <ExternalLink size={12} /> {proj.preview_url}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {currentTab === 'tasks' && (
                      <div className="space-y-2 pt-1">
                        {projTasks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-2">No tasks listed.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {projTasks.map((t) => (
                              <div key={t.id} className="p-2.5 rounded-lg border bg-white border-slate-200 flex items-center justify-between text-xs gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  {t.is_completed ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <Clock size={14} className="text-amber-500 shrink-0" />}
                                  <span className={`truncate ${t.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title || t.task_title}</span>
                                </div>
                                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">{t.status || 'To Do'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {currentTab === 'files' && user && (
                      <ProjectFileManager projectId={proj.id} userId={user.id} canUpload={true} />
                    )}

                    {/* INVOICES WITH PAYMENT OPTION & REMARKS */}
                    {currentTab === 'invoices' && (
                      <div className="space-y-2.5 pt-1">
                        {projInvoices.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-2">No invoices issued.</p>
                        ) : (
                          projInvoices.map((inv) => (
                            <div key={inv.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                              <div className="min-w-0 max-w-sm">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900">{inv.invoice_number}</span>
                                  <span className="font-bold text-emerald-700">₹{Number(inv.amount).toLocaleString()}</span>
                                  {inv.due_date && (
                                    <span className="text-[10px] text-slate-400 font-mono">Due: {inv.due_date}</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{inv.description || 'Milestone fee'}</p>

                                {/* Remarks section */}
                                {inv.remarks && (
                                  <div className="mt-1 flex items-start gap-1 text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <FileText size={11} className="shrink-0 mt-0.5 text-amber-600" />
                                    <span><strong>Remarks:</strong> {inv.remarks}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  inv.status === 'Paid' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                    : inv.status === 'Processing'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {inv.status}
                                </span>

                                {/* Pay Now Button if Unpaid */}
                                {inv.status !== 'Paid' && (
                                  <button
                                    onClick={() => setPayingInvoice(inv)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-2xs"
                                  >
                                    💳 Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {currentTab === 'slack' && user && (
                      <SlackWorkspaceChat
                        currentUser={{
                          id: user.id,
                          full_name: profile?.full_name || 'Client',
                          role: 'client',
                        }}
                      />
                    )}

                    {currentTab === 'canvas' && proj.preview_url && user && (
                      <VisualFeedbackCanvas projectId={proj.id} userId={user.id} previewUrl={proj.preview_url} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CLIENT INVOICE PAYMENT MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <QrCode size={16} className="text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase">Settle Invoice Payment</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Payable Amount</span>
              <p className="text-xl font-black text-slate-900">₹{Number(payingInvoice.amount).toLocaleString()}</p>
              <p className="text-[10px] font-mono text-slate-400">Invoice: {payingInvoice.invoice_number}</p>
            </div>

            {/* UPI QR Display Container */}
            <div className="flex flex-col items-center justify-center p-3 bg-white border border-dashed border-slate-200 rounded-xl space-y-2">
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden p-1">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=askus@upi%26pn=Askus%20Studio%26am=${payingInvoice.amount}%26cu=INR`} 
                  alt="Scan to Pay via UPI" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center font-mono">
                Scan with any UPI App (GPay, PhonePe, Paytm)
              </p>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                askus@upi
              </span>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  UPI UTR / Transaction Reference ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4289XXXXXXXX"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {paymentSubmitting ? 'Verifying...' : 'Submit Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}