'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProjectFileManager from '@/components/ProjectFileManager';
import ProjectTimeTracker from '@/components/ProjectTimeTracker';
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard';
import ProjectBriefViewer from '@/components/ProjectBriefViewer';
import DeliverableVersionManager from '@/components/DeliverableVersionManager';
import NotificationBell from '@/components/NotificationBell';
import CommandPalette from '@/components/CommandPalette';
import AICopilot from '@/components/AICopilot';
import ProjectConnectChat from '@/components/ProjectConnectChat';
import SlackWorkspaceChat from '@/components/SlackWorkspaceChat';
import AdminVerificationQueue from '@/components/AdminVerificationQueue';
import { 
  Users, 
  FolderKanban, 
  UsersRound, 
  CreditCard, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  MessageSquare,
  Filter
} from 'lucide-react';

const PROJECT_STATUSES = [
  'Planning',
  'In Progress',
  'At Risk',
  'Blocked',
  'Under Review',
  'Completed',
  'Archived',
];

export default function WorkspaceOverviewDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'crm' | 'finance' | 'slack'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [totalHoursWorked, setTotalHoursWorked] = useState<number>(0);
  const [projectHoursMap, setProjectHoursMap] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [copilotOpen, setCopilotOpen] = useState(false);
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
    role: 'employee',
    employeeCode: '',
    phone: ''
  });
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  // Pipeline Lead Edit State
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [savingLead, setSavingLead] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ project_id: '', client_id: '', amount: '', due_date: '', description: '' });
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'director') {
        router.push('/dashboard/client');
        return;
      }
      setCurrentUserProfile(profile);

      const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data: inqData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      const { data: empData } = await supabase.from('profiles').select('*').neq('role', 'client').order('full_name', { ascending: true });
      const { data: clientData } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: true });
      const { data: invData } = await supabase.from('project_invoices').select('*').order('created_at', { ascending: false });

      // Safe fetch for project_time_logs
      const { data: timeLogsData } = await supabase.from('project_time_logs').select('*');
      if (timeLogsData) {
        const overallHours = timeLogsData.reduce((acc: number, curr: any) => acc + Number(curr.hours_logged || curr.hours || 0), 0);
        setTotalHoursWorked(overallHours);

        const perProjectMap: Record<string, number> = {};
        timeLogsData.forEach((t: any) => {
          if (t.project_id) {
            perProjectMap[t.project_id] = (perProjectMap[t.project_id] || 0) + Number(t.hours_logged || t.hours || 0);
          }
        });
        setProjectHoursMap(perProjectMap);
      }

      if (projData) setProjects(projData);
      if (inqData) setInquiries(inqData);
      if (empData) setEmployees(empData);
      if (clientData) setClients(clientData);
      if (invData) setInvoices(invData);
    } catch (err) {
      console.error('Error loading admin workspace:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateAvailability = async (empId: string, status: 'available' | 'busy' | 'on_leave') => {
    await supabase.from('profiles').update({ availability_status: status }).eq('id', empId);
    setEmployees((prev) => prev.map((e) => (e.id === empId ? { ...e, availability_status: status } : e)));
  };

  const handleSaveEmployeeDetails = async () => {
    if (!editingEmployee) return;
    await supabase
      .from('profiles')
      .update({
        full_name: editingEmployee.full_name,
        role: editingEmployee.role,
        employee_code: editingEmployee.employee_code || null,
        phone: editingEmployee.phone || null,
        availability_status: editingEmployee.availability_status || 'available',
      })
      .eq('id', editingEmployee.id);

    setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? editingEmployee : e)));
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    await supabase.from('profiles').delete().eq('id', empId);
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
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
      setNewUser({ fullName: '', email: '', password: '', role: 'employee', employeeCode: '', phone: '' });
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
    await supabase.from('projects').delete().eq('id', projectId);
    setEditingProject(null);
    loadData();
  };

  // Pipeline Lead Update
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setSavingLead(true);
    const { error } = await supabase
      .from('inquiries')
      .update({
        full_name: editingLead.full_name || editingLead.name,
        name: editingLead.full_name || editingLead.name,
        email: editingLead.email,
        phone: editingLead.phone || null,
        status: editingLead.status,
        message: editingLead.message || null,
      })
      .eq('id', editingLead.id);

    setSavingLead(false);
    if (!error) {
      setInquiries((prev) => prev.map((l) => (l.id === editingLead.id ? editingLead : l)));
      setEditingLead(null);
    } else {
      alert('Error updating lead: ' + error.message);
    }
  };

  const handleConvertInquiry = async (inq: any) => {
    if (!confirm(`Convert lead "${inq.full_name || inq.name}" into client?`)) return;
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
      alert(`Success! Created client workspace for ${inq.email}`);
      loadData();
    } catch (err: any) {
      alert('Conversion error: ' + err.message);
    } finally {
      setConvertingId(null);
    }
  };

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

  const totalRevenue = invoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const paidRevenue = invoices.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Filter projects by dropdown selection
  const filteredProjects = selectedProjectId === 'all'
    ? projects
    : projects.filter((p) => String(p.id) === String(selectedProjectId));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-[#C8FF91] selection:text-black">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs shrink-0">
              A
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 truncate">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">AskUs Studio</h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Console
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Operations & Workspaces</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setCopilotOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-black bg-[#C8FF91] hover:bg-[#b8f57d] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-black hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>Project</span>
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
            >
              + User
            </button>
            {currentUserId && <NotificationBell userId={currentUserId} />}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 5 Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex gap-2 border-t border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length },
            { id: 'team', label: 'Team', icon: Users, count: employees.length },
            { id: 'crm', label: 'Pipeline', icon: UsersRound, count: inquiries.length },
            { id: 'finance', label: 'Ledger', icon: CreditCard, count: `₹${(paidRevenue / 1000).toFixed(0)}k` },
            { id: 'slack', label: 'Slack', icon: MessageSquare, count: 'Live' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'border-black text-black'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-black' : 'text-slate-400'} />
                <span>{tab.label}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-mono">Loading operations...</div>
        ) : (
          <>
            {/* TAB 1: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4 sm:space-y-6">
                <AdminVerificationQueue />

                {/* Project Selection Dropdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <Filter size={14} className="text-slate-400 shrink-0" />
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">View Project:</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full max-w-sm text-xs border border-slate-200 rounded-lg p-1.5 font-semibold bg-slate-50 outline-none focus:border-black cursor-pointer"
                    >
                      <option value="all">📁 All Projects ({projects.length})</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (#{p.id}) - {p.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                      Showing {filteredProjects.length} of {projects.length}
                    </span>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                    No matching project found.
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredProjects.map((proj) => {
                      const assignedClient = clients.find((c) => c.id === proj.client_id);
                      const assignedEmp = employees.find((e) => e.id === proj.assigned_to);
                      const currentTab = activeProjectTab[proj.id] || 'kanban';

                      return (
                        <div key={proj.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{proj.title}</h3>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  #{proj.id}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {proj.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>Client: <strong>{assignedClient?.full_name?.split(' ')[0] || 'Unassigned'}</strong></span>
                                <span>•</span>
                                <span>Owner: <strong>{assignedEmp?.full_name?.split(' ')[0] || 'Unassigned'}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingProject(proj)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono text-slate-500">
                              <span>Sprint Progress</span>
                              <span className="font-bold text-slate-800">{proj.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-black transition-all" style={{ width: `${proj.progress}%` }} />
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3 space-y-3">
                            <div className="flex gap-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                              {[
                                { key: 'kanban', label: '📌 Tasks' },
                                { key: 'files', label: '📁 Files' },
                                { key: 'brief', label: '📋 Brief' },
                                { key: 'versions', label: '🎨 Versions' },
                                { key: 'timelog', label: '⏱ Logs' },
                                { key: 'chat', label: '💬 Chat' },
                              ].map((t) => (
                                <button
                                  key={t.key}
                                  onClick={() => setActiveProjectTab({ ...activeProjectTab, [proj.id]: t.key })}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                                    currentTab === t.key
                                      ? 'bg-black text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>

                            {currentTab === 'kanban' && (
                              <ProjectKanbanBoard 
                                projectId={proj.id} 
                                projectTitle={proj.title} 
                                teamRoster={employees} 
                              />
                            )}
                            {currentTab === 'files' && <ProjectFileManager projectId={proj.id} userId={currentUserId} canUpload={true} />}
                            {currentTab === 'brief' && <ProjectBriefViewer projectId={proj.id} />}
                            {currentTab === 'versions' && <DeliverableVersionManager projectId={proj.id} currentUserId={currentUserId} />}
                            {currentTab === 'timelog' && <ProjectTimeTracker projectId={proj.id} userId={currentUserId} />}
                            {currentTab === 'chat' && (
                              <ProjectConnectChat
                                projectId={proj.id}
                                projectTitle={proj.title}
                                currentUserId={currentUserId}
                                currentUserRole="admin"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TEAM */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Team Directory & Unique IDs</h2>
                    <p className="text-[11px] text-slate-500">Live member status & role allocation</p>
                  </div>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Provision User
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {employees.map((emp) => {
                    const status = emp.availability_status || 'available';
                    const assignedProjs = projects.filter((p) => p.assigned_to === emp.id);

                    return (
                      <div key={emp.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs">
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{emp.full_name || 'Member'}</h4>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold">
                                  {emp.employee_code || `EMP-${emp.id.slice(0, 4).toUpperCase()}`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">{emp.email}</p>
                              {/* Display phone number cleanly only when it exists */}
                              {emp.phone && (
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.phone}</p>
                              )}
                            </div>
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                              {emp.role}
                            </span>
                          </div>

                          <div className="mt-1.5 text-[11px] text-slate-500">
                            Active Sprints: <strong>{assignedProjs.length}</strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <select
                            value={status}
                            onChange={(e) => handleUpdateAvailability(emp.id, e.target.value as any)}
                            className="text-[10px] font-bold rounded-lg px-2 py-1 border bg-white outline-none cursor-pointer"
                          >
                            <option value="available">🟢 Available</option>
                            <option value="busy">🟡 Busy</option>
                            <option value="on_leave">🔴 On Leave</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingEmployee(emp)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                              title="Edit Employee & ID"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                              title="Remove Employee"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CRM / PIPELINE */}
            {activeTab === 'crm' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Incoming Pipeline</h2>
                    <p className="text-[11px] text-slate-500">Manage, edit, and convert prospective leads</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {inquiries.length} Leads
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inquiries.map((inq) => {
                    const isConverted = inq.status === 'Converted';
                    return (
                      <div key={inq.id} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{inq.full_name || inq.name || 'Lead'}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{inq.email} • {inq.phone || 'No phone'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isConverted ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                            }`}>
                              {inq.status || 'New'}
                            </span>
                            <button 
                              onClick={() => setEditingLead(inq)} 
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                              title="Edit Lead"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        </div>
                        {inq.message && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg break-words">"{inq.message}"</p>}
                        {!isConverted ? (
                          <button
                            onClick={() => handleConvertInquiry(inq)}
                            disabled={convertingId === inq.id}
                            className="w-full py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            {convertingId === inq.id ? 'Converting...' : '⚡ Convert to Workspace'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Active Workspace
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: FINANCE */}
            {activeTab === 'finance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">Financial Ledger</h2>
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Invoice
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center sm:text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Total Billed</span>
                    <span className="text-sm sm:text-lg font-black text-slate-900 mt-0.5 block">₹{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center sm:text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Collected</span>
                    <span className="text-sm sm:text-lg font-black text-emerald-700 mt-0.5 block">₹{paidRevenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center sm:text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Pending</span>
                    <span className="text-sm sm:text-lg font-black text-amber-700 mt-0.5 block">₹{(totalRevenue - paidRevenue).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Invoices</h3>
                  {invoices.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-3">No invoices yet.</p>
                  ) : (
                    invoices.map((inv) => (
                      <div key={inv.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{inv.invoice_number}</span>
                            <span className="font-bold text-emerald-700">₹{Number(inv.amount).toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{inv.description || 'Milestone'}</p>
                        </div>
                        <button
                          onClick={() => handleToggleInvoiceStatus(inv.id, inv.status)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 cursor-pointer ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {inv.status === 'Paid' ? '✓ Paid' : 'Mark Paid'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SLACK LIVE CHAT */}
            {activeTab === 'slack' && currentUserId && (
              <div className="space-y-3">
                <SlackWorkspaceChat
                  currentUser={{
                    id: currentUserId,
                    full_name: currentUserProfile?.full_name || 'Admin',
                    role: currentUserProfile?.role || 'admin',
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* LEAD EDIT MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Edit Pipeline Lead</h3>
            <form onSubmit={handleUpdateLead} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Prospect Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={editingLead.full_name || editingLead.name || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, full_name: e.target.value, name: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={editingLead.email || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={editingLead.phone || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lead Stage</label>
                <select
                  value={editingLead.status || 'New'}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notes / Requirement</label>
                <textarea
                  rows={2}
                  placeholder="Project scope or notes..."
                  value={editingLead.message || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, message: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setEditingLead(null)} 
                  className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingLead} 
                  className="flex-1 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {savingLead ? 'Saving...' : 'Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE EDIT MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Edit Employee Profile</h3>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingEmployee.full_name || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, full_name: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Employee Unique ID</label>
                <input
                  type="text"
                  placeholder="e.g. ASK-EMP01"
                  value={editingEmployee.employee_code || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_code: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={editingEmployee.phone || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role</label>
                <select
                  value={editingEmployee.role}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 cursor-pointer"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingEmployee(null)} 
                  className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveEmployeeDetails} 
                  className="flex-1 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER PROVISION MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Provision User</h3>
            <form onSubmit={handleCreateUser} className="space-y-2.5">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className="w-full text-xs border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Unique Employee ID (e.g. ASK-01)"
                value={newUser.employeeCode}
                onChange={(e) => setNewUser({ ...newUser, employeeCode: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 font-mono"
              />
              <input
                type="text"
                placeholder="Phone (+91...)"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 font-mono"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full text-xs border rounded-lg p-2"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full text-xs border rounded-lg p-2"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 cursor-pointer"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="intern">Intern</option>
                <option value="client">Client</option>
              </select>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={creatingUser} className="flex-1 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer">
                  {creatingUser ? '...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase">New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-2.5">
              <input
                type="text"
                required
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full text-xs border rounded-lg p-2"
              />
              <select
                value={newProject.assigned_to}
                onChange={(e) => setNewProject({ ...newProject, assigned_to: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 cursor-pointer"
              >
                <option value="">Select Lead</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code || e.role})</option>
                ))}
              </select>
              <select
                value={newProject.client_id}
                onChange={(e) => setNewProject({ ...newProject, client_id: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 cursor-pointer"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                ))}
              </select>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowProjectModal(false)} className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={creatingProject} className="flex-1 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer">
                  {creatingProject ? '...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Issue Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-2.5">
              <select
                required
                value={newInvoice.project_id}
                onChange={(e) => setNewInvoice({ ...newInvoice, project_id: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 cursor-pointer"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <input
                type="number"
                required
                placeholder="Amount (INR)"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="w-full text-xs border rounded-lg p-2"
              />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={creatingInvoice} className="flex-1 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer">
                  {creatingInvoice ? '...' : 'Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommandPalette onOpenCopilot={() => setCopilotOpen(true)} />
      <AICopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}