'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Services = () => {
  const [activeCard, setActiveCard] = useState<string>('');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveCard(hash);
        const timer = setTimeout(() => setActiveCard(''), 3000);
        return () => clearTimeout(timer);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const list = [
    {
      id: "marketing-card",
      title: "BRAND",
      items: ["Brand Strategy", "360° Creative", "Art Direction", "Copywriting", "Editing", "Motion Graphics", "DTP"],
      bgColor: "bg-[#36785D]",
      textColor: "text-white",
      rotation: "rotate-[-10deg]",
      yOffset: "-translate-y-4 md:-translate-y-8",
      zIndex: "z-10",
    },
    {
      id: "social-card",
      title: "SOCIAL",
      items: ["Social Media Strategy", "Social Media Creative", "TikTok/Social Shopping", "Influencer Campaigns", "Scheduling Support", "Community Management", "Social Listening"],
      bgColor: "bg-[#7192F5]",
      textColor: "text-black",
      rotation: "rotate-[6deg]",
      yOffset: "translate-y-12 md:translate-y-24",
      zIndex: "z-20",
    },
    {
      id: "legal-card",
      title: "ACTIVATIONS",
      items: ["Activation Strategy", "Event Planning", "Art Direction", "Production"],
      bgColor: "bg-[#FA8041]",
      textColor: "text-black",
      rotation: "rotate-[-6deg]",
      yOffset: "-translate-y-8 md:-translate-y-16",
      zIndex: "z-30",
    },
    {
      id: "video-card",
      title: "VIDEO PRODUCTION",
      items: ["Campaign video", "Branded content", "Social content", "Marketing material"],
      bgColor: "bg-[#B42A5C]",
      textColor: "text-white",
      rotation: "rotate-[4deg]",
      yOffset: "translate-y-4 md:translate-y-8",
      zIndex: "z-40",
    },
    {
      id: "tech-card",
      title: "MOBILE & WEB",
      items: ["Custom Websites", "iOS & Android Apps", "E-commerce Stores", "Web Applications", "UI/UX Design"],
      bgColor: "bg-[#ECA2F9]",
      textColor: "text-black",
      rotation: "rotate-[-8deg]",
      yOffset: "translate-y-16 md:translate-y-32",
      zIndex: "z-50",
    },
  ];

  return (
    <section id="services" className="py-16 md:py-48 bg-[#F2EFE8] overflow-hidden flex flex-col items-center scroll-mt-10">
      <div className="mb-12 md:mb-32 text-center relative z-0 px-4">
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-black tracking-tight">
          CALL US IF YOU <span className="relative inline-block italic font-serif">
            Need:
            {/* Sketchy underline SVG */}
            <svg className="absolute -bottom-4 left-0 w-[110%] h-6" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M5 15 Q 40 5, 95 10 Q 50 15, 10 18" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </h2>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center max-w-screen-2xl mx-auto px-4 sm:px-6 pt-4 md:pt-10 pb-16 md:pb-32 w-full">
        {list.map((s, i) => {
          const isSelected = activeCard === s.id;

          return (
            <div
              key={i}
              id={s.id}
              className={`relative md:${s.yOffset} ${i !== 0 ? 'mt-6 md:mt-0 md:-ml-24 lg:-ml-32' : ''} ${isSelected ? 'z-[60]' : s.zIndex} scroll-mt-32 transition-all duration-500`}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={isSelected ? { scale: 1.1, y: -30, rotate: 0 } : {}}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 12 }}
                className={`
                  relative w-[280px] sm:w-[300px] md:w-[300px] lg:w-[380px] min-h-[320px] sm:min-h-[380px] lg:min-h-[520px] flex-shrink-0 
                  ${s.bgColor} ${s.textColor} 
                  rounded-3xl p-8 lg:p-12 shadow-2xl
                  transition-all duration-300 ease-in-out
                  ${!isSelected ? `md:${s.rotation}` : 'ring-4 ring-black/80 shadow-[0_35px_70px_rgba(0,0,0,0.45)]'}
                  hover:!-translate-y-8 md:hover:!-translate-y-16 hover:!rotate-0 hover:!z-50 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]
                  cursor-pointer
                `}
              >
                <h3 className="text-2xl lg:text-3xl font-black mb-6 tracking-wide">{s.title}</h3>

                {/* Separator line */}
                <div className={`w-full h-0.5 mb-6 opacity-30 ${s.textColor === 'text-white' ? 'bg-white' : 'bg-black'}`}></div>

                <ul className="space-y-4">
                  {s.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm lg:text-base font-bold">
                      <span className="mt-0.5 opacity-80">✦</span>
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Services;