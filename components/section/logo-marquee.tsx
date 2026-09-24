'use client'
import React from 'react';
import { motion } from 'framer-motion';

const LogoMarquee = () => {
  const logos = [
    { name: 'Digital India', src: '/logo/Digital india.png' },
    { name: 'Mca', src: '/logo/mca logo.png' },
    { name: 'statupindia', src: '/logo/image.png' },
    { name: 'MSME', src: '/logo/msme logo .png' },
    { name: 'GST', src: '/logo/gst logo.jpeg' },
    { name: 'Make in India', src: '/logo/maake in india.jpeg' },

  ];

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-sm font-semibold text-black/60 uppercase tracking-[0.2em] mb-6">
            Our Certifications & Partners
          </h2>
          <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
            Recognized & Certified
          </h3>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee Animation */}
        <div className="flex">
          <div
            className="logo-marquee-track flex gap-8 md:gap-16 lg:gap-24 items-center"
            style={{ animation: "logo-marquee-scroll 6s linear infinite" }}
          >
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 flex items-center justify-center bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 sm:p-6 md:p-8"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              </div>
            ))}
            {/* Second set of logos (for seamless loop) */}
            {logos.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 flex items-center justify-center bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 sm:p-6 md:p-8"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
