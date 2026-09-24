import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Video Reel Section ---
const VideoReel = () => {
    // High-performance direct CDN video streams (No 404s, instant load)
    const videos = [
        "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-40137-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-recording-a-podcast-in-a-studio-43407-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-typing-on-a-computer-laptop-42999-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-pictures-of-a-model-41002-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-glass-of-wine-and-looking-at-camera-40166-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-colored-lights-42938-large.mp4"
    ];

    const reelVideos = [...videos, ...videos, ...videos];

    const trackRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

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
                            className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[280px] lg:w-[320px] aspect-[2/3] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl transition-transform duration-75 ease-out relative group"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 z-10 pointer-events-none" />
                            <video
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