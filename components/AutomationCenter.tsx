'use client'
import React, { useState } from 'react';

interface AutomationRule {
  id: string;
  trigger: string;
  action: string;
  category: 'Projects' | 'Invoices' | 'Tasks' | 'Portfolio';
  isActive: boolean;
}

export default function AutomationCenter() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      trigger: 'When a project reaches 80% progress',
      action: 'Notify client & prepare final sign-off packet',
      category: 'Projects',
      isActive: true,
    },
    {
      id: 'rule-2',
      trigger: 'When a task becomes overdue by 24h',
      action: 'Escalate to Task Owner & Project Lead via Activity Center',
      category: 'Tasks',
      isActive: true,
    },
    {
      id: 'rule-3',
      trigger: 'When an invoice remains unpaid for 7 days',
      action: 'Send automated email reminder with payment link',
      category: 'Invoices',
      isActive: true,
    },
    {
      id: 'rule-4',
      trigger: 'When project milestone is approved by client',
      action: 'Auto-generate Portfolio case-study draft',
      category: 'Portfolio',
      isActive: true,
    },
    {
      id: 'rule-5',
      trigger: 'When client requests > 3 revisions',
      action: 'Lock revision requests & auto-issue ₹4,999 add-on pack invoice',
      category: 'Invoices',
      isActive: true,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Automation Center</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {rules.filter((r) => r.isActive).length} Active Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Event-driven triggers connecting tasks, invoices, client approvals, and portfolio publication
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-xl border transition-all ${
              rule.isActive
                ? 'bg-slate-50/70 border-slate-200/90 shadow-2xs'
                : 'bg-slate-50/30 border-dashed border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                {rule.category}
              </span>
              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  rule.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                    rule.isActive ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold font-mono text-[10px] uppercase shrink-0 mt-0.5">IF:</span>
                <span className="text-slate-800 font-medium">{rule.trigger}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-sky-700 font-bold font-mono text-[10px] uppercase shrink-0 mt-0.5">THEN:</span>
                <span className="text-slate-600">{rule.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}