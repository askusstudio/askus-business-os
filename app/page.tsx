'use client'
import React, { useState } from 'react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import VideoReel from '@/components/section/work-vdo';

import Hero from '@/components/section/hero';
import AboutStats from '@/components/section/about-stats';
import ClientLogos from '@/components/section/client-logos';
import Work from '@/components/section/work';
import ServicesSection from '@/components/section/services-section';
import Services from '@/components/section/services';
import LogoMarquee from '@/components/section/logo-marquee';
import Agency from '@/components/section/agency';
import FAQ from '@/components/section/faq';

import AICopilot from '@/components/AICopilot';

export default function App() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="bg-black text-white selection:bg-indigo-600 selection:text-white overflow-x-hidden relative">
      <Nav />
      <main>
        <Hero />
        <AboutStats />
        <ClientLogos />
        <VideoReel />
        <Work />

        {/* <ServicesSection /> */}
        <Services />
        <LogoMarquee />
        <Agency />
        <FAQ />
      </main>
      <Footer />
      <FloatingCallButton />

      {/* Floating AI Copilot Trigger matching Call Now Style */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#bbf770] hover:bg-[#aef25c] text-black font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-black/10"
        >
          <span className="text-base">✨</span>
          <span>Ask AI Copilot</span>
        </button>
      </div>

      {/* Global AI Copilot Drawer */}
      <AICopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}