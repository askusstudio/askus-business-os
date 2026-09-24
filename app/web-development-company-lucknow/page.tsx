'use client'
import React from 'react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import { motion } from 'framer-motion';

export default function WebDevelopmentCompany() {
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
            Top <span className="text-indigo-600">Website Development</span> Company in Lucknow
          </motion.h1>

          {/* Intro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-600 mb-12 max-w-3xl leading-relaxed"
          >
            We are a premium website development company in Lucknow and Jankipuram, building high-end, converting websites for startups and enterprises. Whether you need a web design company in Lucknow or expert Shopify development, we deliver modern digital experiences.
          </motion.div>

          {/* Problem */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Challenge: Outdated Web Design</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              A website that looks like it was built in 2010 won't convert today's buyers. Many agencies deliver slow, unoptimized, and visually poor sites that hurt your developer credibility and brand positioning.
            </p>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The Solution: Next-Gen Web Development</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              We focus on modern design aesthetics, dynamic animations, and fast load times. As a leading WordPress development company in Lucknow, we build robust, scalable platforms tailored to your business goals.
            </p>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Web Development Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Website Design</h3>
                <p className="text-neutral-600">Premium UI/UX design with a focus on high aesthetics and user engagement.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">E-Commerce Website Development</h3>
                <p className="text-neutral-600">Top-rated Shopify development and WooCommerce solutions to drive online sales.</p>
              </div>
              <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Custom Web Apps</h3>
                <p className="text-neutral-600">Building scalable web applications and SaaS products using React, Next.js, and more.</p>
              </div>
            </div>
          </section>

          {/* Case Study */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Case Study: E-Commerce Transformation</h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-4">
              We partnered with a local fashion retailer for ecommerce website development Lucknow. By migrating them to a custom Shopify development stack and optimizing for speed, their online sales grew by 200% in the first quarter.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">Which platform is best for my website?</h4>
                <p className="text-neutral-600 mt-2">It depends on your needs. We are a leading WordPress development company in Lucknow for content sites, and recommend Shopify development for eCommerce.</p>
              </div>
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="font-bold text-lg">Are your websites mobile-friendly?</h4>
                <p className="text-neutral-600 mt-2">Absolutely. Every site we build is fully responsive and optimized for mobile devices.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h2 className="text-3xl font-bold mb-4">Need a High-Performance Website?</h2>
            <p className="text-neutral-600 text-lg mb-8">Work with the best website development company in Jankipuram and Lucknow.</p>
            <button 
              className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
              }}
            >
              Start Your Project
            </button>
          </section>

        </div>
      </main>

      <Footer />
      <FloatingCallButton />
    </div>
  );
}
