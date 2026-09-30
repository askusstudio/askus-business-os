'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Clock, Code2, X, CheckCircle2 } from 'lucide-react';
import { Nav, Footer, FloatingCallButton } from '@/components/Shared';
import { supabase } from '@/lib/supabase';

// Direct 1:1 mapping — every card title has its own unique, relevant image
const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&fit=crop&q=75`;
const IMAGE_MAP: Record<string, string> = {
  // Featured
  "Custom Softwares Development": IMG("1498050108023-c5249f4df085"),
  "Android/iOS App Development": IMG("1512941937669-90a1b58e7e9c"),
  "Website Designing": IMG("1467232004584-a241de8bcf5d"),
  "Digital Marketing": IMG("1460925895917-afdab827c52f"),
  "Maintenance & Consultancy": IMG("1504384308090-c894fdcc538d"),
  "IT Internship Program": IMG("1522202176988-66273c2fd55f"),
  // Custom Software
  "Hostel Management Software": IMG("1486312338219-ce68d2c6f44d"),
  "Online Exam Software": IMG("1434030216411-0b793f4b4173"),
  "Job Portal Software": IMG("1521737711867-e3b97375f902"),
  "HRM Software": IMG("1542744094-3a31f272c490"),
  "Payroll Generation Software": IMG("1554224155-6726b3ff858f"),
  "Inventory Management Software": IMG("1553413077-190dd305871c"),
  "E-Commerce Platform": IMG("1563013544-824ae1b704d3"),
  "CRM System": IMG("1552581234-26160f608093"),
  "Learning Management System": IMG("1501504905252-473c47e087f8"),
  "Accounts/Billing Software": IMG("1554224154-26032ffc0d07"),
  "Factory Management Software": IMG("1581091226825-a6a2a5aee158"),
  "Project Management Tool": IMG("1507925921958-8a62f3d1a50d"),
  "Healthcare Management Software": IMG("1576091160399-112ba8d25d1d"),
  "Real Estate Management Software": IMG("1560518883-ce09059eeffa"),
  "Transport Management": IMG("1519389950473-47ba0277781c"),
  "Crypto-Based Software": IMG("1518546305927-5a555bb7020d"),
  "MLM Software": IMG("1556761175-5973dc0f32e7"),
  "E-Reception Software": IMG("1497215842964-222b430dc094"),
  "Multi-Vendor Marketplace": IMG("1556742111-a301076d9d18"),
  "Student Portal": IMG("1524995997946-a1c6e315a42f"),
  "Smart Parking System": IMG("1506521781263-d8422e82f27a"),
  "News Portal Development": IMG("1585829365295-ab7cd400c167"),
  "Advocate Management System": IMG("1589829545856-d10d557cf95f"),
  "CRM Development": IMG("1551288049-bebda4e38f71"),
  "Grocery Management System": IMG("1604719312952-8a0e8c6abf85"),
  "Subscription-Based Service Development": IMG("1450101499163-c8848e968838"),
  "Mortuary Management Software": IMG("1454165804606-c3d57bc86b40"),
  "University Management": IMG("1503676260728-1c00da094a0b"),
  "E-Learning": IMG("1509062522246-3755977927d7"),
  "Laboratory": IMG("1532094349884-543bc11b234d"),
  "Blood Bank": IMG("1615461066841-6116e61058f4"),
  "Digital Hospital": IMG("1538108149393-fbbd81895907"),
  "Pharmacy": IMG("1471864190281-a93a3070b6de"),
  // App Development
  "Native Android/iOS App Development": IMG("1526045612212-70caf35c14df"),
  "Cross-Platform App Development": IMG("1585399000684-d2f72660f092"),
  "Enterprise Mobile Solutions": IMG("1497366216548-37526070297c"),
  "App UI/UX Design": IMG("1561070791-2526d30994b5"),
  "App Maintenance & Support": IMG("1531482615713-2afd69097998"),
  "AR/VR App Development": IMG("1592478411213-6153e4ebc07d"),
  "E-Commerce App Development": IMG("1556742049-0cfed4f6a45d"),
  "App Performance Optimization": IMG("1558494949-ef010cbdcc31"),
  "Mobile Commerce Development": IMG("1556742044-3c52d6e88c62"),
  // Web Design
  "Custom Website Design": IMG("1547658719-da2b51169166"),
  "E-commerce Website Design": IMG("1472851294608-062f824d29cc"),
  "Corporate Website Design": IMG("1486406146926-c627a92ad1ab"),
  "Landing Page Design": IMG("1507238691740-187a5b1d37b8"),
  "Blog/Content Website Design": IMG("1499750310107-5fef28a66643"),
  "SaaS Website Design": IMG("1460925895917-afdab827c52f"),
  "Web Application Design": IMG("1555066931-4365d14bab8c"),
  "Non-profit Website Design": IMG("1469571486292-0ba58a3f068b"),
  "Multi-Vendor Marketplace Design": IMG("1441986300917-64674bd600d8"),
  "Personal Branding Website Design": IMG("1557426272-fc759fdf7a8d"),
  "Educational Platform Design": IMG("1427504494785-3a9ca7044f45"),
  "Travel Agency Website Design": IMG("1488646953014-85cb44e25828"),
  "Fitness & Wellness Website Design": IMG("1534438327276-14e5300c3a48"),
  "Food & Restaurant Website Design": IMG("1517248135467-4c7edcad34c4"),
  "Portfolio Website Design": IMG("1545239351-ef35f43d514b"),
  // Marketing
  "Search Engine Optimization (SEO)": IMG("1432888498266-38ffec3eaf0a"),
  "Pay-Per-Click Advertising (PPC)": IMG("1533750349088-cd871a92f312"),
  "Social Media Marketing": IMG("1611162617213-7d7a39e9b1d7"),
  "Content Marketing": IMG("1455390582262-044cdead277a"),
  "Influencer Marketing": IMG("1557804506-669a67965ba0"),
  "Email Marketing": IMG("1596526131083-e8c633c948d2"),
  "Video Marketing": IMG("1492619375914-88005aa9e8fb"),
  "Affiliate Marketing": IMG("1553877522-43269d4ea984"),
  "Local SEO": IMG("1495364141860-b0d03eccd065"),
  "Web Analytics": IMG("1551288049-bebda4e38f71"),
  "Google Listing": IMG("1573804633927-bfcbcd909acd"),
  "Google Promotion": IMG("1573804633927-bfcbcd909acd"),
  // Internships
  "Software Development Internship": IMG("1461749280684-dccba630e2f6"),
  "Digital Marketing Internship": IMG("1557838923-2985c318be48"),
  "UI/UX Design Internship": IMG("1586717791821-3f44ec241c57"),
  "Data Science Internship": IMG("1504868584819-f8e8b4b6d7e3"),
  "Cloud Computing Internship": IMG("1451187580459-43490279c0fa"),
  "Cybersecurity Internship": IMG("1550751827-4bd374c3f58b"),
  // Training
  ".NET Development": IMG("1488590528505-98d2b5aba04b"),
  "Angular Framework": IMG("1517694712202-14dd9538aa97"),
  "React.js Development": IMG("1633356122544-f134324a6cee"),
  "PHP, HTML & Laravel": IMG("1526374965328-7f61d4dc18c5"),
  "Node.js": IMG("1555066931-bf19f8fd1085"),
  "C++ and Java": IMG("1515879218367-8c267915738b"),
};
const getImageForTitle = (title: string) => IMAGE_MAP[title] || IMG("1451187580459-43490279c0fa");

// 6 Featured Cards at the top
const featuredCards = [
  { title: "Custom Softwares Development", label: "best software company in India", tag: "technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "21 Days" },
  { title: "Android/iOS App Development", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "24 Days" },
  { title: "Website Designing", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "16 Days" },
  { title: "Digital Marketing", label: "digital marketing company in India", tag: "technology", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "12 Days" },
  { title: "Maintenance & Consultancy", label: "best it company in India", tag: "technology", techs: "Jira, ServiceNow, Git, Docker, Kubernetes", time: "13 Days" },
  { title: "IT Internship Program", label: "best it company in India", tag: "technology", techs: "Laravel, Node.js, PHP, Java Script, React J.S, Tailwind CSS", time: "35 Days" },
];

const categories = [
  {
    id: "custom-software",
    title: "Custom Software Development",
    description: "Tailored industry-specific standards, solutions, and integration services through a unique delivery model.",
    items: [
      { title: "Hostel Management Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "18-24 Days" },
      { title: "Online Exam Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "16-20 Days" },
      { title: "Job Portal Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "20-24 Days" },
      { title: "HRM Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "18-22 Days" },
      { title: "Payroll Generation Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "16-20 Days" },
      { title: "Inventory Management Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "20-24 Days" },
      { title: "E-Commerce Platform", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, JavaScript, Tailwind CSS, React.js", time: "22-28 Days" },
      { title: "CRM System", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, JavaScript, Tailwind CSS, React.js", time: "18-22 Days" },
      { title: "Learning Management System", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, JavaScript, Tailwind CSS, React.js", time: "24-30 Days" },
      { title: "Accounts/Billing Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "18-24 Days" },
      { title: "Factory Management Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "28-32 Days" },
      { title: "Project Management Tool", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, JavaScript, Tailwind CSS, React.js", time: "24-30 Days" },
      { title: "Healthcare Management Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "24-30 Days" },
      { title: "Real Estate Management Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "26-32 Days" },
      { title: "Transport Management", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, JavaScript, Tailwind CSS, React.js", time: "10-12 days" },
      { title: "Crypto-Based Software", label: "best software company in India", tag: "Technology", techs: "Solidity, Rust, C++, Python, TypeScript, Go", time: "12-16 Days" },
      { title: "MLM Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "8-10 Days" },
      { title: "E-Reception Software", label: "best software company in India", tag: "Technology", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "6-8 Days" },
      { title: "Multi-Vendor Marketplace", label: "best software company in India", tag: "system", techs: "Laravel, Node.js, PHP, JavaScript, Tailwind CSS, React.js", time: "6-9 months" },
      { title: "Smart Parking System", label: "best software company in India", tag: "system", techs: "Python, Java, JavaScript, C/C++, React.js", time: "6-8 Days" },
      { title: "News Portal Development", label: "best software company in India", tag: "platform", techs: "Python, Java, JavaScript, C/C++, React.js", time: "3-6 Days" },
      { title: "Advocate Management System", label: "best software company in India", tag: "solution", techs: "Python, Java, JavaScript, C/C++, React.js", time: "4-6 Days" },
      { title: "CRM Development", label: "best software company in India", tag: "platform", techs: "Python, Java, JavaScript, C/C++, React.js", time: "6-9 Days" },
      { title: "Mortuary Management Software", label: "best software company in India", tag: "technology", techs: "Python, Java, JavaScript, C/C++, React.js", time: "4-6 days" },
      { title: "University Management", label: "best software company in India", tag: "FEATURES", techs: "Python, Java, JavaScript, C/C++, React.js", time: "12-16 Days" },
      { title: "E-Learning", label: "best software company in India", tag: "FEATURES", techs: "Python, Java, JavaScript, C/C++, React.js", time: "10-14 days" },
      { title: "Laboratory", label: "best software company in India", tag: "technology", techs: "Python, Java, JavaScript, C/C++, React.js", time: "12-16 days" },
      { title: "Blood Bank", label: "best software company in India", tag: "technology", techs: "Python, Java, JavaScript, C/C++, React.js", time: "18-22 Days" },
      { title: "Digital Hospital", label: "best software company in India", tag: "technology", techs: "Python, Java, JavaScript, C/C++, React.js", time: "20-24 Days" },
      { title: "Pharmacy", label: "best software company in India", tag: "technology", techs: "Python, Java, JavaScript, C/C++, React.js", time: "10-14 days" },
    ]
  },
  {
    id: "app-development",
    title: "Android/iOS App Development",
    description: "From native iOS/Android to fluid cross-platform apps, we craft scalable mobile architectures.",
    items: [
      { title: "Native Android/iOS App Development", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "24 Days" },
      { title: "Cross-Platform App Development", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "18 Days" },
      { title: "Enterprise Mobile Solutions", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "28 Days" },
      { title: "App UI/UX Design", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "12 Days" },
      { title: "App Maintenance & Support", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "Ongoing" },
      { title: "AR/VR App Development", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "36 Days" },
      { title: "E-Commerce App Development", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "20 Days" },
      { title: "App Performance Optimization", label: "app development company in India", tag: "technology", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "8 Days" },
      { title: "Mobile Commerce Development", label: "app development company in India", tag: "platform", techs: "Java, Kotlin, Swift, React Native, Dart (Flutter)", time: "25-27 Days" },
    ]
  },
  {
    id: "web-design",
    title: "Website Designing & Development",
    description: "Responsive, immersive, and high-performance websites optimized for search and conversion.",
    items: [
      { title: "Custom Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "16-18 week" },
      { title: "E-commerce Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "28-29 Days" },
      { title: "Corporate Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "20-24 Days" },
      { title: "Landing Page Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "23-25 Days" },
      { title: "Blog/Content Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "14-26 week" },
      { title: "SaaS Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "18-20 week" },
      { title: "Web Application Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "22-26 Days" },
      { title: "Non-profit Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "25-27 Days" },
      { title: "Multi-Vendor Marketplace Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "26-30 Days" },
      { title: "Personal Branding Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "23-25 Days" },
      { title: "Educational Platform Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "22-28 Days" },
      { title: "Travel Agency Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "24-28 weeks" },
      { title: "Fitness & Wellness Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "26-30 Days" },
      { title: "Food & Restaurant Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "24-28 Days" },
      { title: "Portfolio Website Design", label: "website development company in India", tag: "technology", techs: "HTML, CSS, JavaScript, Tailwind CSS, Bootstrap, React.js", time: "23-25 weeks" },
    ]
  },
  {
    id: "marketing",
    title: "Digital Marketing by AskUs Studio",
    description: "Data-backed SEO, Google/Meta PPC campaigns, and conversion optimization.",
    items: [
      { title: "Search Engine Optimization (SEO)", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "23-26 Days" },
      { title: "Pay-Per-Click Advertising (PPC)", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "22-24 Days" },
      { title: "Social Media Marketing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
      { title: "Content Marketing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
      { title: "Influencer Marketing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "24-28 Days" },
      { title: "Email Marketing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
      { title: "Video Marketing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "24-28 Days" },
      { title: "Affiliate Marketing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
      { title: "Local SEO", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "23-26 Days" },
      { title: "Web Analytics", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
      { title: "Google Listing", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
      { title: "Google Promotion", label: "digital marketing company in India", tag: "strategy", techs: "Google Ads, Facebook Ads, SEO, Analytics, HubSpot", time: "Ongoing" },
    ]
  },
  {
    id: "internships",
    title: "IT Internship Program",
    description: "Hands-on engineering internships on production applications under senior developers.",
    items: [
      { title: "Software Development Internship", label: "best it company in India", tag: "Skills Acquired", techs: "Laravel, Node.js, PHP, Python, C#, Java", time: "6 months" },
      { title: "Data Science Internship", label: "best it company in India", tag: "Skills Acquired", techs: "Python, SQL, Java, Scala, Julia, MATLAB, SAS", time: "7 months" },
      { title: "Cloud Computing Internship", label: "best it company in India", tag: "Skills Acquired", techs: "Python, Java, Node.js, C#, Go, Ruby", time: "6 months" },
      { title: "Cybersecurity Internship", label: "best it company in India", tag: "Skills Acquired", techs: "Python, C/C++, JavaScript, Java, Bash, SQL, PHP", time: "6 months" },
    ]
  },
  {
    id: "training",
    title: "Master IT Skills",
    description: "Industry-aligned hands-on training programs taught by experienced software practitioners.",
    items: [
      { title: ".NET Development", desc: "Build enterprise applications using .NET and C#.", tag: "Course", techs: "C#, ASP.NET, MVC", time: "Flexible" },
      { title: "Angular Framework", desc: "Develop dynamic web applications with Angular.", tag: "Course", techs: "TypeScript, Angular CLI, RxJS", time: "Flexible" },
      { title: "React.js Development", desc: "Fast front-end architectures with modern React.", tag: "Course", techs: "JSX, React, Redux, Next.js", time: "Flexible" },
      { title: "PHP, HTML & Laravel", desc: "Build robust full-stack web applications.", tag: "Course", techs: "PHP, HTML, Laravel", time: "Flexible" },
      { title: "Node.js", desc: "Create high-performance server-side APIs.", tag: "Course", techs: "Node.js, Express, APIs", time: "Flexible" },
      { title: "C++ and Java", desc: "Master core algorithms and object-oriented systems.", tag: "Course", techs: "C++, Java", time: "Flexible" },
    ]
  }
];

// Inquiry Modal (Redirects & logs to WhatsApp & Supabase)
const InquiryModal = ({ isOpen, onClose, productTitle }: { isOpen: boolean, onClose: () => void, productTitle: string }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: productTitle, message: '' });

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, subject: productTitle }));
  }, [productTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Log to Supabase
      await supabase.from('inquiries').insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject || productTitle,
          message: form.message,
        },
      ]);

      // 2. Direct WhatsApp redirection
      const whatsappNumber = '918009227002';
      const textMsg = `*New Product Inquiry - AskUs Studio*%0A%0A` +
        `*Product:* ${encodeURIComponent(productTitle)}%0A` +
        `*Name:* ${encodeURIComponent(form.name)}%0A` +
        `*Phone:* ${encodeURIComponent(form.phone)}%0A` +
        `*Email:* ${encodeURIComponent(form.email)}%0A` +
        `*Requirements:* ${encodeURIComponent(form.message || 'N/A')}`;

      window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${textMsg}`, '_blank');

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: '', email: '', phone: '', subject: productTitle, message: '' });
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-[#C8FF91] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Inquiry Forwarded!</h3>
                <p className="text-neutral-400 text-xs">Connecting to WhatsApp with details for <span className="text-[#C8FF91]">{productTitle}</span></p>
              </motion.div>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-[#C8FF91] text-[10px] font-bold tracking-widest uppercase mb-1">Inquiry</p>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">{productTitle}</h3>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C8FF91]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C8FF91]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91-XXXXX-XXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C8FF91]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">Requirements</label>
                    <textarea
                      rows={2}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Brief details about your timeline or budget..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C8FF91] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#C8FF91] text-black font-bold text-xs tracking-wider uppercase hover:bg-[#b5f278] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Send Inquiry to WhatsApp →'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compact, Sleek & Mobile-Friendly Visual Card
const PremiumCard = ({ item, index, onCardClick }: { item: any, index: number, onCardClick?: (title: string) => void }) => {
  const imageUrl = getImageForTitle(item.title);
  const hue = (index * 37) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300 hover:border-white/[0.25] flex flex-col h-full cursor-pointer shadow-sm hover:shadow-xl"
      onClick={() => onCardClick?.(item.title)}
    >
      {/* Compact Image Container: Reduced height */}
      <div className="aspect-[16/9] sm:aspect-[16/10] w-full overflow-hidden relative">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, hsl(${hue},60%,15%) 0%, hsl(${hue + 40},40%,8%) 100%)` }}
        >
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-65 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        </div>

        {item.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-bold tracking-wider uppercase text-white/80 group-hover:text-white">
              {item.tag} ↗
            </span>
          </div>
        )}

        {/* Small, subtle corner arrow */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center bg-black/60 backdrop-blur-xs group-hover:bg-[#C8FF91] group-hover:text-black transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:text-black transition-colors" />
        </div>
      </div>

      {/* Compact Card Content */}
      <div className="p-4 sm:p-4.5 relative z-10 flex flex-col flex-grow">
        {item.label && (
          <p className="text-[#C8FF91] text-[9px] font-semibold tracking-wider uppercase mb-1.5 truncate">
            {item.label}
          </p>
        )}

        <h3 className="text-sm sm:text-base font-bold text-white mb-2 tracking-tight group-hover:text-[#C8FF91] transition-colors line-clamp-1 leading-snug">
          {item.title}
        </h3>

        {item.desc && (
          <p className="text-neutral-400 text-xs leading-relaxed mb-3 line-clamp-2">
            {item.desc}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-white/5 space-y-2">
          {item.techs && (
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <p className="text-[11px] text-neutral-300 font-medium truncate">{item.techs}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="text-[11px] text-neutral-400 font-medium">{item.time}</span>
            </div>
            <span className="text-[10px] text-[#C8FF91] font-bold group-hover:underline">
              Inquire →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function OurProductPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');

  const handleCardClick = (title: string) => {
    setSelectedProduct(title);
    setModalOpen(true);
  };

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen selection:bg-[#C8FF91] selection:text-black font-sans">
      <Nav />
      <InquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} productTitle={selectedProduct} />

      <main className="pt-24 sm:pt-32 md:pt-40 pb-24">
        {/* Compact Hero */}
        <section className="px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto mb-14 sm:mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-[#C8FF91]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#C8FF91]" />
              <span className="text-[#C8FF91] font-bold uppercase tracking-[0.2em] text-[11px]">Our Products</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-4">
              Digital <span className="text-neutral-500">Excellence.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
              Explore AskUs Studio&apos;s modular web platforms, custom SaaS software, mobile applications, and enterprise automations.
            </p>
          </motion.div>
        </section>

        {/* Featured Solutions Section */}
        <section className="pb-16 sm:pb-24 relative">
          <div className="px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Featured Solutions</h2>
            </div>

            {/* Responsive Compact Grid: 1 col on mobile, 2 on sm, 3 on lg, 4 on xl */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {featuredCards.map((item, idx) => (
                <PremiumCard key={idx} item={item} index={idx} onCardClick={handleCardClick} />
              ))}
            </div>
          </div>
        </section>

        {/* Categorized Product Grids */}
        {categories.map((category) => (
          <section key={category.id} className="pt-12 sm:pt-16 pb-16 sm:pb-20 border-t border-white/[0.06] relative">
            <div className="px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">
              <div className="max-w-3xl mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2">{category.title}</h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* 4-Column Compact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {category.items.map((item, idx) => (
                  <PremiumCard key={idx} item={item} index={idx} onCardClick={handleCardClick} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <Footer />
      <FloatingCallButton />
    </div>
  );
}