'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CommandPaletteProps {
  onOpenCopilot?: () => void;
}

export default function CommandPalette({ onOpenCopilot }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const fetchSearchData = async () => {
      const { data } = await supabase.from('projects').select('id, title, status').limit(8);
      if (data) setProjects(data);
    };
    fetchSearchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-28 p-4 animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, project, or press 'Ask Copilot'..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-600 font-semibold border border-slate-300">
            ESC
          </kbd>
        </div>

        <div className="p-2 border-b border-slate-100 bg-slate-50/30 flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => {
              setIsOpen(false);
              if (onOpenCopilot) onOpenCopilot();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer border border-emerald-200"
          >
            ✨ Ask AI Copilot
          </button>
          <button
            onClick={() => { router.push('/dashboard/admin'); setIsOpen(false); }}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium shrink-0 cursor-pointer"
          >
            🏢 Workspace Overview
          </button>
          <button
            onClick={() => { router.push('/dashboard/employee'); setIsOpen(false); }}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium shrink-0 cursor-pointer"
          >
            💻 Employee Workspace
          </button>
          <button
            onClick={() => { router.push('/dashboard/client'); setIsOpen(false); }}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium shrink-0 cursor-pointer"
          >
            🎯 Client Portal
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
            Projects & Deliverables
          </span>
          {filteredProjects.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-3 py-3">No matching projects found.</p>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/admin');
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs">📁</span>
                  <span className="text-xs font-semibold text-slate-800">{p.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">#{p.id}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {p.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Press ESC or click outside to close</span>
          <span>Askus OS Command Center</span>
        </div>
      </div>
    </div>
  );
}