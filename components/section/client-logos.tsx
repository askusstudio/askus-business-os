'use client'
import React from 'react';

const ClientLogos = () => {
  // Direct live websites mapping (100% same data)
  const BRAND_LINKS: Record<string, string> = {
    'Active Story (1).avif': 'https://theactivestory.com',
    'Bathkart.avif': 'https://bathkart.in',
    'Chivri.avif': 'https://chivri.com',
    'Cool Cool Spray (LOGO-1).png': 'https://coolcool.in',
    'Crazy Rc.webp': 'https://withuss.com',
    'Elysian Cartpes.webp': 'https://elysiancarpets.com',
    'Empowered@4x.png': 'https://articulate-learning.com',
    'Etbar Logo.png': 'https://pavitramm.com',
    'Evolving.avif': 'https://withuss.com',
    'Glam Flow (512x512)-01 (1).png': 'https://elko.in',
    'Grindpound.avif': 'https://wheelwash.co.in',
    'Inara logo.png': 'https://elkohealthcare.com',
    'Infinity Logo-01 (1).png': 'https://marsev.in',
    'Inti Faishion.webp': 'https://buttercrumb.in',
    'Mithang Mantra_1-02.png': 'https://chivri.com',
    'My fair Lady.jpg': 'https://withuss.com',
    'Panteazy.webp': 'https://withuss.com',
    'Pastel_Feminine_Flower_Wedding_Organizer_Logo_3_x_3_in__20240705_143054_0000.png': 'https://shuddhaspace.com',
    'Rishi Sehgal Video-02.png': 'https://digimilestone.com',
    'Rughz.avif': 'https://kovalentcoatings.com',
    'Tinycare.avif': 'https://elkohealthcare.com',
    'Verline.avif': 'https://askindia.info',
    'Yaahvi.avif': 'https://theactivestory.com',
    'ZEERI_2f09bc97-c7fb-46c0-b89e-5ad5ca7c9b9e.avif': 'https://askindia.info',
    'sr_logo.png': 'https://vaimsadvisors.com',
    'tree logo1.png': 'https://garimahardware.in',
    'Header_logo-jpg.avif': 'https://techwix.in',
    'cmc.png': 'https://socionimpact.com',
    'Stay Organized, Work Smarter! (1).png': 'https://kaaunitedsolutions.com',
    'TRAINFLUENCE _25 (9).png': 'https://drsabiamangat.in',
    'Sharang Logo Final-01 (1).png': 'https://thisabilitycare.com.au',
  };

  const logos = [
    "Active Story (1).avif",
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

  const handleLogoTap = (logo: string) => {
    const url = BRAND_LINKS[logo];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.reload();
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#fafafa] border-y border-slate-100 font-sans selection:bg-[#bbf770] selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Modern Heading */}
        <div className="space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bbf770]/40 border border-[#bbf770] text-emerald-950 text-[11px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            PROOF OF WORK
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            TRUSTED BY <span className="underline decoration-[#bbf770] decoration-wavy decoration-2">50+ BRANDS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
            From emerging D2C powerhouses to established global enterprises.
          </p>
        </div>

        {/* Lightweight & Super Smooth Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 items-center justify-items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              onClick={() => handleLogoTap(logo)}
              className="w-full h-24 sm:h-28 flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 group cursor-pointer select-none"
            >
              <img
                src={`/logos/${logo}`}
                alt="Client brand"
                loading="lazy"
                decoding="async"
                className="max-w-[110px] max-h-12 object-contain transition-transform duration-200 group-hover:scale-105 pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;