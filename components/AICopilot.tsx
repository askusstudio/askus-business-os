'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserContext {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'client' | 'director' | 'manager' | 'executive' | 'intern' | 'public';
}

export default function AICopilot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [userContext, setUserContext] = useState<UserContext>({
    id: '',
    email: '',
    fullName: '',
    role: 'public',
  });
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm AskUs AI Assistant. How can I help you explore our services, technical stack, or plan your next project?",
    },
  ]);
  const [thinking, setThinking] = useState(false);

  // Check login status & load authenticated profile
  useEffect(() => {
    async function resolveUserContext() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserContext({ id: '', email: '', fullName: '', role: 'public' });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      setUserContext({
        id: user.id,
        email: user.email || '',
        fullName: profile?.full_name || 'Member',
        role: (profile?.role as any) || 'client',
      });
    }

    if (isOpen) {
      resolveUserContext();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isInternalTeam = ['admin', 'director', 'manager', 'executive', 'intern'].includes(userContext.role);
  const isClient = userContext.role === 'client';
  const isPublic = userContext.role === 'public';

  const handleAsk = async (promptText?: string) => {
    const q = promptText || query;
    if (!q.trim()) return;

    const userMsg = { role: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setThinking(true);

    try {
      let reply = '';
      const lower = q.toLowerCase();

      // Check if user is asking for internal confidential data
      const asksForInternalMetrics = 
        lower.includes('revenue') || 
        lower.includes('finance') || 
        lower.includes('invoice') || 
        lower.includes('profit') || 
        lower.includes('burn') || 
        lower.includes('at risk') ||
        lower.includes('salaries');

      // 1. PUBLIC VISITOR (Strict Guardrail: Zero private data leakage)
      if (isPublic) {
        if (asksForInternalMetrics || lower.includes('my project') || lower.includes('status')) {
          reply = "🔒 Confidential Information: Internal studio revenue, finances, and client dashboards are only accessible to logged-in workspace members.\n\n• If you are an active client, please log in at /login to view your personal project status.\n• If you want a service quote or consultation, please message our team or click 'Book Meet'!";
        } else if (lower.includes('service') || lower.includes('marketing') || lower.includes('tech') || lower.includes('legal')) {
          reply = "AskUs Studio provides three core specialized offerings:\n\n1. 📈 Marketing Solutions: ROI-driven Performance Ads (Meta & Google), Local & Technical SEO, Brand Recall.\n2. 💻 Tech Solutions: Custom Web & SaaS platforms (Next.js/React), Native Mobile Apps, and Enterprise AI workflows.\n3. ⚖️ Legal Solutions: Startup incorporation (Pvt Ltd, LLP), ROC filings, contracts, trademarks, and funding advisory.\n\nWould you like to book a 30-min discovery call or submit an inquiry?";
        } else if (lower.includes('contact') || lower.includes('call') || lower.includes('whatsapp') || lower.includes('book')) {
          reply = "You can connect with us directly:\n• WhatsApp / Call: +91 80092 27002\n• Email: askusstudio@gmail.com\n• Or use the 'Book Meet' button in the top navigation bar.";
        } else {
          reply = `Welcome to AskUs Studio! We partner with startups and enterprises to build high-performance products, marketing engines, and legal foundations. Let me know what service you are looking to explore!`;
        }
      } 
      // 2. LOGGED-IN CLIENT (Show only their personal projects & milestones)
      else if (isClient) {
        if (asksForInternalMetrics) {
          reply = "🔒 As a client, company-wide operational finances and internal margins are restricted. However, you can review your own project invoices and statements in your Client Portal.";
        } else {
          const { data: myProjects } = await supabase
            .from('projects')
            .select('id, title, status, progress, pending_tasks')
            .eq('client_id', userContext.id);

          if (!myProjects || myProjects.length === 0) {
            reply = `Welcome ${userContext.fullName}! You currently have no active deliverables under your account. Once your onboarding is finalized, your live sprints will reflect here.`;
          } else {
            reply = `Hello ${userContext.fullName}, here is your personal workspace status:\n\n` +
              myProjects.map((p) => `• ${p.title} (Status: ${p.status}, Progress: ${p.progress}%)\n  Next Milestone: ${p.pending_tasks || 'In Progress'}`).join('\n\n') +
              `\n\nNeed adjustments? You can request revisions directly via your project tabs.`;
          }
        }
      } 
      // 3. ADMIN / INTERNAL TEAM (Full Business Intelligence)
      else if (isInternalTeam) {
        if (asksForInternalMetrics) {
          const { data: invs } = await supabase.from('project_invoices').select('amount, status');
          const total = invs?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
          const paid = invs?.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
          reply = `👑 [Studio Financial Audit]\n• Total Invoiced Value: ₹${total.toLocaleString()}\n• Realized Revenue: ₹${paid.toLocaleString()}\n• Outstanding Balance: ₹${(total - paid).toLocaleString()}`;
        } else if (lower.includes('risk') || lower.includes('block') || lower.includes('delay')) {
          const { data: projs } = await supabase.from('projects').select('title, status, progress');
          const atRisk = projs?.filter((p) => p.status === 'Under Review' || p.status === 'At Risk' || (p.progress ?? 0) < 50) || [];
          reply = `👑 [Risk Assessment]\n${atRisk.length} active projects require review:\n` +
            atRisk.map((p) => `• ${p.title} (${p.progress}% - ${p.status})`).join('\n');
        } else {
          const { data: projs } = await supabase.from('projects').select('id, status');
          reply = `👑 [Workspace Intelligence]\nActive Projects: ${projs?.length || 0}\nRole: ${userContext.role.toUpperCase()}\nUser: ${userContext.fullName} (${userContext.email})`;
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Error processing inquiry. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9998] transition-opacity duration-200" 
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-[9999] w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl flex flex-col font-sans text-slate-800 animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C8FF91] text-black flex items-center justify-center text-xs font-bold shadow-2xs">
              ✨
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                AskUs AI Assistant
              </h3>
              <p className="text-[10px] text-slate-500">
                {isPublic && 'Public Discovery & Consultation'}
                {isClient && `Client Portal (${userContext.fullName})`}
                {isInternalTeam && `Enterprise Workspace (${userContext.role.toUpperCase()})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Suggestion Pills mapped strictly by role */}
        <div className="p-3 border-b border-slate-100 bg-emerald-50/30 flex gap-2 overflow-x-auto text-[11px]">
          {isPublic && (
            <>
              <button
                type="button"
                onClick={() => handleAsk('What services does AskUs Studio provide?')}
                className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
              >
                🚀 Our Services
              </button>
              <button
                type="button"
                onClick={() => handleAsk('How can I contact the team?')}
                className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
              >
                📞 Contact & WhatsApp
              </button>
            </>
          )}

          {isClient && (
            <>
              <button
                type="button"
                onClick={() => handleAsk('What is the status of my project?')}
                className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
              >
                📌 My Project Status
              </button>
              <button
                type="button"
                onClick={() => handleAsk('What are the next milestone deliverables?')}
                className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
              >
                📋 Next Deliverables
              </button>
            </>
          )}

          {isInternalTeam && (
            <>
              <button
                type="button"
                onClick={() => handleAsk('Show revenue and financial summary')}
                className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
              >
                💰 Revenue Summary
              </button>
              <button
                type="button"
                onClick={() => handleAsk('Which projects are at risk?')}
                className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
              >
                ⚠️ At-Risk Projects
              </button>
            </>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-xs space-y-1 ${
                m.role === 'assistant'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/70'
                  : 'bg-black text-white ml-8 shadow-xs'
              }`}
            >
              <span className="font-bold text-[10px] uppercase block tracking-wider opacity-70">
                {m.role === 'assistant' ? 'AskUs AI' : 'You'}
              </span>
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          ))}
          {thinking && (
            <div className="p-3 rounded-2xl bg-slate-100 text-xs text-slate-500 animate-pulse">
              Verifying permissions and analyzing data...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-3.5 border-t border-slate-200 bg-slate-50 flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isPublic
                ? "Ask about services, tech solutions, legal..."
                : isClient
                ? "Ask about your deliverables, milestones..."
                : "Ask about agency financials, active sprints..."
            }
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}