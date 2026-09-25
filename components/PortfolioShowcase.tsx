'use client'
import React from 'react';

export default function PortfolioShowcase({ projects = [] }: { projects: any[] }) {
  const portfolioItems = projects.length > 0
    ? projects.map((p) => ({
        id: p.id,
        title: p.title,
        client: 'Client Platform',
        industry: 'Agency / SaaS',
        problem: 'Outdated legacy workflow and fragmented coordination.',
        solution: 'Engineered an end-to-end digital business operating system with real-time feedback pins.',
        tech_stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Supabase'],
        preview_url: p.preview_url || '#',
      }))
    : [
        {
          id: 101,
          title: 'Askus Studio Redesign & Design System',
          client: 'Askus Media Labs',
          industry: 'Agency / SaaS',
          problem: 'Outdated brand identity and fragmented project coordination across scattered tools.',
          solution: 'Engineered an end-to-end digital business operating system with real-time feedback pins and shift logs.',
          tech_stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Supabase', 'WebSockets'],
          preview_url: '#',
        },
      ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🎨</span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Portfolio & Case Studies</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Live Showcase
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-compiled case studies from approved deliverables
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolioItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                <span className="text-[11px] text-slate-500">{item.client} • {item.industry}</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Showcase Ready
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              <p><strong className="text-slate-800 font-semibold">Challenge:</strong> {item.problem}</p>
              <p><strong className="text-slate-800 font-semibold">Solution:</strong> {item.solution}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(item.tech_stack || []).map((tech: string, idx: number) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}