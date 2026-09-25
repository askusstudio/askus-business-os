import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Video Reel Section ---
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
    const reelVideos = [...videos, ...videos, ...videos];

    const trackRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    // 1. Force muted & play programmatic fix for browser autoplay restrictions
    const handleVideoMount = (el: HTMLVideoElement | null) => {
        if (!el) return;
        el.muted = true;
        el.defaultMuted = true;
        el.playsInline = true;
        
        const playPromise = el.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Auto-retry play on first user interaction
                const retryPlay = () => {
                    el.play();
                    window.removeEventListener('click', retryPlay);
                    window.removeEventListener('touchstart', retryPlay);
                };
                window.addEventListener('click', retryPlay);
                window.addEventListener('touchstart', retryPlay);
            });
        }
    };

    useEffect(() => {
        let animationFrameId: number;
        let xPos = 0;
        const speed = window.innerWidth < 640 ? 1.0 : window.innerWidth < 1024 ? 1.6 : 2.2;

        const animate = () => {
            if (!trackRef.current) return;

            xPos -= speed;

            const firstChild = trackRef.current.children[0] as HTMLElement;
            const secondChild = trackRef.current.children[1] as HTMLElement;
            if (firstChild && secondChild) {
                const itemW = firstChild.offsetWidth;
                const gapW = secondChild.offsetLeft - (firstChild.offsetLeft + itemW);
                const totalSetWidth = (itemW + gapW) * videos.length;

                if (Math.abs(xPos) >= totalSetWidth) {
                    xPos += totalSetWidth;
                }
            }

            trackRef.current.style.transform = `translateX(${xPos}px)`;

            const centerX = window.innerWidth / 2;

            itemsRef.current.forEach((item) => {
                if (!item) return;
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - itemCenterX);

                const maxDist = window.innerWidth / 2;
                const normalized = Math.max(0, 1 - distance / maxDist);

                const scale = 0.85 + normalized * 0.25;
                const opacity = 0.4 + normalized * 0.6;
                const zIndex = Math.round(normalized * 10);

                item.style.transform = `scale(${scale})`;
                item.style.opacity = opacity.toString();
                item.style.zIndex = zIndex.toString();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [videos.length]);

    return (
        <section className="relative py-12 sm:py-16 md:py-20 bg-white overflow-hidden h-[450px] sm:h-[500px] md:h-[700px] flex flex-col items-center justify-center border-t border-neutral-200">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-6 sm:mb-8 md:mb-12 relative z-10 w-full px-4"
            >
                <h2 className="text-sm font-semibold text-black/60 uppercase tracking-[0.2em] mb-4">
                    Our Best Work
                </h2>
                <h3 className="text-xl sm:text-2xl md:text-5xl font-bold text-black">
                    video production
                </h3>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full flex items-center justify-center"
            >
                <div
                    className="flex gap-4 md:gap-8 w-max items-center"
                    ref={trackRef}
                    style={{ willChange: 'transform' }}
                >
                    {reelVideos.map((videoUrl, idx) => (
                        <div
                            key={idx}
                            ref={(el) => {
                                itemsRef.current[idx] = el;
                            }}
                            className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[280px] lg:w-[320px] aspect-[2/3] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl transition-transform duration-75 ease-out relative group cursor-pointer"
                            style={{ willChange: 'transform, opacity' }}
                            onClick={(e) => {
                                const video = e.currentTarget.querySelector('video');
                                if (video) {
                                    video.paused ? video.play() : video.pause();
                                }
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 z-10 pointer-events-none" />
                            <video
                                ref={handleVideoMount}
                                src={videoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default VideoReel;