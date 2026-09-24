'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProjectTimeTrackerProps {
  projectId: number | string;
  userId: string;
}

export default function ProjectTimeTracker({ projectId, userId }: ProjectTimeTrackerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('project_time_logs')
      .select('*, member:profiles(full_name, role)')
      .eq('project_id', projectId)
      .order('logged_date', { ascending: false });

    if (data) setLogs(data);
  };

  useEffect(() => {
    if (projectId) fetchLogs();
  }, [projectId]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !description.trim()) return;

    setSaving(true);
    const { error } = await supabase.from('project_time_logs').insert([
      {
        project_id: projectId,
        user_id: userId,
        hours: Number(hours),
        description: description.trim(),
      },
    ]);

    setSaving(false);
    if (!error) {
      setHours('');
      setDescription('');
      fetchLogs();
    } else {
      alert('Error logging time: ' + error.message);
    }
  };

  const totalHours = logs.reduce((sum, item) => sum + Number(item.hours || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-black/40 p-3.5 rounded-2xl border border-white/5">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Work Logged</span>
          <span className="text-lg font-black text-[#C8FF91]">{totalHours.toFixed(1)} hrs</span>
        </div>
        <span className="text-xs text-neutral-400 font-semibold">{logs.length} Sessions Logged</span>
      </div>

      <form onSubmit={handleAddLog} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
        <div className="sm:col-span-1">
          <input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            required
            placeholder="Hours (e.g. 2.5)"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8FF91]"
          />
        </div>
        <div className="sm:col-span-2">
          <input
            type="text"
            required
            placeholder="What did you work on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8FF91]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-1 bg-[#C8FF91] hover:bg-[#b8f57d] text-black text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? 'Logging...' : '+ Log Hours'}
        </button>
      </form>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-2">No work hours logged yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white/5 p-3 rounded-xl flex justify-between items-center text-xs border border-white/5">
              <div className="min-w-0">
                <p className="font-semibold text-neutral-200 truncate">{log.description}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {log.logged_date} • {log.member?.full_name || 'Team Member'}
                </p>
              </div>
              <span className="font-bold text-[#C8FF91] bg-[#C8FF91]/10 px-2 py-1 rounded-lg shrink-0 ml-3">
                {Number(log.hours).toFixed(1)} hrs
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}