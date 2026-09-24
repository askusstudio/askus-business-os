'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProjectFileManager from '@/components/ProjectFileManager';
import ProjectTimeTracker from '@/components/ProjectTimeTracker';
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard';
import ProjectBriefViewer from '@/components/ProjectBriefViewer';
import DeliverableVersionManager from '@/components/DeliverableVersionManager';
import FinancialProfitabilityAnalytics from '@/components/FinancialProfitabilityAnalytics';
import NotificationBell from '@/components/NotificationBell';

const ROLE_HIERARCHY = [
  { key: 'admin', label: 'Admin', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'director', label: 'Director', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'senior_manager', label: 'Sr. Manager', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'manager', label: 'Manager', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'executive', label: 'Executive', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'intern', label: 'Intern', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [totalHoursWorked, setTotalHoursWorked] = useState<number>(0);
  const [projectHoursMap, setProjectHoursMap] = useState<Record<string, number>>({});
  const [taskStats, setTaskStats] = useState<{ total: number; completed: number }>({ total: 0, completed: 0 });
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeProjectTab, setActiveProjectTab] = useState<Record<string, 'files' | 'timelog' | 'invoices' | 'kanban' | 'brief' | 'versions'>>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    client_id: '',
    assigned_to: '',
    status: 'In Progress',
    progress: 0,
    pending_tasks: '',
    preview_url: '',
    max_revisions: 3,
  });

  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'client',
  });

  // Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    project_id: '',
    client_id: '',
    amount: '',
    due_date: '',
    description: '',
  });

  // Broadcast & CRM State
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const router = useRouter();

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUserId(user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push('/dashboard/client');
      return;
    }

    const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    const { data: inqData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });

    const { data: empData } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'client')
      .order('created_at', { ascending: true });

    const { data: clientData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: true });

    const { data: fbData } = await supabase
      .from('project_feedbacks')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: invData } = await supabase
      .from('project_invoices')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: logsData } = await supabase
      .from('studio_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: annoData } = await supabase
      .from('studio_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data: timeLogsData } = await supabase.from('project_time_logs').select('project_id, hours_logged, hours');
    if (timeLogsData) {
      const overallHours = timeLogsData.reduce((acc, curr) => acc + Number(curr.hours_logged || curr.hours || 0), 0);
      setTotalHoursWorked(overallHours);

      const perProjectMap: Record<string, number> = {};
      timeLogsData.forEach((t) => {
        perProjectMap[t.project_id] = (perProjectMap[t.project_id] || 0) + Number(t.hours_logged || t.hours || 0);
      });
      setProjectHoursMap(perProjectMap);
    }

    const { data: tasksData } = await supabase.from('project_tasks').select('is_completed');
    if (tasksData) {
      const completed = tasksData.filter((t) => t.is_completed).length;
      setTaskStats({ total: tasksData.length, completed });
    }

    if (projData) setProjects(projData);
    if (inqData) setInquiries(inqData);
    if (empData) setEmployees(empData);
    if (clientData) setClients(clientData);
    if (fbData) setFeedbacks(fbData);
    if (invData) setInvoices(invData);
    if (logsData) setActivityLogs(logsData);
    if (annoData) setAnnouncements(annoData);

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('admin_master_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_feedbacks' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_invoices' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_activity_logs' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_announcements' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Feature 1: Invoicing Actions
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.project_id || !newInvoice.amount) return;
    setCreatingInvoice(true);

    const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from('project_invoices').insert([
      {
        project_id: Number(newInvoice.project_id),
        client_id: newInvoice.client_id || null,
        invoice_number: invoiceNum,
        amount: Number(newInvoice.amount),
        currency: 'INR',
        due_date: newInvoice.due_date || null,
        description: newInvoice.description || 'Milestone Deliverable Fee',
        status: 'Unpaid',
      },
    ]);

    if (!error) {
      await supabase.from('studio_activity_logs').insert([
        {
          project_id: Number(newInvoice.project_id),
          actor_name: 'Admin',
          action: `Generated Invoice #${invoiceNum} for ₹${Number(newInvoice.amount).toLocaleString()}`,
        },
      ]);
      setShowInvoiceModal(false);
      setNewInvoice({ project_id: '', client_id: '', amount: '', due_date: '', description: '' });
      loadData();
    } else {
      alert('Error creating invoice: ' + error.message);
    }
    setCreatingInvoice(false);
  };

  const handleToggleInvoiceStatus = async (invId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    await supabase.from('project_invoices').update({ status: nextStatus, paid_at: nextStatus === 'Paid' ? new Date() : null }).eq('id', invId);
    loadData();
  };

  // Feature 2: CRM Lead Conversion
  const handleConvertInquiry = async (inq: any) => {
    if (!confirm(`Convert lead "${inq.full_name || inq.name}" into client and auto-create project?`)) return;
    setConvertingId(inq.id);

    try {
      const res = await fetch('/api/admin/convert-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: inq.id,
          name: inq.full_name || inq.name || 'Valued Client',
          email: inq.email,
          projectTitle: `${inq.subject || inq.service || 'Client Platform'} Project`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');

      alert(`Success! Created client account for ${inq.email}`);
      loadData();
    } catch (err: any) {
      alert('Conversion error: ' + err.message);
    } finally {
      setConvertingId(null);
    }
  };

  // Feature 7: Broadcast Announcements
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setBroadcasting(true);

    const { error } = await supabase.from('studio_announcements').insert([
      { message: newAnnouncement, type: 'info', is_active: true },
    ]);

    if (!error) {
      setNewAnnouncement('');
      loadData();
    } else {
      alert('Error broadcasting: ' + error.message);
    }
    setBroadcasting(false);
  };

  const handleDismissAnnouncement = async (id: number) => {
    await supabase.from('studio_announcements').update({ is_active: false }).eq('id', id);
    loadData();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setShowUserModal(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'client' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    setCreatingProject(true);

    const payload = {
      title: newProject.title,
      status: newProject.status,
      progress: Number(newProject.progress),
      pending_tasks: newProject.pending_tasks,
      preview_url: newProject.preview_url || null,
      client_id: newProject.client_id || null,
      assigned_to: newProject.assigned_to || null,
      max_revisions: Number(newProject.max_revisions) || 3,
      used_revisions: 0,
      client_signoff: 'Pending',
    };

    const { error } = await supabase.from('projects').insert([payload]);
    setCreatingProject(false);
    if (!error) {
      setShowProjectModal(false);
      setNewProject({ title: '', client_id: '', assigned_to: '', status: 'In Progress', progress: 0, pending_tasks: '', preview_url: '', max_revisions: 3 });
      loadData();
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setUpdating(true);

    const payload = {
      title: editingProject.title,
      status: editingProject.status,
      progress: Number(editingProject.progress),
      pending_tasks: editingProject.pending_tasks,
      preview_url: editingProject.preview_url || null,
      client_id: editingProject.client_id || null,
      assigned_to: editingProject.assigned_to || null,
      max_revisions: Number(editingProject.max_revisions) || 3,
      used_revisions: Number(editingProject.used_revisions) || 0,
      client_signoff: editingProject.client_signoff || 'Pending',
    };

    const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id);
    setUpdating(false);
    if (!error) {
      setEditingProject(null);
      loadData();
    } else {
      alert(error.message);
    }
  };

  const handleDeleteProject = async (projectId: string | number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (!error) {
      setEditingProject(null);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Broadcast Notice Bar */}
      {announcements.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-2.5 max-w-5xl truncate">
            <span className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wide">
              Notice
            </span>
            <span className="font-medium truncate">{announcements[0].message}</span>
          </div>
          <button
            onClick={() => handleDismissAnnouncement(announcements[0].id)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-3 text-xs cursor-pointer"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Clean White Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                ADMIN MASTER CONSOLE
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Super Admin
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">Agency Operations & Financial Control</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
            >
              💳 + Invoice
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              + User
            </button>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              + Project
            </button>
            {currentUserId && <NotificationBell userId={currentUserId} />}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
        {/* KPI Strip */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
          {[
            { label: 'Active Projects', val: projects.length, highlight: 'text-emerald-700' },
            { label: 'Total Invoiced', val: `₹${invoices.reduce((a, c) => a + Number(c.amount || 0), 0).toLocaleString()}`, highlight: 'text-slate-900' },
            { label: 'Team Members', val: employees.length, highlight: 'text-slate-900' },
            { label: 'Time Tracked', val: `${totalHoursWorked.toFixed(1)}h`, highlight: 'text-slate-900' },
            { label: 'Tasks Done', val: `${taskStats.completed}/${taskStats.total}`, highlight: 'text-slate-900' },
            { label: 'CRM Leads', val: inquiries.length, highlight: 'text-sky-700' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
              <span className={`text-2xl font-bold mt-2 tracking-tight ${item.highlight}`}>
                {item.val}
              </span>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 font-mono">Loading operations workspace...</div>
        ) : (
          <>
            {/* Split Screen Master Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Projects & Tabs + Financial Profitability Analytics (7 Cols) */}
              <section className="lg:col-span-7 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Client Deliverables</h2>
                      <p className="text-xs text-slate-500">Kanban sprints, version annotations, briefs & logs</p>
                    </div>
                    <span className="text-xs font-mono text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                      {projects.length} Total
                    </span>
                  </div>

                  {projects.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
                      No active projects. Click "+ Project" to launch one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((proj) => {
                        const assignedClient = clients.find((c) => c.id === proj.client_id);
                        const assignedEmp = employees.find((e) => e.id === proj.assigned_to);
                        const currentTab = activeProjectTab[proj.id] || 'files';
                        const loggedHours = projectHoursMap[proj.id] || 0;
                        const projInvoices = invoices.filter((i) => String(i.project_id) === String(proj.id));

                        return (
                          <div key={proj.id} className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all">
                            {/* Project Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-sm text-slate-900 truncate">{proj.title}</h3>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                    #{proj.id}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                                  <span>Client: <strong className="text-slate-800">{assignedClient?.full_name || 'Unassigned'}</strong></span>
                                  <span className="text-slate-300">•</span>
                                  <span>Lead: <strong className="text-slate-800">{assignedEmp?.full_name || 'Unassigned'}</strong></span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    proj.client_signoff === 'Approved'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : proj.client_signoff === 'Changes Requested'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    Sign-off: {proj.client_signoff || 'Pending'}
                                  </span>
                                  <button
                                    onClick={() => setEditingProject(proj)}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                </div>

                                <div className="text-[10px] font-mono text-slate-500">
                                  Revisions: <span className="text-emerald-700 font-bold">{proj.used_revisions || 0}</span> / {proj.max_revisions || 3}
                                </div>
                              </div>
                            </div>

                            {/* Progress Line */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-slate-500">Completion</span>
                                <span className="text-emerald-700 font-bold">{proj.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${proj.progress}%` }} />
                              </div>
                            </div>

                            {/* Milestone Box & Link */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <div className="truncate text-slate-700">
                                <span className="text-slate-400 font-medium mr-1.5">Milestone:</span>
                                {proj.pending_tasks || 'No current blockers'}
                              </div>
                              {proj.preview_url && (
                                <a href={proj.preview_url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-emerald-700 hover:underline shrink-0">
                                  ↗ Open Deliverable
                                </a>
                              )}
                            </div>

                            {/* 6 Tabs Drawer Navigation */}
                            <div className="border-t border-slate-100 pt-3.5 space-y-3">
                              <div className="flex gap-1.5 flex-wrap">
                                {[
                                  { key: 'files', label: '📁 Files' },
                                  { key: 'kanban', label: '📌 Kanban Sprint' },
                                  { key: 'brief', label: '📋 Brief' },
                                  { key: 'versions', label: '🎨 Versions' },
                                  { key: 'timelog', label: `⏱️ Time (${loggedHours.toFixed(1)}h)` },
                                  { key: 'invoices', label: `💳 Invoices (${projInvoices.length})` },
                                ].map((tabItem) => (
                                  <button
                                    key={tabItem.key}
                                    onClick={() => setActiveProjectTab({ ...activeProjectTab, [proj.id]: tabItem.key as any })}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      currentTab === tabItem.key
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
                                    }`}
                                  >
                                    {tabItem.label}
                                  </button>
                                ))}
                              </div>

                              {/* Tab Views */}
                              {currentTab === 'files' && currentUserId && (
                                <ProjectFileManager projectId={proj.id} userId={currentUserId} canUpload={true} />
                              )}
                              {currentTab === 'kanban' && <ProjectKanbanBoard projectId={proj.id} />}
                              {currentTab === 'brief' && <ProjectBriefViewer projectId={proj.id} />}
                              {currentTab === 'versions' && currentUserId && (
                                <DeliverableVersionManager projectId={proj.id} currentUserId={currentUserId} />
                              )}
                              {currentTab === 'timelog' && currentUserId && (
                                <ProjectTimeTracker projectId={proj.id} userId={currentUserId} />
                              )}
                              {currentTab === 'invoices' && (
                                <div className="space-y-2 pt-1">
                                  {projInvoices.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2">No invoices issued for this project.</p>
                                  ) : (
                                    projInvoices.map((inv) => (
                                      <div key={inv.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{inv.invoice_number}</span>
                                            <span className="text-emerald-700 font-semibold">₹{Number(inv.amount).toLocaleString()}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500">{inv.description || 'Milestone fee'}</p>
                                        </div>
                                        <button
                                          onClick={() => handleToggleInvoiceStatus(inv.id, inv.status)}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                                            inv.status === 'Paid'
                                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-emerald-100'
                                          }`}
                                        >
                                          {inv.status === 'Paid' ? '✓ Paid' : 'Mark as Paid'}
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Left Side Balanced: Financial Profitability Chart */}
                <FinancialProfitabilityAnalytics
                  projects={projects}
                  invoices={invoices}
                  projectHoursMap={projectHoursMap}
                />
              </section>

              {/* Right Column: CRM Leads, Feedbacks & Live Audit Trail (5 Cols) */}
              <section className="lg:col-span-5 space-y-5">
                
                {/* CRM Lead Pipeline */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">CRM Lead Pipeline</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                        {inquiries.length} leads
                      </span>
                    </div>
                  </div>

                  {inquiries.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">No leads in pipeline.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                      {inquiries.map((inq) => {
                        const isConverted = inq.status === 'Converted';
                        return (
                          <div key={inq.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-900">{inq.full_name || inq.name || 'Prospect'}</span>
                                <p className="text-[11px] text-slate-500">{inq.email}</p>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                isConverted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}>
                                {inq.status || 'New'}
                              </span>
                            </div>

                            {inq.message && (
                              <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded border border-slate-200">
                                "{inq.message}"
                              </p>
                            )}

                            {!isConverted && (
                              <button
                                onClick={() => handleConvertInquiry(inq)}
                                disabled={convertingId === inq.id}
                                className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                              >
                                {convertingId === inq.id ? 'Converting...' : '⚡ Convert to Client & Launch Project'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Client Feedbacks */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Feedbacks</h2>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700">{feedbacks.length} notes</span>
                  </div>

                  {feedbacks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">No feedback recorded yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {feedbacks.map((fb) => (
                        <div key={fb.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <p className="text-slate-800">"{fb.message}"</p>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Project #{fb.project_id}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Studio Audit Trail */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Studio Audit Trail</h2>
                    <span className="text-[10px] font-mono text-slate-400">Live feed</span>
                  </div>

                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">No recent activities logged.</p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 font-mono text-[11px]">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">●</span>
                          <div className="min-w-0">
                            <p className="truncate">{log.action}</p>
                            <span className="text-[9px] text-slate-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </section>

            </div>

            {/* Bottom Section: Team Capacity Heatmap & Notice Publisher */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-slate-200 pt-7">
              
              {/* Team Capacity Heatmap (8 Cols) */}
              <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Team Capacity & Workload Heatmap</h2>
                    <p className="text-xs text-slate-500">Real-time allocation and project loads</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">{employees.length} Studio Leads</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employees.map((emp) => {
                    const assignedProjs = projects.filter((p) => p.assigned_to === emp.id);
                    const isBusy = assignedProjs.length > 0;

                    return (
                      <div key={emp.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{emp.full_name || 'Member'}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">{emp.role}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{emp.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isBusy ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {isBusy ? `${assignedProjs.length} Active` : 'Available'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Broadcast Notice Publisher (4 Cols) */}
              <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Broadcast Notice</h2>
                  <p className="text-xs text-slate-500">Publish global banner to all workspace portals</p>
                </div>

                <form onSubmit={handlePostAnnouncement} className="space-y-3">
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Design sprint review scheduled for 5 PM."
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    {broadcasting ? 'Broadcasting...' : '📢 Publish Notice'}
                  </button>
                </form>
              </div>

            </section>
          </>
        )}
      </main>

      {/* Modal: Create Invoice */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Generate Client Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Project *</label>
                <select
                  required
                  value={newInvoice.project_id}
                  onChange={(e) => {
                    const selProj = projects.find((p) => String(p.id) === e.target.value);
                    setNewInvoice({ ...newInvoice, project_id: e.target.value, client_id: selProj?.client_id || '' });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (#{p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fee Amount (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. 50% Advance Milestone Fee"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creatingInvoice} className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer">
                  {creatingInvoice ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Create Account</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  <option value="client">Client</option>
                  <option value="director">Director</option>
                  <option value="senior_manager">Senior Manager</option>
                  <option value="manager">Manager</option>
                  <option value="executive">Executive</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creatingUser} className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer">
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Project */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Create New Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brand Identity & Web App"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client</label>
                  <select
                    value={newProject.client_id}
                    onChange={(e) => setNewProject({ ...newProject, client_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="">Select Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lead</label>
                  <select
                    value={newProject.assigned_to}
                    onChange={(e) => setNewProject({ ...newProject, assigned_to: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="">Select Member</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.full_name || e.email} ({e.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Revisions</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newProject.max_revisions}
                    onChange={(e) => setNewProject({ ...newProject, max_revisions: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pending Task</label>
                <input
                  type="text"
                  placeholder="e.g. Requirement intake and initial mockups"
                  value={newProject.pending_tasks}
                  onChange={(e) => setNewProject({ ...newProject, pending_tasks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preview URL</label>
                <input
                  type="url"
                  placeholder="https://preview.askusstudio.com"
                  value={newProject.preview_url}
                  onChange={(e) => setNewProject({ ...newProject, preview_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creatingProject} className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer">
                  {creatingProject ? 'Saving...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Project */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Edit Project #{editingProject.id}</h3>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sign-off Status</label>
                  <select
                    value={editingProject.client_signoff || 'Pending'}
                    onChange={(e) => setEditingProject({ ...editingProject, client_signoff: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved & Signed Off</option>
                    <option value="Changes Requested">Changes Requested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Revisions Used</label>
                  <input
                    type="number"
                    value={editingProject.used_revisions || 0}
                    onChange={(e) => setEditingProject({ ...editingProject, used_revisions: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Progress: {editingProject.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingProject.progress}
                    onChange={(e) => setEditingProject({ ...editingProject, progress: Number(e.target.value) })}
                    className="w-full accent-emerald-600 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pending Task</label>
                <input
                  type="text"
                  value={editingProject.pending_tasks || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, pending_tasks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preview URL</label>
                <input
                  type="url"
                  value={editingProject.preview_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, preview_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProject(editingProject.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold py-2 px-3 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                >
                  Delete Project
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingProject(null)} className="py-2 px-4 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={updating} className="py-2 px-5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer">
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}