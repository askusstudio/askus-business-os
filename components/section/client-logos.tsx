'use client'
import React from 'react';
import { motion } from 'framer-motion';

const ClientLogos = () => {
  const logos = [
    "Active Story (1).avif",
    // "Active Story.avif",
    "Bathkart.avif",
    "Chivri.avif",
    "Cool Cool Spray (LOGO-1).png",
    "Copy of EVENT PANDEY 2.png",
    "Crazy Rc.webp",
    "Elysian Cartpes.webp",
    "Empowered@4x.png",
    "Etbar Logo.png",
    "Evolving.avif",
    "Glam Flow (512x512)-01 (1).png",
    "Grindpound.avif",
    "Header_logo-jpg.avif",
    "IMG-20240912-WA0009.jpg",
    "IMG-20240912-WA0010.jpg",
    "IMG-20240912-WA0011.jpg",
    "IMG-20240912-WA0012.jpg",
    "IMG-20240912-WA0013.jpg",
    // "IMG_1090.PNG",
    "Inara logo.png",
    "Infinity Logo-01 (1).png",
    "Inti Faishion.webp",
    "LOGO (2).png",
    "Logo.png",
    "Logo_canva.png",
    "Logos-01.png",
    "Logos-02.png",
    "Logos-03.png",
    "Logos-04.png",
    "Logos-05.png",
    "Logos-06.png",
    "Mithang Mantra_1-02.png",
    "My fair Lady.jpg",
    "Panteazy.webp",
    "Pastel_Feminine_Flower_Wedding_Organizer_Logo_3_x_3_in__20240705_143054_0000.png",
    "Rishi Sehgal Video-02.png",
    "Rughz.avif",
    "Sharang Logo Final-01 (1).png",
    "Stay Organized, Work Smarter! (1).png",
    "TRAINFLUENCE _25 (9).png",
    "Tinycare.avif",
    "Untitled_design.webp",
    "Verline.avif",
    // "WHITE.png",
    // "Wildhorn.avif",
    "Yaahvi.avif",
    "ZEERI_2f09bc97-c7fb-46c0-b89e-5ad5ca7c9b9e.avif",
    "cmc.png",
    "logo (3).png",
    "logo-01 (1).png",
    "logo-01.png",
    "logos.png",
    "sr_logo.png",
    "tree logo1.png"
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <h2 className="text-xs sm:text-sm font-semibold text-black/60 uppercase tracking-[0.2em] mb-8 md:mb-12">
          Trusted By
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 items-center justify-items-center">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (index % 6) * 0.1, duration: 0.6, type: "spring" }}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center p-3 sm:p-4 lg:p-6"
            >
              <img
                src={`/logos/${logo}`}
                alt={`best digital marketing agency in lucknow client ${index + 1}`}
                className="max-w-full max-h-full object-contain transition-all duration-300 hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
