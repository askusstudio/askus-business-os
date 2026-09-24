'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { MoveRight } from 'lucide-react';

const Agency = () => {
  return (
    <section id="agency" className="py-16 sm:py-24 md:py-32 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
            <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-[0.4em] mb-12">The Agency</h2>
            <p className="text-2xl sm:text-4xl md:text-7xl font-bold text-black leading-tight tracking-tighter mb-8 md:mb-12">
              We believe in <span className="italic font-serif">results</span> and the power of AI + modern positioning.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <p className="text-neutral-500 text-lg leading-relaxed">
                Hire the best digital marketer in Lucknow. We are an ROI-driven marketing agency that focuses on generating quality leads and helping you grow your business online through cutting edge AI workflows.
              </p>
              <p className="text-neutral-500 text-lg leading-relaxed">
                From affordable SEO services to custom AI chatbot development, we build systems that scale. We work with brands that want top-rated SEO company results and strong positioning.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-neutral-900 aspect-square rounded-sm overflow-hidden border border-white/5 relative group"
          >
            <img
              src="./caty.jpg"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              alt="top digital marketing agency in lucknow"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Agency;
