'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';

interface ServiceCategory {
  id: string;
  icon: string;
  badge: string;
  title: string;
  positioning: string;
  summary: string;
  items: string[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'startup-setup',
    icon: '🚀',
    badge: 'Registration & Setup',
    title: 'Start Your Business',
    positioning: 'Incorporate & Structure Right',
    summary: 'From incorporation to government licenses and tax registrations.',
    items: [
      'Private Limited Company registration',
      'LLP & Partnership firm registration',
      'One Person Company (OPC) & Proprietorship',
      'Section 8 Company / NGO / Trust registration',
      'Startup India recognition & DPIIT benefits',
      'MSME / Udyam & GST registration',
      'Import Export Code (IEC) & FSSAI Licensing',
      'Digital Signature Certificate (DSC) & PAN/TAN',
    ],
  },
  {
    id: 'compliance',
    icon: '📋',
    badge: 'ROC, MCA & Tax Compliance',
    title: 'Stay Compliant',
    positioning: 'Year-Round Secretarial Support',
    summary: 'Never miss an ROC deadline, board resolution, or statutory mandate.',
    items: [
      'Annual ROC filing & MCA compliance',
      'Director appointments, KYC & DIN filings',
      'Board & Shareholder resolutions & minutes',
      'Maintenance of statutory registers',
      'LLP & Private Limited regular maintenance',
      'GST returns & compliance auditing',
      'Annual compliance calendar & due diligence',
      'Corporate restructuring & entity cleanup',
    ],
  },
  {
    id: 'contracts',
    icon: '📄',
    badge: 'Contracts & Agreements',
    title: 'Protect Your Business',
    positioning: 'Airtight Legal Safeguards',
    summary: 'Drafting contracts that prevent disputes before they occur.',
    items: [
      'Founder & Co-founder Agreements',
      'Shareholders & Investment Agreements',
      'Client, Service & Master Service Agreements (MSA)',
      'Vendor & Freelancer / Consultant contracts',
      'Employment Contracts & Offer Letters',
      'NDA & Non-Compete / Non-Solicit Agreements',
      'Website Terms of Use & Privacy Policies',
      'SaaS, Software Development & Agency Agreements',
    ],
  },
  {
    id: 'ip-brand',
    icon: '🧠',
    badge: 'Trademark, Copyright & IP',
    title: 'Protect Your Brand',
    positioning: 'Intellectual Property Defense',
    summary: 'Turn brand identity, algorithms, and designs into defensible assets.',
    items: [
      'Trademark search, filing & registration',
      'Trademark objection replies & hearings',
      'Trademark renewal & brand monitoring',
      'Copyright registration for code, content & media',
      'Design registration & Patent filing advisory',
      'IP Assignment & IP Licensing agreements',
      'Brand protection & Cease-and-Desist notices',
      'IP infringement dispute resolution',
    ],
  },
  {
    id: 'funding-investment',
    icon: '💰',
    badge: 'Funding & Investment',
    title: 'Raise & Scale',
    positioning: 'Investor-Ready Legal Architecture',
    summary: 'Legal support for angel rounds, seed capital, and institutional VC.',
    items: [
      'Term Sheet review & investor negotiations',
      'Share Subscription Agreements (SSA) & SHA',
      'SAFE notes & convertible debt documentation',
      'ESOP scheme creation & grant letters',
      'Investor due diligence preparation & room setup',
      'Cap table structuring & share transfer advisory',
      'FEMA / RBI compliances for foreign investment',
      'Regulatory compliance for startup fundraising',
    ],
  },
  {
    id: 'disputes-notices',
    icon: '⚔️',
    badge: 'Notices, Disputes & Recovery',
    title: 'Resolve Legal Issues',
    positioning: 'Swift Commercial Resolution',
    summary: 'Actionable support when vendor, client, or partner disputes emerge.',
    items: [
      'Drafting & responding to formal legal notices',
      'Outstanding payment recovery proceedings',
      'Section 138 Cheque bounce legal action',
      'Breach of contract & vendor settlement',
      'Employment & wrongful termination claims',
      'Partnership & shareholder conflict mediation',
      'Commercial dispute arbitration & litigation support',
      'Consumer court dispute defense',
    ],
  },
];

export default function LegalSolutionsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceNeeded: 'Start Your Business',
    message: '',
  });

  const handleInquireClick = (categoryTitle: string) => {
    setFormData((prev) => ({ ...prev, serviceNeeded: categoryTitle }));
    const formElement = document.getElementById('inquiry-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Direct WhatsApp forwarding for instant inquiry capture
    const whatsappNumber = '918009227002'; // Askus Studio official WhatsApp number
    const textMsg = `*New Legal Solutions Inquiry - AskUs Studio*%0A%0A` +
      `*Name:* ${encodeURIComponent(formData.fullName)}%0A` +
      `*Phone:* ${encodeURIComponent(formData.phone)}%0A` +
      `*Email:* ${encodeURIComponent(formData.email)}%0A` +
      `*Service Required:* ${encodeURIComponent(formData.serviceNeeded)}%0A` +
      `*Message:* ${encodeURIComponent(formData.message || 'N/A')}`;

    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${textMsg}`, '_blank');
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-[#bbf770] selection:text-black pt-20">
        {/* Top Hero Section */}
        <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-[#fafafa]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bbf770]/30 border border-[#bbf770] text-emerald-950 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              BUSINESS & STARTUP LEGAL SOLUTIONS
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
              One Legal Partner. <br />
              <span className="underline decoration-[#bbf770] decoration-wavy decoration-3">
                Every Stage of Business.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Whether you're incorporating a company, signing your first client, hiring your team, raising investment, or protecting your brand—we ensure your legal fundamentals are rock-solid.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleInquireClick('General Legal Inquiry')}
                className="bg-[#bbf770] hover:bg-[#a8f255] text-black font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Talk to a Legal Expert →
              </button>
              <a
                href="#services-grid"
                className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-sm sm:text-base px-6 py-3.5 rounded-full shadow-sm transition-all"
              >
                Explore All 6 Practice Areas
              </a>
            </div>
          </div>
        </section>

        {/* 6 Category Practice Areas */}
        <section id="services-grid" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              FULL-LIFECYCLE LEGAL INFRASTRUCTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Structured Legal Solutions For Growing Enterprises
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mt-2">
              Clear scopes, predictable turnarounds, and enterprise-grade compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICE_CATEGORIES.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-3xl p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      {cat.icon}
                    </span>
                    <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{cat.title}</h3>
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mt-0.5">
                    {cat.positioning}
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{cat.summary}</p>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Deliverables:
                    </span>
                    <ul className="space-y-2">
                      {cat.items.map((item, idx) => (
                        <li key={idx} className="flex items-start text-xs text-slate-600 leading-tight">
                          <span className="text-emerald-600 font-bold mr-2">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <button
                    onClick={() => handleInquireClick(cat.title)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors cursor-pointer shadow-sm hover:shadow"
                  >
                    <span>Inquire for {cat.title}</span>
                    <span className="text-sm">→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Integrated Inquiry Form Section */}
        <section
          id="inquiry-form-section"
          className="py-16 sm:py-24 bg-white border-t border-slate-200/80 relative"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bbf770]/40 text-emerald-950 text-[11px] font-bold uppercase tracking-widest">
                Direct Case Review
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                Start Your Legal Consultation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Submit inquiry to connect directly on WhatsApp with our legal experts.
              </p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bbf770] focus:border-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter phone or WhatsApp number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bbf770] focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bbf770] focus:border-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Selected Legal Practice *
                    </label>
                    <select
                      value={formData.serviceNeeded}
                      onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bbf770] focus:border-slate-400 transition-all"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.title}>
                          {cat.icon} {cat.title} ({cat.badge})
                        </option>
                      ))}
                      <option value="General Legal Inquiry">Other / General Legal Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Describe your requirements / Problem statement
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you are trying to register, draft, protect, or resolve..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bbf770] focus:border-slate-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send Inquiry to WhatsApp</span>
                  <span>→</span>
                </button>
              </form>
            </div>

            {/* Legal Compliance Disclaimer */}
            <div className="mt-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center max-w-2xl mx-auto">
              <p className="text-[11px] sm:text-xs text-amber-900/80 leading-relaxed">
                <strong>Notice & Disclaimer:</strong> Legal services are provided through qualified and independent legal professionals/partner advocates. AskUs Studio facilitates access to appropriate legal professionals and business legal solutions.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingCallButton />
    </>
  );
}