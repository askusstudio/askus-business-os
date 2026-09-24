'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Palette, Code, Smartphone, ShoppingCart, BarChart3, ArrowUpRight } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Monitor,
      title: "Website Development Company in Lucknow",
      desc: "Our comprehensive website development services ensure your site is visually appealing, functional, and optimized for all devices. Enhance your online presence with top WordPress, Shopify, and eCommerce developers.",
    },
    {
      icon: Palette,
      title: "SEO Services in Lucknow",
      desc: "We are the best SEO company in Lucknow. Increase website traffic and generate quality leads through technical, local, and on-page SEO services driven by our SEO expert in Lucknow.",
    },
    {
      icon: Code,
      title: "AI Automation Services for Businesses",
      desc: "Dominate the market with our AI automation agency. We provide WhatsApp automation services, chatbot development, CRM automation, and AI lead generation systems to supercharge your sales.",
    },
    {
      icon: Smartphone,
      title: "Google Ads & Performance Marketing",
      desc: "Maximize ROI with our Google Ads agency in Lucknow. We are a results-oriented digital marketing agency delivering highly targeted PPC services and Meta/Facebook Ads to grow your business online.",
    },
    {
      icon: ShoppingCart,
      title: "Social Media Marketing Agency in Lucknow",
      desc: "Transform your brand with expert Instagram and YouTube marketing company strategies. Engage customers and build brand loyalty through creative content marketing services.",
    },
    {
      icon: BarChart3,
      title: "Lead Generation Company in Lucknow",
      desc: "Drive growth with our data-driven digital marketing strategies. From generating quality leads to conversion optimization, we help you reach your target audience and achieve your business goals.",
    },
  ];

  return (
    <section className="relative bg-white">
      {/* Top Section - White Background */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-sm font-semibold text-black/60 uppercase tracking-[0.2em] mb-6">
            What We Do
          </h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight max-w-5xl mx-auto">
            Explore Our Full Range of Expert Digital{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Services</span>
              <span className="absolute bottom-2 left-0 right-0 h-4 bg-lime-400/60 -z-0" />
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Services Cards Section - Light Background */}
      <div className="py-16 md:py-24">
        <div className="max-w-screen-2xl mx-auto px-[3px] sm:px-[3px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 hover:bg-[#C2FF83] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-black stroke-2" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 sm:mb-4 group-hover:text-black">
                        {service.title}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl text-black/70 group-hover:text-black/90 leading-relaxed md:w-2/3">
                        {service.desc}
                      </p>
                    </div>

                    {/* Arrow Button */}
                    <div className="flex-shrink-0 mt-4 md:mt-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-black group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
