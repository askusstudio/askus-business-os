'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, MoveRight } from 'lucide-react';

const ProjectCard = ({ title, category, image, index, link }: { title: string; category: string; image: string; index: number; link: string }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: (index % 4) * 0.1, type: "spring" }}
        className="group relative cursor-pointer"
      >
        <div className="aspect-[16/9] overflow-hidden bg-neutral-900 rounded-sm">
          <motion.img
            src={image}
            alt={`${title} - website development company lucknow`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500">
              <ArrowUpRight className="text-black" />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-black mb-1">{title}</h3>
            <p className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold">{category}</p>
          </div>
          <span className="text-black/20 font-mono">0{index + 1}</span>
        </div>
      </motion.div>
    </a>
  );
};

const Work = () => {
  const [showAll, setShowAll] = useState(false);

  const projects = [
    { title: "bolinworld", category: "Web Design / 3D", image: "portfolio-img-4.png", link: "https://bolinworld.co.in/" },
    { title: "mithangmantra", category: "Branding / Motion", image: "portfolio-img-3.png", link: "https://mithangmantra.com/" },
    { title: "rishisehgal", category: "Photography", image: "portfolio-img-1.png", link: "https://rishisehgal.in/" },
    { title: "dreamcountryvisas", category: "UI/UX Architecture", image: "portfolio-img-2.jpg", link: "https://dreamcountryvisas.com/" },
    { title: "Tulip Eyewear", category: "E-commerce / Fashion", image: "pi5.png", link: "https://tulip-eyewear.vercel.app/" },
    { title: "Kitchen Sweets", category: "Food & Bakery", image: "pi6.png", link: "https://kitchen-sweets.vercel.app/" },
    { title: "Shunyity Tech Solutions", category: "Technology / Corporate", image: "pi7.png", link: "https://www.shunyitytechsolutions.com/" },
    { title: "Accuved by Rekha", category: "Healthcare / Wellness", image: "pi8.png", link: "https://accuvedbyrekha.com/" },
    { title: "Briocred Pharmaceuticals", category: "Pharma / Healthcare", image: "pi9.png", link: "https://briocredpharmaceuticals.com/" },
    { title: "Iqra Chikankari", category: "Fashion / E-commerce", image: "pi10.png", link: "https://iqrachikankari.com/" },
    { title: "Dr. Sachin Choudhary", category: "Medical / Professional", image: "pi11.png", link: "https://drsachinchoudhary.com/" },
    { title: "Safed Rang", category: "Fashion / Lifestyle", image: "pi12.png", link: "https://safedrang.com/" },
    { title: "Your Gaming Zone", category: "Gaming / E-commerce", image: "pi13.png", link: "https://yourgamingzone.in/" },
    { title: "Skyscraper Builder", category: "Real Estate / Construction", image: "pi14.png", link: "https://skyscraperbuilderdeveloper.com/" },
    { title: "Union Traders India", category: "Business / Trading", image: "pi15.png", link: "https://uniontradersindia.com/" },
  ];

  const displayedProjects = showAll ? projects : projects.slice(0, 6);

  return (
    <section id="work" className="py-16 sm:py-24 md:py-32 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-4 md:gap-8"
        >
          <div className="max-w-xl">
            <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-[0.4em] mb-6">Selected Works</h2>
            <p className="text-2xl sm:text-4xl md:text-6xl font-black text-black leading-none tracking-tighter">
              CRAFTING THE <br />NEXT STANDARD.
            </p>
          </div>
          <div className="text-black/60 text-sm font-medium">
            Showing {displayedProjects.length} of {projects.length} projects
          </div>
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-16 lg:gap-y-24"
        >
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((p, i) => (
              <motion.div
                key={p.link}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ProjectCard {...p} index={i} link={p.link} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Show More / Show Less Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-4 px-8 py-4 rounded-full border border-black/20 bg-black/5 backdrop-blur-sm hover:bg-black hover:border-black transition-all duration-300"
          >
            <span className="font-bold tracking-widest uppercase text-sm text-black group-hover:text-white transition-colors">
              {showAll ? 'Show Less' : `Show More (${projects.length - 6} more)`}
            </span>
            <motion.div
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-full border border-black/20 group-hover:border-white/20 flex items-center justify-center group-hover:bg-white transition-all"
            >
              <MoveRight size={16} className="text-black group-hover:text-white rotate-90" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Work;
