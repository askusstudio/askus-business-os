'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LiveShiftTimer({ projectId, userId }: { projectId: number; userId: string }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [taskSummary, setTaskSummary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopAndLog = async () => {
    if (seconds < 30) {
      alert('Shift timer minimum 30 seconds chalna chahiye log karne ke liye.');
      return;
    }

    setSaving(true);
    const loggedHours = Number((seconds / 3600).toFixed(2));

    const { error } = await supabase.from('project_time_logs').insert([
      {
        project_id: projectId,
        employee_id: userId,
        hours_logged: loggedHours,
        description: taskSummary || 'Live sprint session',
      },
    ]);

    setSaving(false);
    if (!error) {
      setIsActive(false);
      setSeconds(0);
      setTaskSummary('');
      alert(`Shift logged: ${loggedHours} hrs.`);
    } else {
      alert('Error logging time: ' + error.message);
    }
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Live Task Stopwatch</span>
          <span className="text-[11px] text-slate-500">Track active work hours directly</span>
        </div>
        <div className="font-mono font-bold text-lg text-emerald-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
          {formatTimer(seconds)}
        </div>
      </div>

      <input
        type="text"
        placeholder="What module are you currently building?"
        value={taskSummary}
        onChange={(e) => setTaskSummary(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
      />

      <div className="flex gap-2">
        {!isActive ? (
          <button
            type="button"
            onClick={() => setIsActive(true)}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
          >
            ▶ Start Timer
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleStopAndLog}
            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer animate-pulse"
          >
            {saving ? 'Logging...' : '⏹ Stop & Log Shift'}
          </button>
        )}
      </div>
    </div>
  );
}