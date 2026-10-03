'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Filter,
  ShieldAlert,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Search
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
  const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'clients' | 'crm' | 'finance' | 'slack'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [totalHoursWorked, setTotalHoursWorked] = useState<number>(0);
  const [projectHoursMap, setProjectHoursMap] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Task Filter & Expansion States (Sir's Requirements)
  const [taskDateFilter, setTaskDateFilter] = useState<'all' | 'yesterday' | 'week' | '15days' | 'month'>('all');
  const [expandedTasksProject, setExpandedTasksProject] = useState<Record<string, boolean>>({});
  const [clientSearch, setClientSearch] = useState('');

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

  // User Management State (Exclusive to Admin)
  const [showUserModal, setShowUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    fullName: '', 
    username: '', 
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

  // Invoice Management State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ 
    project_id: '', 
    client_id: '', 
    amount: '', 
    due_date: '', 
    description: '', 
    remarks: '' 
  });
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [updatingInvoice, setUpdatingInvoice] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const router = useRouter();

  const isSuperAdmin = currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'director';
  const isManager = currentUserProfile?.role === 'manager';

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

      const allowedRoles = ['admin', 'director', 'manager'];
      if (!allowedRoles.includes(profile?.role)) {
        router.push('/dashboard/employee');
        return;
      }
      setCurrentUserProfile(profile);

      const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data: inqData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      const { data: empData } = await supabase.from('profiles').select('*').neq('role', 'client').order('full_name', { ascending: true });
      const { data: clientData } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false });
      const { data: invData } = await supabase.from('project_invoices').select('*').order('created_at', { ascending: false });
      const { data: taskData } = await supabase.from('project_tasks').select('*').order('created_at', { ascending: false });

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
      if (taskData) setAllTasks(taskData);
    } catch (err) {
      console.error('Error loading operations workspace:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date Filter Logic for Tasks
  const filterTaskByDate = useCallback((taskDateStr: string | null) => {
    if (!taskDateStr || taskDateFilter === 'all') return true;

    const taskDate = new Date(taskDateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (taskDateFilter === 'yesterday') {
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      return taskDate >= startOfYesterday && taskDate < startOfToday;
    }
    if (taskDateFilter === 'week') {
      const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return taskDate >= past7Days;
    }
    if (taskDateFilter === '15days') {
      const past15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      return taskDate >= past15Days;
    }
    if (taskDateFilter === 'month') {
      const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return taskDate >= past30Days;
    }
    return true;
  }, [taskDateFilter]);

  const toggleProjectTasksExpand = (projectId: string | number) => {
    setExpandedTasksProject((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleUpdateAvailability = async (empId: string, status: 'available' | 'busy' | 'on_leave') => {
    setEmployees((prev) => prev.map((e) => (e.id === empId ? { ...e, availability_status: status } : e)));

    const { error } = await supabase
      .from('profiles')
      .update({ availability_status: status })
      .eq('id', empId);

    if (error) {
      alert('Failed to update status: ' + error.message);
      loadData();
    }
  };

  const handleSaveEmployeeDetails = async () => {
    if (!editingEmployee) return;

    const cleanedUsername = editingEmployee.username 
      ? editingEmployee.username.trim().toLowerCase().replace(/\s+/g, '_').replace(/@/g, '')
      : null;

    const updatePayload: any = {
      full_name: editingEmployee.full_name,
      username: cleanedUsername,
      employee_code: editingEmployee.employee_code || null,
      phone: editingEmployee.phone || null,
      availability_status: editingEmployee.availability_status || 'available',
    };

    if (isSuperAdmin) {
      updatePayload.role = editingEmployee.role;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', editingEmployee.id);

    if (!error) {
      setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...updatePayload } : e)));
      setClients((prev) => prev.map((c) => (c.id === editingEmployee.id ? { ...c, ...updatePayload } : c)));
      setEditingEmployee(null);
    } else {
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (!isSuperAdmin) {
      alert('Security Alert: Only Admins have user termination permissions.');
      return;
    }
    if (!confirm('Are you sure you want to remove this user from the system?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', empId);
    if (!error) {
      setEmployees((prev) => prev.filter((e) => e.id !== empId));
      setClients((prev) => prev.filter((c) => c.id !== empId));
    } else {
      alert('Error removing user: ' + error.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Security Alert: Only Admins can provision new users.');
      return;
    }
    setCreatingUser(true);
    try {
      const cleanedUsername = newUser.username.trim().toLowerCase().replace(/\s+/g, '_').replace(/@/g, '');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, username: cleanedUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setShowUserModal(false);
      setNewUser({ fullName: '', username: '', email: '', password: '', role: 'employee', employeeCode: '', phone: '' });
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
    } else {
      alert('Error creating project: ' + error.message);
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
    if (!isSuperAdmin) {
      alert('Notice: Only Admin can delete a project permanently.');
      return;
    }
    if (!confirm('Are you sure you want to delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (!error) {
      setEditingProject(null);
      loadData();
    } else {
      alert('Error deleting project: ' + error.message);
    }
  };

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
    if (!isSuperAdmin) {
      alert('Invoicing operations are restricted to Admin only.');
      return;
    }
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
        remarks: newInvoice.remarks?.trim() || null,
        status: 'Unpaid',
      },
    ]);

    if (!error) {
      setShowInvoiceModal(false);
      setNewInvoice({ project_id: '', client_id: '', amount: '', due_date: '', description: '', remarks: '' });
      loadData();
    } else {
      alert('Error creating invoice: ' + error.message);
    }
    setCreatingInvoice(false);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !editingInvoice) return;
    setUpdatingInvoice(true);

    const { error } = await supabase
      .from('project_invoices')
      .update({
        amount: Number(editingInvoice.amount),
        due_date: editingInvoice.due_date || null,
        description: editingInvoice.description || null,
        remarks: editingInvoice.remarks?.trim() || null,
      })
      .eq('id', editingInvoice.id);

    setUpdatingInvoice(false);
    if (!error) {
      setEditingInvoice(null);
      loadData();
    } else {
      alert('Error updating invoice: ' + error.message);
    }
  };

  const handleToggleInvoiceStatus = async (invId: number, currentStatus: string) => {
    if (!isSuperAdmin) {
      alert('Only Admin can approve and mark invoices as Paid.');
      return;
    }
    const nextStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    await supabase.from('project_invoices').update({ status: nextStatus, paid_at: nextStatus === 'Paid' ? new Date() : null }).eq('id', invId);
    loadData();
  };

  const totalRevenue = invoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const paidRevenue = invoices.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const filteredProjects = selectedProjectId === 'all'
    ? projects
    : projects.filter((p) => String(p.id) === String(selectedProjectId));

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = clientSearch.toLowerCase();
      return (
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q)
      );
    });
  }, [clients, clientSearch]);

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
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                  isSuperAdmin 
                    ? 'bg-rose-50 text-rose-800 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {isSuperAdmin ? 'Super Admin' : 'Manager Console'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {isSuperAdmin ? 'System Governance & Operations' : 'Primary Project & Delivery Operations'}
              </p>
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

            {isSuperAdmin && (
              <button
                onClick={() => setShowUserModal(true)}
                className="px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
              >
                + User
              </button>
            )}

            {currentUserId && <NotificationBell userId={currentUserId} />}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 6 Navigation Tabs (Includes Newly Added Clients Tab) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex gap-2 border-t border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length },
            { id: 'team', label: 'Employees', icon: Users, count: employees.length },
            { id: 'clients', label: 'Clients', icon: UserCheck, count: clients.length },
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
            {/* TAB 1: PROJECTS & TASKS (WITH 5-TASK LIMIT & DATE FILTER) */}
            {activeTab === 'projects' && (
              <div className="space-y-4 sm:space-y-6">
                <AdminVerificationQueue />

                {/* Filter Bar with Date Range Selector */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2 flex-1 min-w-60">
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

                  {/* Task Date Range Filter (Yesterday, Last Week, 15 Days, Last Month) */}
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Tasks Period:</label>
                    <select
                      value={taskDateFilter}
                      onChange={(e) => setTaskDateFilter(e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg p-1.5 font-bold bg-white text-slate-800 outline-none focus:border-black cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">Last Week (7 Days)</option>
                      <option value="15days">Last 15 Days</option>
                      <option value="month">Last Month (30 Days)</option>
                    </select>

                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + New Project
                    </button>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                    No matching project found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((proj) => {
                      const assignedClient = clients.find((c) => c.id === proj.client_id);
                      const assignedEmp = employees.find((e) => e.id === proj.assigned_to);
                      const currentTab = activeProjectTab[proj.id] || 'kanban';

                      // Project specific tasks filtered by the chosen date range
                      const projectTasks = allTasks.filter((t) => {
                        const belongsToProj = String(t.project_id) === String(proj.id);
                        if (!belongsToProj) return false;
                        const relevantDate = t.updated_at || t.created_at;
                        return filterTaskByDate(relevantDate);
                      });

                      const isExpanded = expandedTasksProject[proj.id] || false;
                      const visibleTasks = isExpanded ? projectTasks : projectTasks.slice(0, 5);
                      const hasMoreTasks = projectTasks.length > 5;

                      return (
                        <div key={proj.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
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
                                <span>Client: <strong>{assignedClient?.full_name || assignedClient?.email || 'Unassigned'}</strong></span>
                                <span>•</span>
                                <span>Owner: <strong>{assignedEmp?.full_name || 'Unassigned'}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingProject(proj)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 cursor-pointer"
                              >
                                Edit
                              </button>
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono text-slate-500">
                              <span>Sprint Progress</span>
                              <span className="font-bold text-slate-800">{proj.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-black transition-all" style={{ width: `${proj.progress}%` }} />
                            </div>
                          </div>

                          {/* Quick Task Summary Panel (5-Task Limit + Dropdown) */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>📌 Project Tasks ({projectTasks.length})</span>
                                {taskDateFilter !== 'all' && (
                                  <span className="text-[9px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold uppercase">
                                    {taskDateFilter}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Showing {visibleTasks.length} of {projectTasks.length}
                              </span>
                            </div>

                            {projectTasks.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-1">No tasks recorded for this selected time filter.</p>
                            ) : (
                              <div className="space-y-1.5">
                                {visibleTasks.map((t) => (
                                  <div key={t.id} className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                      {t.is_completed ? (
                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                      ) : (
                                        <Clock size={14} className="text-amber-500 shrink-0" />
                                      )}
                                      <span className={`truncate ${t.is_completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                                        {t.title}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                      {t.status}
                                    </span>
                                  </div>
                                ))}

                                {/* Explore All Tasks Dropdown Trigger */}
                                {hasMoreTasks && (
                                  <button
                                    type="button"
                                    onClick={() => toggleProjectTasksExpand(proj.id)}
                                    className="w-full py-1.5 mt-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Collapse tasks list</span>
                                        <ChevronUp size={14} />
                                      </>
                                    ) : (
                                      <>
                                        <span>Explore all remaining {projectTasks.length - 5} tasks</span>
                                        <ChevronDown size={14} />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Navigation sub-tabs inside project */}
                          <div className="border-t border-slate-100 pt-3 space-y-3">
                            <div className="flex gap-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                              {[
                                { key: 'kanban', label: '📌 Kanban' },
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
                                    currentTab === t.key ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'
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
                                currentUserRole={currentUserProfile?.role || 'admin'}
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

            {/* TAB 2: TEAM (EMPLOYEES) */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Employees Directory</h2>
                    <p className="text-[11px] text-slate-500">Live operational personnel, status, and IDs</p>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Provision Employee
                    </button>
                  )}
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
                                {emp.username && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
                                    @{emp.username}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{emp.email}</p>
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
                              title="Edit Employee Details"
                            >
                              <Edit3 size={13} />
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                                title="Remove User"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CLIENTS DIRECTORY (Newly Added to resolve "can't see the clients") */}
            {activeTab === 'clients' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Clients Directory</h2>
                    <p className="text-[11px] text-slate-500">All registered client accounts and their ongoing projects</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-black"
                      />
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setNewUser({ ...newUser, role: 'client' });
                          setShowUserModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        + Add Client
                      </button>
                    )}
                  </div>
                </div>

                {filteredClients.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                    No clients found. Click "+ Add Client" or convert a lead from the Pipeline.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredClients.map((client) => {
                      const clientProjects = projects.filter((p) => p.client_id === client.id);
                      const clientInvoices = invoices.filter((inv) => inv.client_id === client.id);
                      const totalBilled = clientInvoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

                      return (
                        <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {client.full_name || 'Client Account'}
                                  </h4>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase">
                                    Client
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{client.email}</p>
                                {client.phone && (
                                  <p className="text-[10px] text-slate-400 font-mono">{client.phone}</p>
                                )}
                              </div>

                              <button
                                onClick={() => setEditingEmployee(client)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                                title="Edit Client"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                              <div className="p-2 bg-slate-50 rounded-lg">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Projects</span>
                                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{clientProjects.length}</span>
                              </div>
                              <div className="p-2 bg-slate-50 rounded-lg">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Invoiced</span>
                                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">₹{totalBilled.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>UID: #{client.id.slice(0, 6)}</span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleDeleteEmployee(client.id)}
                                className="text-rose-500 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CRM / PIPELINE */}
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
                        {inq.message && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg wrap-break-word">"{inq.message}"</p>}
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

            {/* TAB 5: FINANCE (LEDGER WITH INVOICE EDIT & REMARKS) */}
            {activeTab === 'finance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Financial Ledger</h2>
                    {!isSuperAdmin && (
                      <p className="text-[11px] text-amber-700">Financial issuance and edits are restricted to Super Admin.</p>
                    )}
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Invoice
                    </button>
                  )}
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
                      <div key={inv.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                        <div className="min-w-0 max-w-md">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{inv.invoice_number}</span>
                            <span className="font-bold text-emerald-700">₹{Number(inv.amount).toLocaleString()}</span>
                            {inv.due_date && (
                              <span className="text-[10px] text-slate-400 font-mono">Due: {inv.due_date}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{inv.description || 'Milestone Deliverable'}</p>
                          
                          {inv.remarks && (
                            <div className="mt-1 flex items-start gap-1 text-[10px] text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
                              <FileText size={11} className="shrink-0 mt-0.5 text-amber-600" />
                              <span className="wrap-break-word"><strong>Remark:</strong> {inv.remarks}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSuperAdmin && (
                            <button
                              onClick={() => setEditingInvoice(inv)}
                              className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer"
                              title="Edit Invoice & Remarks"
                            >
                              <Edit3 size={11} className="inline mr-1" />
                              Edit
                            </button>
                          )}

                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleToggleInvoiceStatus(inv.id, inv.status)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                                inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {inv.status === 'Paid' ? '✓ Paid' : 'Mark Paid'}
                            </button>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              {inv.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SLACK LIVE CHAT */}
            {activeTab === 'slack' && currentUserId && (
              <div className="space-y-3">
                <SlackWorkspaceChat
                  currentUser={{
                    id: currentUserId,
                    full_name: currentUserProfile?.full_name || 'Console User',
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

      {/* EMPLOYEE / CLIENT EDIT MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Edit User Profile</h3>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tagging Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-mono font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    placeholder="username (e.g. shanya_tripathi)"
                    value={editingEmployee.username || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full text-xs border rounded-lg p-2 pl-6 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unique ID</label>
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

              {isSuperAdmin ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">System Role</label>
                  <select
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2 cursor-pointer font-semibold text-rose-700 bg-rose-50"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="intern">Intern</option>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Role</span>
                  <p className="text-xs font-semibold text-slate-700 uppercase bg-slate-50 p-2 rounded">{editingEmployee.role}</p>
                </div>
              )}

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

      {/* USER PROVISION MODAL (EMPLOYEE OR CLIENT) */}
      {showUserModal && isSuperAdmin && (
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
                placeholder="@username for tagging (e.g. shanya_tripathi)"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                className="w-full text-xs border rounded-lg p-2 font-mono"
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
                className="w-full text-xs border rounded-lg p-2 cursor-pointer font-bold"
              >
                <option value="employee">Employee</option>
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="intern">Intern</option>
                <option value="admin">Admin</option>
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

      {/* PROJECT CREATION MODAL */}
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

      {/* CREATE INVOICE MODAL */}
      {showInvoiceModal && isSuperAdmin && (
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
              <input
                type="date"
                value={newInvoice.due_date}
                onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                className="w-full text-xs border rounded-lg p-2 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Milestone / Description"
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                className="w-full text-xs border rounded-lg p-2"
              />
              <textarea
                rows={2}
                placeholder="Remarks / Terms / Notes (e.g. 50% advance deliverable)..."
                value={newInvoice.remarks}
                onChange={(e) => setNewInvoice({ ...newInvoice, remarks: e.target.value })}
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

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Edit Invoice & Remarks</h3>
            <form onSubmit={handleUpdateInvoice} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Invoice Amount (INR) *</label>
                <input
                  type="number"
                  required
                  value={editingInvoice.amount || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingInvoice.due_date || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
                <input
                  type="text"
                  value={editingInvoice.description || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, description: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Remarks Section</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions, payment terms, or remarks..."
                  value={editingInvoice.remarks || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, remarks: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setEditingInvoice(null)} 
                  className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingInvoice} 
                  className="flex-1 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {updatingInvoice ? 'Saving...' : 'Update Invoice'}
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