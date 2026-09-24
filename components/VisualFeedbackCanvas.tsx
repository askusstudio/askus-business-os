'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VisualFeedbackCanvas({
  projectId,
  userId,
  previewUrl,
}: {
  projectId: number;
  userId: string;
  previewUrl: string;
}) {
  const [pins, setPins] = useState<any[]>([]);
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPins = async () => {
    const { data } = await supabase
      .from('project_visual_pins')
      .select('*, author:profiles(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (data) setPins(data);
  };

  useEffect(() => {
    fetchPins();

    const channel = supabase
      .channel(`pins_proj_${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_visual_pins' }, () => fetchPins())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewPin({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || !note.trim()) return;

    setSaving(true);
    const { error } = await supabase.from('project_visual_pins').insert([
      {
        project_id: projectId,
        author_id: userId,
        x_percent: newPin.x,
        y_percent: newPin.y,
        comment: note.trim(),
      },
    ]);

    setSaving(false);
    if (!error) {
      setNote('');
      setNewPin(null);
      fetchPins();
    } else {
      alert('Error placing pin: ' + error.message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-700 uppercase tracking-wider">
          📍 Click Anywhere to Drop a Visual Feedback Pin
        </span>
        <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {pins.length} Feedback Pins Placed
        </span>
      </div>

      <div
        onClick={handleCanvasClick}
        className="relative w-full h-[480px] bg-slate-100 border border-slate-200 rounded-xl overflow-hidden cursor-crosshair shadow-inner"
      >
        <iframe
          src={previewUrl}
          className="w-full h-full pointer-events-none border-none"
          title="Staging Preview"
        />

        {/* Existing Visual Pins */}
        {pins.map((p, idx) => (
          <div
            key={p.id}
            style={{ left: `${p.x_percent}%`, top: `${p.y_percent}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
              {idx + 1}
            </div>

            {/* Hover Tooltip */}
            <div className="hidden group-hover:block absolute left-7 top-0 bg-white border border-slate-200 p-2.5 rounded-xl shadow-xl w-56 text-xs z-30 pointer-events-none">
              <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                {p.author?.full_name || 'Client'}
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{p.comment}</p>
            </div>
          </div>
        ))}

        {/* Dynamic New Pin Trigger */}
        {newPin && (
          <div
            style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-lg animate-bounce">
              +
            </div>
            <form
              onSubmit={handleSavePin}
              className="mt-2 bg-white border border-slate-200 p-3 rounded-xl shadow-2xl w-64 space-y-2"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Add Comment</span>
              <input
                type="text"
                autoFocus
                placeholder="E.g., Change this button text to 'Get Started'..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => setNewPin(null)}
                  className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md hover:bg-emerald-700 shadow-2xs cursor-pointer"
                >
                  {saving ? 'Placing...' : 'Drop Pin'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}