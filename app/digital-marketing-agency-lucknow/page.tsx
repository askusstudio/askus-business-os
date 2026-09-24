'use client'
import React from 'react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import { motion } from 'framer-motion';

export default function DigitalMarketingAgency() {
  return (
    <div className="bg-white text-black selection:bg-indigo-600 selection:text-white overflow-x-hidden font-sans">
      <div className="bg-black text-white">
        <Nav />
      </div>

      <main className="pt-32 pb-24">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          {/* H1 */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-8 leading-tight uppercase tracking-tighter"
          >
            Best <span className="text-lime-500">Digital Marketing Agency</span> in Lucknow
          </motion.h1>

          {/* Intro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-600 mb-12 max-w-3xl leading-relaxed"
          >
            We are the top digital marketing agency in Lucknow, offering internet marketing services that convert. From social media marketing to AI lead generation, we help small businesses and startups dominate their market.
          </motion.div>

          {/* Problem */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Challenge: Standing Out</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Most agencies are keyword optimized but brand weak. They use generic designs and corporate copy-paste strategies. In today's landscape, if your online presence lacks modern design, developer credibility, and an AI-first angle, you will struggle to generate quality leads.
            </p>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Solution: Systems Thinking</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Hire a digital marketer in Lucknow that understands growth engineering. We combine AI workflows, custom AI chatbots, and ROI-driven marketing to build systems that attract and convert customers automatically. We are the ultimate online marketing company for modern brands.
            </p>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Digital Marketing Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Social Media Marketing</h3>
                <p className="text-neutral-600">Expert Instagram marketing and YouTube marketing agency services to build brand loyalty.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Lead Generation</h3>
                <p className="text-neutral-600">The premier lead generation company in Lucknow using AI lead generation and WhatsApp automation.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Branding Agency in Lucknow</h3>
                <p className="text-neutral-600">Personal branding, startup marketing, graphic design, and video editing services.</p>
              </div>
            </div>
          </section>

          {/* Case Study */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Case Study: Dominating Hazratganj</h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-4">
              We worked with a local retail store looking for a digital marketing company in Hazratganj. By combining Meta ads and content marketing services, we increased their in-store foot traffic by 150% in just two months.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">Why hire a digital marketing company?</h4>
                <p className="text-neutral-600 mt-2">A dedicated agency brings expertise, tools, and systems thinking to grow your business online faster than you could on your own.</p>
              </div>
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">What makes Askus Studio different?</h4>
                <p className="text-neutral-600 mt-2">We prioritize AI automation, modern design aesthetics, and genuine ROI over vanity metrics. We are not just marketers; we are growth engineers.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-lime-50 rounded-2xl border border-lime-200">
            <h2 className="text-3xl font-bold mb-4">Partner with the Best Marketing Agency Near Me</h2>
            <p className="text-neutral-600 text-lg mb-8">Ready to transform your brand and generate quality leads?</p>
            <button 
              className="bg-black text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-neutral-800 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
              }}
            >
              Book a Strategy Call
            </button>
          </section>

        </div>
      </main>

      <Footer />
      <FloatingCallButton />
    </div>
  );
}
