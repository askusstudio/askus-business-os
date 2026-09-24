'use client'
import React from 'react';
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

export default function App() {
  return (
    <div className="bg-black text-white selection:bg-indigo-600 selection:text-white overflow-x-hidden">
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
    </div>
  );
}
