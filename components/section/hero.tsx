'use client'
import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative w-full bg-[#FDFDF9] overflow-hidden flex flex-col items-center pt-28 sm:pt-36 md:pt-46 pb-0 font-sans z-10">

      {/* Background Gradient */}
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[#FEFCFE] -z-10" />


      {/* SVG filter to create pencil sketch effect */}
      <svg width="0" height="0" className="absolute hidden">
        <filter id="sketch-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Headline */}
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
          }
        }}
        className="text-[1.6rem] sm:text-[2.2rem] md:text-5xl lg:text-[5rem] font-black leading-[0.95] tracking-tight text-center mb-3 z-10 uppercase px-4 text-black"
      >
        {"WE'RE NOT YOUR TYPICAL".split("").map((char, index) => (
          <motion.span
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
        <br />
        <motion.span 
          className="text-[#C2FF83] relative inline-block"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { delay: 1.2, type: "spring", bounce: 0.5 } }
          }}
        >
          AGENCY
          {/* <svg
            className="absolute top-1/2 left-1/2 w-[110%] h-[150%] -translate-x-1/2 -translate-y-[45%] pointer-events-none rotate-[20deg]"
            viewBox="0 0 200 100"
            fill="none"
            preserveAspectRatio="none"
          >
            The unclosed pencil circle
            <path
              d="M30,80 C10,50 20,10 100,10 C180,10 190,50 160,85 C130,120 70,110 40,95"
              stroke="#C2FF83"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </svg> */}
          <svg
            className="absolute -top-[15%] -right-[5%] w-[15%] h-[60%] pointer-events-none"
            viewBox="0 0 50 50"
            fill="none"
          >
            {/* The highlight sparks top right */}
            <path
              d="M10,40 L0,20 M25,35 L25,10 M40,35 L50,20"
              stroke="#C2FF83"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      </motion.h1>

      {/* Subhead */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm md:text-base text-neutral-600 max-w-6xl mx-auto text-center mb-5 z-10 font-medium  px-4"
      >
        If you own a business or a startup And looking to build a rememble brand. then your search is done. Let us help you stand out from your competitors.
      </motion.p>

      {/* Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
        className="flex items-center gap-1 p-1 rounded-full border border-[#C2FF83] bg-white hover:scale-105 transition-transform z-10 shadow-md group"
      >
        <div className="bg-[#C2FF83] rounded-full px-5 h-[38px] flex items-center justify-center transition-colors group-hover:bg-[#C2FF83]">
          <span className="text-black text-[0.95rem] font-serif italic tracking-wide pr-0.5">Our Portfolio</span>
        </div>
        <div className="bg-[#C2FF83] rounded-full w-[38px] h-[38px] flex items-center justify-center transition-colors group-hover:bg-[#C2FF83]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      </motion.button>

      {/* Hanging Cards Section - Perfectly Mapped to Curve */}
      <div className="relative w-full max-w-[1400px] flex justify-center items-start z-0 h-[220px] sm:h-[320px] md:h-[380px] lg:h-[420px] -mt-4 sm:-mt-10 md:-mt-16">
        {/* The curved wire */}
        <div className="absolute top-0 left-0 w-full h-[180px] sm:h-[250px] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1000 250" preserveAspectRatio="none">
            {/* 
              Quadratic Bezier Curve Y(t) = 40 + 400t - 400t^2 
              t=0.10 => Y=76
              t=0.30 => Y=124
              t=0.50 => Y=140
              t=0.70 => Y=124
              t=0.90 => Y=76
            */}
            <path d="M 0 40 Q 500 240 1000 40" fill="none" stroke="#D1D5DB" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Cards container to provide context for absolute positioning */}
        <div className="absolute inset-0 w-full h-[180px] sm:h-[250px]">
          {/* Card 1 */}
          <HangingCard
            title="Web & App Development"
            desc="Enhance your online presence with top Shopify & App developers."
            img="/hero-section-img/dev-img.jpg"
            rotation={-12}
            left="10%"
            top="55px"
            smTop="76px"
            zIndex="z-10"
            delay={0.4}
          />
          {/* Card 2 */}
          <HangingCard
            title="Graphic Design"
            desc="We create designs that are simple, elegant, and visually appealing."
            img="/hero-section-img/brand-deisgn.jpg"
            rotation={-5}
            left="30%"
            top="80px"
            smTop="124px"
            zIndex="z-20"
            delay={0.5}
          />
          {/* Card 3 (Center) */}
          <HangingCard
            title="Social Media Marketing"
            desc="Instagram and YouTube marketing company strategies."
            img="/hero-section-img/marketing.jpg"
            rotation={2}
            left="50%"
            top="95px"
            smTop="140px"
            zIndex="z-30"
            delay={0.6}
          />
          {/* Card 4 */}
          <HangingCard
            title="Organic Growth (SEO)"
            desc="Best SEO company in Lucknow. technical, local, & on-page SEO"
            img="/hero-section-img/seo.jpg"
            rotation={6}
            left="70%"
            top="80px"
            smTop="124px"
            zIndex="z-20"
            delay={0.7}
          />
          {/* Card 5 */}
          <HangingCard
            title="Google Ads & Performance Marketing"
            desc="Maximize ROI with our Google Ads agency in Lucknow."
            img="/hero-section-img/ads.jpg"
            rotation={14}
            left="90%"
            top="55px"
            smTop="76px"
            zIndex="z-10"
            delay={0.8}
          />
        </div>
      </div>
    </section>
  );
};

const HangingCard = ({ title, desc, img, rotation, left, smLeft, top, smTop, zIndex, delay }: any) => {
  const [isSm, setIsSm] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsSm(window.innerWidth >= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const resolvedLeft = isSm && smLeft ? smLeft : left;
  const resolvedTop = isSm && smTop ? smTop : top;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: "-50%", rotate: 0 }}
      animate={{ opacity: 1, y: 0, x: "-50%", rotate: rotation }}
      transition={{ delay: delay, duration: 0.8, type: "spring", bounce: 0.4 }}
      className={`absolute w-[100px] sm:w-[135px] md:w-[190px] lg:w-[220px] bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 md:p-2.5 shadow-2xl border border-neutral-100 ${zIndex}`}
      style={{
        left: resolvedLeft,
        top: resolvedTop,
        originX: 0.5,
        originY: 0,
      }}
    >
      {/* Green pin */}
      <div className="absolute -top-2 sm:-top-3 md:-top-4 left-1/2 -translate-x-1/2 w-3 sm:w-4 md:w-5 h-4 sm:h-6 md:h-8 bg-[#00C853] rounded-[3px] shadow-sm flex items-center justify-center z-20">
        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full opacity-80" />
      </div>

      <div className="w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-neutral-100 mb-1 sm:mb-2 relative">
        <img src={img} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="px-0.5 sm:px-1 text-center">
        <h4 className="font-bold text-black text-[7px] sm:text-[10px] md:text-sm leading-tight mb-0.5">{title}</h4>
        <p className="text-[6px] sm:text-[9px] md:text-xs text-neutral-500 leading-tight line-clamp-2 hidden sm:block">{desc}</p>
      </div>
    </motion.div>
  );
};

export default Hero;
