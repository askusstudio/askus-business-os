'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MARKETING_SERVICES = [
  {
    icon: '📈',
    badge: 'ROI & Revenue Driven',
    title: 'Performance Marketing & Ads',
    description: 'High-converting Google Ads, Meta (Facebook & Instagram) ad campaigns optimized for low CAC and maximum ROAS.',
    deliverables: ['Search & Display Ads', 'Meta Performance Campaigns', 'Retargeting Funnels', 'Ad Creative & Copywriting', 'Conversion Tracking Setup']
  },
  {
    icon: '🎯',
    badge: 'Organic Search Authority',
    title: 'Search Engine Optimization (SEO)',
    description: 'Data-backed on-page, off-page, and technical SEO strategies designed to rank your business #1 on Google for high-intent queries.',
    deliverables: ['Technical SEO Audits', 'Keyword Intent Architecture', 'Local SEO & Google Business Profile', 'High-Domain Backlink Acquisition', 'Core Web Vitals Optimization']
  },
  {
    icon: '📱',
    badge: 'Community & Brand Recall',
    title: 'Social Media & Brand Growth',
    description: 'Build organic trust, high-impact short-form video strategies (Reels/Shorts), and authoritative brand storytelling.',
    deliverables: ['Content Calendar Strategy', 'Viral Reel & Video Production', 'Community Management', 'LinkedIn Executive Branding', 'Influencer Partnerships']
  },
  {
    icon: '🎨',
    badge: 'Identity & Visual Impact',
    title: 'Brand Identity & Creative Direction',
    description: 'Visual identity systems that give modern tech startups and growing businesses an unforgettable market presence.',
    deliverables: ['Logo & Visual Styleguides', 'Social Media Design Kits', 'Marketing Collateral', 'Packaging & Pitch Decks', 'UI/UX Brand Assets']
  }
];

export default function MarketingSolutionsPage() {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', service: 'Performance Marketing & Ads', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleInquire = (serviceName: string) => {
    setFormData((prev) => ({ ...prev, service: serviceName }));
    const formEl = document.getElementById('marketing-inquiry');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-[#C8FF91] selection:text-black">
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#fafafa] text-center px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8FF91]/40 border border-[#C8FF91] text-emerald-950 text-xs font-bold uppercase tracking-widest mb-6">
            Growth & Performance Marketing
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Scale Your Revenue With <br />
            <span className="underline decoration-[#C8FF91] decoration-wavy decoration-3">Data-Driven Marketing</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            From precision Google & Meta ad campaigns to aggressive organic SEO and viral content systems that turn clicks into paying clients.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handleInquire('Performance Marketing & Ads')}
              className="bg-[#C8FF91] hover:bg-[#b8f57d] text-black font-bold px-7 py-3.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-sm sm:text-base"
            >
              Get Free Growth Audit →
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MARKETING_SERVICES.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl p-2.5 bg-slate-50 border border-slate-100 rounded-xl">{item.icon}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">{item.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Scope & Execution:</span>
                  <ul className="space-y-1.5">
                    {item.deliverables.map((del, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span> {del}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => handleInquire(item.title)}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Inquire for {item.title} →
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="marketing-inquiry" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Request Marketing Proposal</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Get custom marketing strategy and timeline within 24 hours.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">🎉</span>
                <h3 className="text-lg font-bold text-slate-900">Inquiry Received!</h3>
                <p className="text-xs text-slate-500 mt-1">Our marketing growth strategist will connect with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                    <input
                      required
                      type="tel"
                      placeholder="Enter phone or WhatsApp number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Service</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                    >
                      {MARKETING_SERVICES.map((s, i) => (
                        <option key={i} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Goals / Budget</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your brand, current monthly ad spend or target revenue goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {loading ? 'Submitting...' : 'Submit Marketing Inquiry →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}