'use client'
import React from 'react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import { motion } from 'framer-motion';

export default function AiAutomationAgency() {
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
            Leading <span className="text-cyan-500">AI Automation Agency</span> in Lucknow
          </motion.h1>

          {/* Intro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-600 mb-12 max-w-3xl leading-relaxed"
          >
            Future-proof your business with the top AI marketing agency in India. We specialize in custom AI chatbot development, WhatsApp automation services, and AI lead generation systems designed to drastically cut costs and multiply your sales.
          </motion.div>

          {/* Problem */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Challenge: Manual Inefficiency</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Are your sales teams wasting hours answering repetitive queries? Are leads falling through the cracks because you can't respond 24/7? Relying solely on manual processes leaves money on the table in today's fast-paced digital economy.
            </p>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Solution: Intelligent Automation</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              We implement AI workflow automation and CRM automation to streamline your operations. As a top chatbot development company in Lucknow, we build AI agents that qualify leads, book appointments, and provide instant customer support round the clock.
            </p>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our AI Automation Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">WhatsApp Automation</h3>
                <p className="text-neutral-600">Automate customer outreach, order updates, and marketing blasts instantly on WhatsApp.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">AI Chatbot Development</h3>
                <p className="text-neutral-600">Custom AI chatbots powered by LLMs to handle complex queries and close sales 24/7.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">CRM & Sales Automation</h3>
                <p className="text-neutral-600">Seamlessly integrate AI agents into your CRM for hands-free lead qualification and follow-ups.</p>
              </div>
            </div>
          </section>

          {/* Case Study */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Case Study: Automating Customer Support</h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-4">
              A local e-commerce brand struggled with high customer service overhead. We deployed a custom AI chatbot and integrated WhatsApp automation services. Customer response times went from 4 hours to 4 seconds, saving the company ₹50,000/month in support costs while increasing conversions.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">What are AI agents development services?</h4>
                <p className="text-neutral-600 mt-2">AI agents act as digital employees. They can scrape data, answer customer questions, book meetings, and update your CRM without human intervention.</p>
              </div>
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">Do I need technical knowledge to use these systems?</h4>
                <p className="text-neutral-600 mt-2">Not at all. We handle the technical setup, integration, and training. You just reap the benefits of increased efficiency.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-cyan-50 rounded-2xl border border-cyan-100">
            <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Growth?</h2>
            <p className="text-neutral-600 text-lg mb-8">Join the AI revolution and stay ahead of your competitors.</p>
            <button 
              className="bg-cyan-500 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
              }}
            >
              Book an AI Strategy Call
            </button>
          </section>

        </div>
      </main>

      <Footer />
      <FloatingCallButton />
    </div>
  );
}
