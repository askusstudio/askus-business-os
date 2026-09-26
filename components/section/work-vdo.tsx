'use client'
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ReelProps {
  url: string;
}

const ReelItem = React.forwardRef<HTMLDivElement, ReelProps>(({ url }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playSafe = () => {
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      playSafe();
    } else {
      video.addEventListener('loadedmetadata', playSafe, { once: true });
    }
  }, [url]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      vid.muted = false;
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleToggle}
      className="flex-shrink-0 w-[190px] sm:w-[220px] md:w-[260px] aspect-[9/16] bg-neutral-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl relative cursor-pointer border border-black/5"
      style={{ willChange: 'transform' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 z-10 pointer-events-none" />

      <video
        ref={videoRef}
        src={url}
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
});

ReelItem.displayName = 'ReelItem';

const VideoReel = () => {
  const supabaseBase = "https://xaxnevroftdfyquhocvj.supabase.co/storage/v1/object/public/videos";

  const safeList = [
    `${supabaseBase}/sv12.mp4`,
    `${supabaseBase}/CMY.MP4`,
    `${supabaseBase}/bolin.mp4`,
    `${supabaseBase}/v1.mp4`,
    `${supabaseBase}/v2.mp4`,
    `${supabaseBase}/Stanley%20Iceflow_4.mp4`,
    `${supabaseBase}/Dusk%20Hanging_1.mp4`,
    `${supabaseBase}/CR%201%20mrugg%20v5.mp4`
  ];

  const reelVideos = [...safeList, ...safeList];

  const trackRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;
    let xPos = 0;
    const speed = window.innerWidth < 640 ? 0.8 : 1.2;

    const animate = () => {
      if (trackRef.current && !isInteractingRef.current) {
        xPos -= speed;

        const firstChild = trackRef.current.children[0] as HTMLElement;
        const secondChild = trackRef.current.children[1] as HTMLElement;

        if (firstChild && secondChild) {
          const itemW = firstChild.offsetWidth;
          const gapW = secondChild.offsetLeft - (firstChild.offsetLeft + itemW);
          const totalSetWidth = (itemW + gapW) * safeList.length;

          if (Math.abs(xPos) >= totalSetWidth) {
            xPos += totalSetWidth;
          }
        }

        trackRef.current.style.transform = `translate3d(${xPos}px, 0, 0)`;

        // Smooth Center Scaling
        const centerX = window.innerWidth / 2;
        const maxDist = window.innerWidth / 2;

        itemsRef.current.forEach((item) => {
          if (!item) return;
          const rect = item.getBoundingClientRect();
          const itemCenterX = rect.left + rect.width / 2;
          const distance = Math.abs(centerX - itemCenterX);

          const normalized = Math.max(0, 1 - distance / maxDist);
          const scale = 0.88 + normalized * 0.26;
          const zIndex = Math.round(normalized * 25);

          item.style.transform = `scale(${scale})`;
          item.style.zIndex = zIndex.toString();
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [safeList.length]);

  return (
    <section className="relative pt-12 pb-24 sm:pt-16 sm:pb-32 bg-white overflow-hidden flex flex-col items-center justify-center border-t border-neutral-100 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-12 relative z-20 w-full px-4"
      >
        <span className="text-xs sm:text-sm font-semibold text-black/60 uppercase tracking-[0.2em] mb-2 block">
          Our Best Work
        </span>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight lowercase">
          video production
        </h3>
      </motion.div>

      <div
        className="relative w-full flex items-center justify-start overflow-hidden py-10"
        onMouseEnter={() => { isInteractingRef.current = true; }}
        onMouseLeave={() => { isInteractingRef.current = false; }}
        onTouchStart={() => { isInteractingRef.current = true; }}
        onTouchEnd={() => { isInteractingRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex gap-5 sm:gap-7 md:gap-9 w-max items-center pl-4"
          style={{ willChange: 'transform' }}
        >
          {reelVideos.map((url, idx) => (
            <ReelItem
              key={idx}
              url={url}
              ref={(el) => {
                itemsRef.current[idx] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoReel;