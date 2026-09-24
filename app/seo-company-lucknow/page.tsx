'use client'
import React from 'react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import { motion } from 'framer-motion';

export default function SeoCompanyLucknow() {
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
            Best <span className="text-indigo-600">SEO Company</span> in Lucknow
          </motion.h1>

          {/* Intro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-600 mb-12 max-w-3xl leading-relaxed"
          >
            Looking to rank your business on Google in Lucknow? We are a top-rated SEO company dedicated to increasing your website traffic and generating quality leads. Our affordable SEO services cover everything from local SEO to technical optimization.
          </motion.div>

          {/* Problem */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Challenge: Invisibility</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Many local businesses struggle to get noticed. You might have a great product, but if you're not on the first page of Google, your competitors are getting the leads. Generic keyword stuffing doesn't work anymore. You need a targeted approach.
            </p>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Solution: ROI-Driven SEO</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Hire our SEO expert in Lucknow to transform your digital presence. We use systems-thinking and AI-first angles to build authority. We focus on high-conversion commercial keywords like "hire SEO expert in Lucknow" and "affordable SEO services" to drive tangible business growth.
            </p>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our SEO Services in Lucknow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Local SEO Services</h3>
                <p className="text-neutral-600">Dominate your area. We optimize for 'SEO company Gomti Nagar' and 'SEO services Aliganj'.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Technical SEO</h3>
                <p className="text-neutral-600">We fix site speed, architecture, and crawlability so Google loves your site.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">On-Page & Off-Page SEO</h3>
                <p className="text-neutral-600">Content optimization and high-quality link building for sustained rankings.</p>
              </div>
            </div>
          </section>

          {/* Case Study */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Case Study: 300% Growth in 6 Months</h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-4">
              We helped a local Lucknow brand increase their leads through SEO by focusing on long-tail blog keywords like "how to grow salon business online" and "best SEO techniques for local business." The result? A first-page Google ranking and 3x more monthly inquiries.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">How long does SEO take?</h4>
                <p className="text-neutral-600 mt-2">Typically, you will start seeing significant improvements in 3 to 6 months depending on the competitiveness of your niche.</p>
              </div>
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">Why are you the best SEO company in Lucknow?</h4>
                <p className="text-neutral-600 mt-2">We avoid corporate copy-paste strategies. We combine strong positioning, developer credibility, and modern design to ensure maximum ROI.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business Online?</h2>
            <p className="text-neutral-600 text-lg mb-8">Stop losing customers to your competitors. Let's get you to the top of Google.</p>
            <button 
              className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
              }}
            >
              Book a Free Strategy Call
            </button>
          </section>

        </div>
      </main>

      <Footer />
      <FloatingCallButton />
    </div>
  );
}
