'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProjectBriefViewer({ projectId }: { projectId: number | string }) {
  const [brief, setBrief] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrief = async () => {
      const { data } = await supabase
        .from('project_briefs')
        .select('*')
        .eq('project_id', projectId)
        .single();
      if (data) setBrief(data);
      setLoading(false);
    };
    fetchBrief();
  }, [projectId]);

  if (loading) return <p className="text-xs text-slate-400 py-4">Checking onboarding brief...</p>;

  if (!brief) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">📋 Onboarding Questionnaire Awaiting Submission</p>
        <p>The client has not filled out the project onboarding questionnaire yet. A link is available on their Client Portal.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <span className="font-bold text-slate-900 uppercase">Client Requirement Brief</span>
        <span className="text-[10px] text-slate-500 font-mono">Submitted: {new Date(brief.submitted_at).toLocaleDateString()}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Brand Name</span>
          <p className="text-slate-800 font-semibold">{brief.brand_name || 'N/A'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Audience</span>
          <p className="text-slate-800 font-semibold">{brief.target_audience || 'N/A'}</p>
        </div>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Competitor References</span>
        <p className="text-slate-700">{brief.competitor_links || 'None specified'}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Design & Brand Expectations</span>
        <p className="text-slate-700">{brief.design_preferences || 'Standard guidelines'}</p>
      </div>
      {brief.drive_assets_url && (
        <a href={brief.drive_assets_url} target="_blank" rel="noreferrer" className="inline-block text-[11px] font-bold text-emerald-700 hover:underline">
          ↗ Open Brand Assets Drive
        </a>
      )}
    </div>
  );
}