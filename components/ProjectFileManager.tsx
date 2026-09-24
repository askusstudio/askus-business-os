'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProjectFileManagerProps {
  projectId: number | string;
  userId: string;
  canUpload?: boolean;
}

export default function ProjectFileManager({ projectId, userId, canUpload = true }: ProjectFileManagerProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    const { data } = await supabase
      .from('project_files')
      .select('*, uploader:profiles(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (data) setFiles(data);
  };

  useEffect(() => {
    if (projectId) {
      fetchFiles();
    }
  }, [projectId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Unique file path: projectId/timestamp_filename
      const fileExt = file.name.split('.').pop();
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = `${projectId}/${Date.now()}_${cleanName}.${fileExt}`;

      // 1. Upload to Supabase Storage Bucket
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // File size calculation
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      // 3. Insert record in project_files table
      const { error: dbError } = await supabase
        .from('project_files')
        .insert([{
          project_id: projectId,
          uploaded_by: userId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: sizeStr
        }]);

      if (dbError) throw dbError;

      await fetchFiles();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          📁 Project Assets & Files
        </h4>
        {canUpload && (
          <label className="cursor-pointer bg-[#C8FF91] hover:bg-[#b8f57d] text-black text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow">
            {uploading ? 'Uploading...' : '+ Upload File'}
            <input 
              type="file" 
              disabled={uploading} 
              onChange={handleUpload} 
              className="hidden" 
            />
          </label>
        )}
      </div>

      {files.length === 0 ? (
        <p className="text-xs text-neutral-500 italic py-2">No files or documents uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {files.map((f) => (
            <div key={f.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-200 truncate">{f.file_name}</p>
                <p className="text-[10px] text-neutral-500">
                  {f.file_size} • By {f.uploader?.full_name || 'User'}
                </p>
              </div>
              <a
                href={f.file_url}
                target="_blank"
                rel="noreferrer"
                download
                className="shrink-0 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              >
                Download ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}