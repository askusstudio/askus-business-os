'use client'
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SingleReelCard = ({ videoUrl }: { videoUrl: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [indicator, setIndicator] = useState<'play' | 'pause' | null>(null);

  // Performance Fix: Sirf tabhi play hoga jab screen ke viewport me aaye
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      videoRef.current.muted = false; // tap karne par audio
      setIsPlaying(true);
      setIndicator('play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setIndicator('pause');
    }

    setTimeout(() => {
      setIndicator(null);
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCardClick}
      className="flex-shrink-0 w-[190px] sm:w-[220px] md:w-[260px] aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative group cursor-pointer border border-black/5"
      style={{ willChange: 'transform' }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        preload="metadata" // POORI VIDEO LOAD NAHI KAREGA, CRASH ROOK DEGA
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Quick feedback indicator on tap */}
      <AnimatePresence>
        {indicator && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center font-bold text-lg border border-white/20 shadow-2xl">
              {indicator === 'play' ? '▶' : '❚❚'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VideoReel = () => {
  const supabaseBase = "https://xaxnevroftdfyquhocvj.supabase.co/storage/v1/object/public/videos";

  const videoFiles = [
    "AskUs_Work Portfolio (9).mp4",
    "bolin.mp4",
    "CMY.MP4",
    "CR 1 mrugg v5.mp4",
    "Dusk Hanging_1.mp4",
    "mrugg v2(2).mp4",
    "Stanley Iceflow_4.mp4",
    "sv12.mp4",
    "v1.mp4",
    "v2.mp4"
  ];

  const videos = videoFiles.map(file => `${supabaseBase}/${encodeURIComponent(file)}`);

  const trackRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;
    let xPos = 0;
    // Marquee scrolling speed smooth & low CPU
    const speed = 0.7;

    const animate = () => {
      if (trackRef.current && !isHoveredRef.current) {
        xPos -= speed;

        const firstChild = trackRef.current.children[0] as HTMLElement;
        const secondChild = trackRef.current.children[1] as HTMLElement;

        if (firstChild && secondChild) {
          const itemW = firstChild.offsetWidth;
          const gapW = secondChild.offsetLeft - (firstChild.offsetLeft + itemW);
          const totalSetWidth = (itemW + gapW) * videos.length;

          if (Math.abs(xPos) >= totalSetWidth) {
            xPos = 0;
          }
        }

        trackRef.current.style.transform = `translate3d(${xPos}px, 0, 0)`; // GPU Acceleration
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [videos.length]);

  return (
    <section className="relative py-16 sm:py-20 bg-white overflow-hidden flex flex-col items-center justify-center border-t border-slate-100 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-12 relative z-10 w-full px-4 space-y-2"
      >
        <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
          OUR BEST WORK
        </span>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Video Production & Reels
        </h3>
      </motion.div>

      <div
        className="relative w-full flex items-center justify-start overflow-hidden py-2"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
        onTouchStart={() => { isHoveredRef.current = true; }}
        onTouchEnd={() => { isHoveredRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-6 w-max items-center pl-4"
          style={{ willChange: 'transform' }}
        >
          {/* Doubled once for loop, not tripled */}
          {[...videos, ...videos].map((videoUrl, idx) => (
            <SingleReelCard key={idx} videoUrl={videoUrl} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoReel;