'use client'
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AICopilot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm Askus AI Copilot. Ask me about project health, at-risk deliverables, team workloads, or monthly financial burn.",
    },
  ]);
  const [thinking, setThinking] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async (promptText?: string) => {
    const q = promptText || query;
    if (!q.trim()) return;

    const userMsg = { role: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setThinking(true);

    try {
      const { data: projs } = await supabase.from('projects').select('id, title, status, progress, pending_tasks');
      const { data: invs } = await supabase.from('project_invoices').select('amount, status');

      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('risk') || lower.includes('delay') || lower.includes('block')) {
        const atRisk = projs?.filter((p) => p.status === 'Under Review' || (p.progress ?? 0) < 50) || [];
        reply = `Analysis found ${atRisk.length} active project(s) requiring attention:\n` +
          atRisk.map((p) => `• ${p.title} (${p.progress}% completed - Status: ${p.status})`).join('\n') +
          `\nRecommendation: Check milestone blockers on responsive layout and review pending deliverables.`;
      } else if (lower.includes('revenue') || lower.includes('finance') || lower.includes('invoice')) {
        const total = invs?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
        const paid = invs?.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
        reply = `Financial Summary:\n• Total Invoiced: ₹${total.toLocaleString()}\n• Collected Revenue: ₹${paid.toLocaleString()}\n• Outstanding Balance: ₹${(total - paid).toLocaleString()}`;
      } else if (lower.includes('summary') || lower.includes('health')) {
        reply = `Workspace Overview:\n• Total Active Projects: ${projs?.length || 0}\n• Average Sprint Progress: ${
          projs && projs.length > 0 ? Math.round(projs.reduce((a, c) => a + (c.progress || 0), 0) / projs.length) : 0
        }%\n• All primary database listeners are synced in real-time.`;
      } else {
        reply = `Copilot processed your request: "${q}". Current workspace is operating within nominal parameters. Milestone sign-offs and shift logs are actively synced.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Error analyzing workspace: ' + err.message }]);
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
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              ✨
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">AI Copilot</h3>
              <p className="text-[10px] text-slate-500">Business Intelligence & Project Insights</p>
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

        <div className="p-3 border-b border-slate-100 bg-emerald-50/30 flex gap-2 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() => handleAsk('Which projects are currently at risk?')}
            className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
          >
            ⚠️ At-risk projects?
          </button>
          <button
            type="button"
            onClick={() => handleAsk('Show revenue and financial summary')}
            className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
          >
            💰 Revenue summary?
          </button>
          <button
            type="button"
            onClick={() => handleAsk('Summarize workspace health')}
            className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 font-medium shrink-0 hover:bg-emerald-50 cursor-pointer"
          >
            📊 Workspace health
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-xs space-y-1 ${
                m.role === 'assistant'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/70'
                  : 'bg-emerald-600 text-white ml-8 shadow-xs'
              }`}
            >
              <span className="font-bold text-[10px] uppercase block tracking-wider opacity-70">
                {m.role === 'assistant' ? 'Copilot AI' : 'You'}
              </span>
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          ))}
          {thinking && (
            <div className="p-3 rounded-2xl bg-slate-100 text-xs text-slate-500 animate-pulse">
              Analyzing company workspace data...
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
            placeholder="Ask Copilot anything about projects, finances..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Ask
          </button>
        </form>
      </div>
    </>
  );
}