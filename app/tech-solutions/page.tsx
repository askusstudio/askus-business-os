'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';

const TECH_SERVICES = [
  {
    icon: '💻',
    badge: 'Modern Web Engineering',
    title: 'Full-Stack Web & SaaS Applications',
    description: 'High-speed web platforms, enterprise software, and scalable SaaS solutions built with Next.js, React, Node.js, and cloud databases.',
    deliverables: ['Custom Web Architecture', 'Next.js & React Frontend', 'REST & GraphQL APIs', 'Supabase & Postgres Integration', 'Scalable Microservices']
  },
  {
    icon: '📱',
    badge: 'Cross-Platform & Native',
    title: 'Mobile App Development',
    description: 'Fluid iOS and Android mobile experiences engineered with React Native and Flutter with offline sync and cloud push notifications.',
    deliverables: ['iOS & Android Apps', 'React Native & Flutter', 'In-App Payment Gateways', 'App Store / Play Store Deployment', 'Real-time WebSocket Sync']
  },
  {
    icon: '🤖',
    badge: 'Intelligent Workflows',
    title: 'AI Automation & Copilots',
    description: 'Custom AI chatbots, automated business workflow pipelines, LangChain integrations, and LLM fine-tuning for your enterprise data.',
    deliverables: ['Custom AI Agents & Copilots', 'RAG & Knowledge Base Search', 'Workflow Automation (n8n/Make)', 'CRM & ERP AI Integrations', 'Smart Data Extractors']
  },
  {
    icon: '☁️',
    badge: 'DevOps & Reliability',
    title: 'Cloud Infrastructure & Security',
    description: 'Zero-downtime CI/CD pipelines, Docker containerization, AWS/GCP architecture, and bulletproof database security.',
    deliverables: ['AWS / GCP Cloud Architecture', 'Docker & Kubernetes Setup', 'Automated CI/CD Pipelines', 'Database Optimization & Backups', 'Application Security Hardening']
  }
];

export default function TechSolutionsPage() {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', service: 'Full-Stack Web & SaaS Applications', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const whatsappNumber = '918009227002';
    const textMsg = `*New Tech & Software Inquiry - AskUs Studio*%0A%0A` +
      `*Name:* ${encodeURIComponent(formData.fullName)}%0A` +
      `*Phone:* ${encodeURIComponent(formData.phone)}%0A` +
      `*Email:* ${encodeURIComponent(formData.email)}%0A` +
      `*Scope:* ${encodeURIComponent(formData.service)}%0A` +
      `*Tech Details:* ${encodeURIComponent(formData.message || 'N/A')}`;

    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${textMsg}`, '_blank');
  };

  const handleInquire = (serviceName: string) => {
    setFormData((prev) => ({ ...prev, service: serviceName }));
    const formEl = document.getElementById('tech-inquiry');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-[#C8FF91] selection:text-black pt-20">
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#fafafa] text-center px-4">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8FF91]/40 border border-[#C8FF91] text-emerald-950 text-xs font-bold uppercase tracking-widest mb-6">
              Enterprise Tech & Software Architecture
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Build Scalable Products With <br />
              <span className="underline decoration-[#C8FF91] decoration-wavy decoration-3">Modern Engineering</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              We architect and build full-stack web applications, mobile platforms, and AI automations that scale seamlessly with your company.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => handleInquire('Full-Stack Web & SaaS Applications')}
                className="bg-[#C8FF91] hover:bg-[#b8f57d] text-black font-bold px-7 py-3.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-sm sm:text-base"
              >
                Consult Tech Lead →
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TECH_SERVICES.map((item, idx) => (
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
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Technical Capabilities:</span>
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

        <section id="tech-inquiry" className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Start Your Tech Project</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Discuss architecture and deliverables directly with our team on WhatsApp.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Technology Scope</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                    >
                      {TECH_SERVICES.map((s, i) => (
                        <option key={i} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Scope & Tech Stack</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your app idea, web portal features, or AI workflow requirement..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Submit Inquiry to WhatsApp</span>
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingCallButton />
    </>
  );
}