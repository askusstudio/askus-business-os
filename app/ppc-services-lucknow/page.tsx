'use client'
import React from 'react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import { motion } from 'framer-motion';

export default function PpcServicesLucknow() {
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
            Expert <span className="text-amber-500">PPC Services</span> in Lucknow
          </motion.h1>

          {/* Intro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-600 mb-12 max-w-3xl leading-relaxed"
          >
            Maximize your ROI with the leading Google Ads agency in Lucknow. We are a performance marketing agency that specializes in generating quality leads through highly targeted Google Ads, Meta Ads, and Facebook Ads.
          </motion.div>

          {/* Problem */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Challenge: Wasted Ad Spend</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Are you pouring money into Google or Facebook ads with no tangible return? Generic campaigns set up by inexperienced marketers drain your budget fast. You need a data-driven approach to convert clicks into paying customers.
            </p>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Solution: Precision Targeting</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              As a specialized PPC company in Lucknow, we use advanced AI workflows and rigorous A/B testing to optimize your campaigns. From Meta ads agency services to Google Ads, we ensure every rupee spent contributes to your bottom line.
            </p>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Performance Marketing Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Google Ads Management</h3>
                <p className="text-neutral-600">Search, Display, and Performance Max campaigns managed by top-tier experts.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Meta & Facebook Ads</h3>
                <p className="text-neutral-600">Hire a premier Facebook ads agency in Lucknow to generate highly qualified leads.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Conversion Optimization</h3>
                <p className="text-neutral-600">We don't just drive traffic; we optimize landing pages to maximize conversion rates.</p>
              </div>
            </div>
          </section>

          {/* Case Study */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Case Study: 4x ROI for Local Service Provider</h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-4">
              A local B2B service company struggled with high cost-per-acquisition. As their new Google Ads agency in Lucknow, we restructured their campaigns to target high-intent commercial keywords. Within 30 days, their CPL dropped by 60% and ROI increased by 4x.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">SEO vs Google Ads for local business?</h4>
                <p className="text-neutral-600 mt-2">SEO is a long-term investment for sustainable traffic, while Google Ads provides immediate visibility and leads. We recommend a hybrid approach.</p>
              </div>
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">Do you guarantee leads?</h4>
                <p className="text-neutral-600 mt-2">We guarantee a highly optimized, data-driven system. We have a track record of consistently lowering CPA and increasing lead volume for our clients.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-100">
            <h2 className="text-3xl font-bold mb-4">Stop Wasting Ad Spend</h2>
            <p className="text-neutral-600 text-lg mb-8">Work with the top PPC company in Lucknow and watch your ROI skyrocket.</p>
            <button 
              className="bg-amber-500 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
              }}
            >
              Get a Free PPC Audit
            </button>
          </section>

        </div>
      </main>

      <Footer />
      <FloatingCallButton />
    </div>
  );
}
