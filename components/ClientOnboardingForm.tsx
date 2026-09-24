'use client'
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ClientOnboardingForm({
  projectId,
  clientId,
  onSubmitted,
}: {
  projectId: number | string;
  clientId: string;
  onSubmitted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand_name: '',
    target_audience: '',
    competitor_links: '',
    design_preferences: '',
    drive_assets_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('project_briefs').insert([
      {
        project_id: Number(projectId),
        client_id: clientId,
        ...formData,
      },
    ]);

    if (!error) {
      alert('Onboarding brief submitted successfully!');
      onSubmitted();
    } else {
      alert('Submission failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-3.5 text-xs">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-900 text-sm">📋 Project Onboarding Brief</h3>
        <p className="text-slate-500">Provide requirements to help our team start your project.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-600 mb-1">Brand Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Askus Studio"
            value={formData.brand_name}
            onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-600 mb-1">Target Audience</label>
          <input
            type="text"
            placeholder="e.g. B2B Founders, Tech Startups"
            value={formData.target_audience}
            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-600 mb-1">Competitor & Reference Websites</label>
        <input
          type="text"
          placeholder="e.g. linear.app, stripe.com"
          value={formData.competitor_links}
          onChange={(e) => setFormData({ ...formData, competitor_links: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-600 mb-1">Design & Feature Expectations</label>
        <textarea
          rows={2}
          placeholder="Tell us specific colors, moods, or features you require..."
          value={formData.design_preferences}
          onChange={(e) => setFormData({ ...formData, design_preferences: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-600 mb-1">Brand Assets Drive / Figma Link</label>
        <input
          type="url"
          placeholder="https://drive.google.com/..."
          value={formData.drive_assets_url}
          onChange={(e) => setFormData({ ...formData, drive_assets_url: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-xs cursor-pointer"
      >
        {loading ? 'Submitting...' : 'Submit Project Brief'}
      </button>
    </form>
  );
}