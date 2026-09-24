'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Menu,
  Instagram,
  Twitter,
  Linkedin,
  Phone,
  Facebook,
  ChevronDown
} from 'lucide-react';

export const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8;
      const y = window.scrollY;
      setScrolledPastHero(y > heroHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.location.hash = id;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] w-full px-4 sm:px-6 md:px-12 flex items-center justify-between pointer-events-auto h-16 sm:h-20 bg-[#C8FF91] shadow-md"
      >
        {/* Left Logo */}
        <div className="flex items-center">
          <a href="/" className="text-sm sm:text-lg md:text-xl font-bold text-black uppercase tracking-[0.1em]">
            ASKUS_STUDIO
          </a>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8 lg:gap-10">
          <a
            href="/#work"
            onClick={(e) => scrollToSection(e, 'work')}
            className="text-base lg:text-lg font-bold tracking-wider text-black/70 hover:text-black transition-colors"
          >
            WORKS
          </a>

          {/* Services Dropdown (Desktop Hover) */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-base lg:text-lg font-bold tracking-wider text-black/70 hover:text-black transition-colors focus:outline-none">
              <span>SERVICES</span>
              <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="absolute top-full left-0 hidden group-hover:block w-64 pt-2 z-50">
              <div className="bg-[#111111] text-white rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col gap-1">
                <a
                  href="/#marketing-card"
                  onClick={(e) => scrollToSection(e, 'marketing-card')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-black hover:bg-[#C8FF91] transition-all"
                >
                  Marketing solutions
                </a>
                <a
                  href="/#tech-card"
                  onClick={(e) => scrollToSection(e, 'tech-card')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-black hover:bg-[#C8FF91] transition-all"
                >
                  Tech solutions
                </a>
                <a
                  href="/#legal-card"
                  onClick={(e) => scrollToSection(e, 'legal-card')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-black hover:bg-[#C8FF91] transition-all"
                >
                  Legal solutions
                </a>
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-500 bg-white/[0.03]">
                  <span>Funding solutions</span>
                  <span className="text-[10px] bg-[#C8FF91]/20 text-[#C8FF91] px-2 py-0.5 rounded-full font-bold">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          <a
            href="/#about"
            onClick={(e) => scrollToSection(e, 'about')}
            className="text-base lg:text-lg font-bold tracking-wider text-black/70 hover:text-black transition-colors"
          >
            ABOUT
          </a>

          <a
            href="/our-product"
            className="text-base lg:text-lg font-bold tracking-wider text-black/70 hover:text-black transition-colors"
          >
            OUR PRODUCT
          </a>
        </div>

        {/* Right Actions (Login + Book Meet) */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="/login"
            className="text-black/80 hover:text-black font-bold text-sm tracking-widest uppercase px-4 py-2 transition-colors"
          >
            LOGIN
          </a>

          <button
            onClick={(e) => {
              e.preventDefault();
              (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
            }}
            className="bg-[#111111] text-white font-bold rounded-full px-7 py-3 items-center hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-md text-sm tracking-widest uppercase"
          >
            BOOK MEET
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex lg:hidden items-center justify-center text-black"
          aria-label="Open menu"
        >
          <Menu size={28} strokeWidth={2.5} />
        </button>
      </motion.nav>

      {/* Fullscreen mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-[9999] p-8 sm:p-10 md:p-12 flex flex-col justify-between overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">MENU</span>
              <button onClick={() => setIsOpen(false)} className="text-white hover:rotate-90 transition-transform">
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col space-y-5 mt-6">
              <a
                href="/#about"
                onClick={(e) => {
                  scrollToSection(e, 'about');
                  setIsOpen(false);
                }}
                className="text-3xl sm:text-4xl font-black text-white hover:text-[#C8FF91] transition-colors tracking-tighter"
              >
                ABOUT
              </a>
              <a
                href="/#work"
                onClick={(e) => {
                  scrollToSection(e, 'work');
                  setIsOpen(false);
                }}
                className="text-3xl sm:text-4xl font-black text-white hover:text-[#C8FF91] transition-colors tracking-tighter"
              >
                WORK
              </a>

              {/* Mobile Services Accordion */}
              <div>
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="flex items-center justify-between w-full text-3xl sm:text-4xl font-black text-white hover:text-[#C8FF91] transition-colors tracking-tighter focus:outline-none"
                >
                  <span>SERVICES</span>
                  <ChevronDown
                    size={28}
                    className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {mobileServicesOpen && (
                  <div className="flex flex-col gap-3 pl-4 pt-3 border-l-2 border-[#C8FF91]/30 mt-2">
                    <a
                      href="/#marketing-card"
                      onClick={(e) => {
                        scrollToSection(e, 'marketing-card');
                        setIsOpen(false);
                      }}
                      className="text-lg font-semibold text-neutral-300 hover:text-white"
                    >
                      Marketing solutions
                    </a>
                    <a
                      href="/#tech-card"
                      onClick={(e) => {
                        scrollToSection(e, 'tech-card');
                        setIsOpen(false);
                      }}
                      className="text-lg font-semibold text-neutral-300 hover:text-white"
                    >
                      Tech solutions
                    </a>
                    <a
                      href="/#legal-card"
                      onClick={(e) => {
                        scrollToSection(e, 'legal-card');
                        setIsOpen(false);
                      }}
                      className="text-lg font-semibold text-neutral-300 hover:text-white"
                    >
                      Legal solutions
                    </a>
                    <div className="flex items-center justify-between text-neutral-500 text-base font-semibold pr-4">
                      <span>Funding solutions</span>
                      <span className="text-xs bg-[#C8FF91]/20 text-[#C8FF91] px-2 py-0.5 rounded-full">
                        Coming soon
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <a
                href="/our-product"
                onClick={() => setIsOpen(false)}
                className="text-3xl sm:text-4xl font-black text-white hover:text-[#C8FF91] transition-colors tracking-tighter"
              >
                OUR PRODUCT
              </a>
              <a
                href="/#agency"
                onClick={(e) => {
                  scrollToSection(e, 'agency');
                  setIsOpen(false);
                }}
                className="text-3xl sm:text-4xl font-black text-white hover:text-[#C8FF91] transition-colors tracking-tighter"
              >
                AGENCY
              </a>
              <a
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-3xl sm:text-4xl font-black text-[#C8FF91] transition-colors tracking-tighter"
              >
                LOGIN
              </a>
            </div>

            <div className="flex flex-col gap-6 pt-6">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' });
                }}
                className="w-full text-center text-base font-bold bg-[#C8FF91] text-black px-8 py-4 rounded-full shadow-lg active:scale-95"
              >
                BOOK MEET
              </motion.button>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/askus_studio/" target="_blank" rel="noreferrer">
                  <Instagram className="text-white/40 hover:text-white cursor-pointer" />
                </a>
                <Twitter className="text-white/40 hover:text-white cursor-pointer" />
                <a href="https://www.linkedin.com/company/askus-studio/posts/?feedView=all" target="_blank" rel="noreferrer">
                  <Linkedin className="text-white/40 hover:text-white cursor-pointer" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 overflow-hidden font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8 mb-12 md:mb-16 items-start">

          {/* Left Block - Logo & Company Info */}
          <div className="flex flex-col items-start lg:col-span-1">
            <div className="mb-6">
              <img src="/logo/site-logo.jpg" alt="Askus Studio" className="w-28 h-28 rounded-full object-cover" />
            </div>
            <p className="text-neutral-400 text-[13px] leading-relaxed mb-6 max-w-[320px]">
              Askus Studio is a leading digital marketing agency in Lucknow. We provide sophisticated business solutions including top-tier SEO services, website development, AI automation, and ROI-driven marketing to small and big companies worldwide.
            </p>
            <div className="space-y-3 text-[13px] text-neutral-400">
              <div>
                <span className="text-white font-semibold">📍 Find Us:</span>
                <p className="mt-1"> Near V-Mart, Baldev Vihar, Nilmatha Bazar, Telibagh, Lucknow, Uttar Pradesh 226002, India</p>
              </div>
              <div>
                <span className="text-white font-semibold">✉ E-mail:</span>
                <p className="mt-1">
                  <a href="mailto:askusstudio@gmail.com" className="text-indigo-400 hover:text-white transition-colors">askusstudio@gmail.com</a>
                </p>
              </div>
              <div>
                <span className="text-white font-semibold">📄 Send Your C.V:</span>
                <p className="mt-1">
                  <a href="mailto:askusstudio@gmail.com" className="text-indigo-400 hover:text-white transition-colors">askusstudio@gmail.com</a>
                </p>
              </div>
              <div>
                <span className="text-white font-semibold">📞 For Business Inquiry:</span>
                <p className="mt-1">
                  <a href="tel:+918009227002" className="hover:text-white transition-colors">+91 80092 27002</a>
                </p>
              </div>
            </div>
            <div className="mt-6 text-[#a3a3a3] text-[12px] font-medium leading-[1.6] max-w-[280px]">
              CIN- U73100UP2026OPC242684<br />
              ASKUS INNOVATIONS PRIVATE LIMITED
            </div>
          </div>

          {/* Our Services */}
          <div className="flex flex-col gap-1">
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Our Services</h4>
            {[
              "Website Designing",
              "Cloud Services",
              "Digital Marketing",
              "Android/iOS App Development",
              "Domain and Hosting",
              "Custom Softwares Development",
              "Application Maintenance",
              "E-Commerce Solution",
              "Software Testing",
              "Search Engine Optimization",
              "Maintenance & Consultancy",
              "IT Internship Program",
              "IoT Development",
            ].map((item) => (
              <a key={item} href="/our-product" className="text-[13px] text-neutral-400 hover:text-white transition-colors py-1.5 border-b border-white/5 last:border-0">
                {item}
              </a>
            ))}
          </div>

          {/* Our Products */}
          <div className="flex flex-col gap-1">
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Our Products</h4>
            {[
              "Job Portal Software",
              "Hostel Management Software",
              "Online Exam Software",
              "HRM Software",
              "Payroll Generation Software",
              "E-Commerce Platform",
              "CRM System",
              "Accounts/Billing Software",
              "Factory Management Software",
              "Real Estate Management Software",
              "Transport Management",
              "MLM Software",
              "User Tax Collection Software",
            ].map((item) => (
              <a key={item} href="/our-product" className="text-[13px] text-neutral-400 hover:text-white transition-colors py-1.5 border-b border-white/5 last:border-0">
                {item}
              </a>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-1">
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Quick Links</h4>
            {[
              { label: "About Us", href: "/#about" },
              { label: "Contact Us", href: "#", onClick: true },
              { label: "Portfolio", href: "/#work" },
              { label: "Privacy & Policy", href: "/privacy-policy" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.onClick ? (e) => { e.preventDefault(); (window as any).Calendly?.initPopupWidget({ url: 'https://calendly.com/askusstudio/30min' }); } : undefined}
                className="text-[13px] text-neutral-400 hover:text-white transition-colors py-1.5 border-b border-white/5 last:border-0"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* SEO Keywords */}
          <div className="flex flex-col gap-1">
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Top SEO Services</h4>
            {[
              { label: "SEO Company in Lucknow", href: "/seo-company-lucknow" },
              { label: "Digital Marketing Agency in Lucknow", href: "/digital-marketing-agency-lucknow" },
              { label: "Website Development Company in Lucknow", href: "/web-development-company-lucknow" },
              { label: "PPC Services in Lucknow", href: "/ppc-services-lucknow" },
              { label: "Social Media Marketing Agency in Lucknow", href: "/digital-marketing-agency-lucknow" },
              { label: "Lead Generation Company in Lucknow", href: "/seo-company-lucknow" },
              { label: "Google Ads Expert in Lucknow", href: "/ppc-services-lucknow" },
              { label: "Branding Agency in Lucknow", href: "/digital-marketing-agency-lucknow" },
              { label: "AI Automation Agency Lucknow", href: "/ai-automation-agency-lucknow" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] text-neutral-400 hover:text-white transition-colors py-1.5 border-b border-white/5 last:border-0"
              >
                {item.label}
              </a>
            ))}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-[#333] min-h-[50px]">
          <div className="flex gap-4 md:absolute md:left-0">
            <a href="https://www.linkedin.com/company/askus-studio/posts/?feedView=all" className="w-[34px] h-[34px] rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors">
              <Linkedin size={16} fill="currentColor" strokeWidth={0} />
            </a>
            <a href="https://www.instagram.com/askus_studio/" className="w-[34px] h-[34px] rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors">
              <Instagram size={16} strokeWidth={2.5} />
            </a>
            <a href="https://www.facebook.com/p/AskUs-Studio-61571452027819/" className="w-[34px] h-[34px] rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors">
              <Facebook size={16} fill="currentColor" strokeWidth={0} />
            </a>
          </div>
          <div className="text-[#a3a3a3] text-sm font-medium text-center">
            © 2026 Askus studio. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export const FloatingCallButton = () => {
  return (
    <a
      href="tel:+918009227002"
      aria-label="Call us"
      className="
        fixed bottom-5 right-5 z-[200]
        flex items-center gap-3
        bg-[#C2FF83] text-black
        px-5 py-4 rounded-full
        shadow-2xl
        hover:scale-105 active:scale-95
        transition-all duration-300
      "
    >
      <Phone className="w-5 h-5" />
      <span className="hidden sm:inline font-bold tracking-wide">
        Call Now
      </span>
    </a>
  );
};