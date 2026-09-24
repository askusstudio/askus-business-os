'use client'
import React from 'react';
import { motion } from 'framer-motion';

const FAQ = () => {
  const faqs = [
    {
      q: "Which is the best digital marketing agency in Lucknow?",
      a: "Askus Studio is widely recognized as the top digital marketing company in Lucknow, combining AI automation, high-end website development, and ROI-driven SEO services to scale your business online."
    },
    {
      q: "How much does SEO cost in Lucknow?",
      a: "We offer affordable SEO services tailored to your needs. The cost depends on whether you need local SEO services, technical SEO, or off-page link building. Contact us for a custom quote."
    },
    {
      q: "Why hire a digital marketing company?",
      a: "To increase leads through SEO, maximize Google first page rankings, and leverage AI lead generation. A professional agency brings systems thinking and performance marketing expertise."
    },
    {
      q: "How long does SEO take?",
      a: "Typically, local SEO services in Lucknow take 3 to 6 months to start seeing significant increases in website traffic and lead generation, depending on keyword competitiveness."
    },
    {
      q: "What is local SEO?",
      a: "Local SEO helps businesses rank in their specific geographic area. For example, optimizing for 'SEO company Gomti Nagar' or 'digital marketing services Hazratganj' to attract nearby customers."
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white border-t border-neutral-200 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-8 md:mb-12 text-center"
        >
          Frequently Asked Questions
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.6, type: "spring" }}
              className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-black mb-4">{faq.q}</h3>
              <p className="text-neutral-600">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
