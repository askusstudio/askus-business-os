'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AboutStats = () => {
  const stats = [
    { label: 'Successful Projects', value: 200 },
    { label: 'Skilled People', value: 80 },
    { label: 'Client Rating', value: 4.8 },
  ];
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const hasAnimated = useRef(false);

  // Count-up effect triggered by Framer Motion onViewportEnter
  const triggerCountUp = () => {
    if (typeof window === 'undefined' || hasAnimated.current) return;
    hasAnimated.current = true;

    function animateCount(idx: number, target: number, duration: number) {
      const start = 0;
      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);

        setCounts(prev => {
          const next = [...prev];
          next[idx] = current;
          return next;
        });

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setCounts(prev => {
            const next = [...prev];
            next[idx] = target;
            return next;
          });
        }
      }
      requestAnimationFrame(step);
    }

    stats.forEach((stat, i) => {
      setTimeout(() => animateCount(i, stat.value, 1200), i * 200);
    });
  };

  return (
    <section
      id="about"
      className="relative py-16 sm:py-24 md:py-32 bg-white overflow-hidden"
    >
      {/* Dotted gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 bottom-0 w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,_rgba(132,204,22,0.22)_0,_transparent_60%)] opacity-80" />
        <div className="absolute -right-10 bottom-10 w-64 h-64 bg-lime-400/30 blur-3xl rounded-full" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-10 md:mb-14"
        >
          <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.35em] uppercase text-neutral-500">
            <span className="h-px w-10 bg-neutral-600" />
            <span>About Us</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl md:max-w-5xl mb-12 md:mb-16"
        >
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.7rem] font-semibold leading-snug md:leading-snug text-black">
            “Inspiring{' '}
            <span className="text-lime-600">Brands</span> to dream boldly,
            design intelligently, and connect meaningfully—where imagination
            meets innovation and tech drives transformation.”
          </p>
        </motion.div>

        <motion.div
          onViewportEnter={triggerCountUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 md:gap-12 border-t border-neutral-200 pt-10"
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 + 0.4 }}
            >
              <div className="text-4xl md:text-5xl font-extrabold text-black mb-2">
                {counts[i]}<span className="align-top text-2xl">+</span>
              </div>
              <p className="text-sm text-neutral-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutStats;
