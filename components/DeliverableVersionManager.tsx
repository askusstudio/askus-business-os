'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DeliverableVersionManager({ projectId, currentUserId }: { projectId: number | string; currentUserId: string }) {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newPreviewUrl, setNewPreviewUrl] = useState('');
  const [commentText, setCommentText] = useState('');
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);

  const fetchVersions = async () => {
    const { data } = await supabase
      .from('deliverable_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setVersions(data);
      if (!selectedVersion) setSelectedVersion(data[0]);
    }
  };

  const fetchAnnotations = async (versionId: number) => {
    const { data } = await supabase
      .from('deliverable_annotations')
      .select('*')
      .eq('version_id', versionId)
      .order('created_at', { ascending: true });
    if (data) setAnnotations(data);
  };

  useEffect(() => {
    fetchVersions();
  }, [projectId]);

  useEffect(() => {
    if (selectedVersion) fetchAnnotations(selectedVersion.id);
  }, [selectedVersion]);

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionLabel || !newPreviewUrl) return;

    const { data, error } = await supabase
      .from('deliverable_versions')
      .insert([{ project_id: projectId, version_label: newVersionLabel, preview_url: newPreviewUrl }])
      .select()
      .single();

    if (!error && data) {
      setVersions([data, ...versions]);
      setSelectedVersion(data);
      setNewVersionLabel('');
      setNewPreviewUrl('');
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingPin({ x, y });
  };

  const handleSavePinComment = async () => {
    if (!pendingPin || !commentText.trim() || !selectedVersion) return;

    const { data, error } = await supabase
      .from('deliverable_annotations')
      .insert([
        {
          version_id: selectedVersion.id,
          author_name: 'Studio Admin',
          pin_x: pendingPin.x,
          pin_y: pendingPin.y,
          comment: commentText,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setAnnotations([...annotations, data]);
      setCommentText('');
      setPendingPin(null);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Version Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Version:</span>
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersion(v)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all ${
                selectedVersion?.id === v.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v.version_label}
            </button>
          ))}
        </div>

        {/* Add Version Pop */}
        <form onSubmit={handleAddVersion} className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="v1.1"
            value={newVersionLabel}
            onChange={(e) => setNewVersionLabel(e.target.value)}
            className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
          />
          <input
            type="url"
            placeholder="Preview image/link"
            value={newPreviewUrl}
            onChange={(e) => setNewPreviewUrl(e.target.value)}
            className="w-40 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
          />
          <button type="submit" className="px-2.5 py-1 bg-slate-900 text-white font-bold rounded text-xs">
            + New Version
          </button>
        </form>
      </div>

      {selectedVersion ? (
        <div className="space-y-3">
          {/* Interactive Annotation Board */}
          <div
            onClick={handleCanvasClick}
            className="relative w-full h-[320px] bg-slate-100 rounded-xl border border-dashed border-slate-300 overflow-hidden cursor-crosshair flex items-center justify-center group"
          >
            <p className="text-xs text-slate-400 select-none">
              Click anywhere on deliverable screen to pin an exact feedback comment
            </p>

            {/* Pins Render */}
            {annotations.map((ann, idx) => (
              <div
                key={ann.id}
                style={{ left: `${ann.pin_x}%`, top: `${ann.pin_y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer"
              >
                <span className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">
                  {idx + 1}
                </span>
                <div className="hidden group-hover/pin:block absolute left-6 top-0 bg-slate-900 text-white p-2 rounded text-[11px] w-48 z-20 shadow-lg pointer-events-none">
                  <span className="font-bold block text-emerald-400">{ann.author_name}</span>
                  "{ann.comment}"
                </div>
              </div>
            ))}

            {/* Pending Pin Marker */}
            {pendingPin && (
              <div
                style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-600 rounded-full animate-ping"
              />
            )}
          </div>

          {/* Pin Comment Input */}
          {pendingPin && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-2 items-center text-xs">
              <span className="font-bold text-emerald-800">Pin at ({pendingPin.x}%, {pendingPin.y}%):</span>
              <input
                type="text"
                placeholder="Write specific feedback here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-white border border-emerald-300 rounded px-2 py-1.5 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSavePinComment}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded"
              >
                Drop Pin
              </button>
              <button
                onClick={() => setPendingPin(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 py-4">No deliverable versions uploaded yet.</p>
      )}
    </div>
  );
}