import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Linkedin, Facebook } from 'lucide-react';
import api from '../../utils/api';

const DEFAULT_SETTINGS = {
  showroomAddress: 'Plot 12, Industrial Hub, Surat, Gujarat 395004, India',
  phone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  email: 'inquiry@thakkartraders.com',
  workingHours: 'Mon — Sat, 09:30 — 19:00 IST',
  instagramUrl: '',
  linkedinUrl: '',
  facebookUrl: '',
};

const slideLeftVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const blockVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
};

const InfoCard = ({ icon: Icon, label, children }) => (
  <motion.div
    variants={blockVariants}
    className="flex flex-col border border-[#DED8CC] bg-[#FEFCF8] p-6 transition-all duration-300 hover:border-[#C89B4A]/40 hover:shadow-[0_8px_24px_rgba(200,155,74,0.09)]"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-8 w-8 items-center justify-center bg-[#C89B4A]/10 border border-[#C89B4A]/20">
        <Icon size={14} className="text-[#C89B4A]" />
      </div>
      <span className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#C89B4A]">
        {label}
      </span>
    </div>
    {children}
  </motion.div>
);

const ContactSection = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data?.success && response.data.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...response.data.data });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section
      id="contact"
      className="relative bg-[#F5F1EA] px-6 py-[100px] sm:px-8 lg:px-12"
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/20 to-transparent" />

      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-14 lg:gap-24">
          {/* Left Column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={slideLeftVariant}
            className="flex flex-col items-start"
          >
            <span className="section-label text-[#C89B4A]">09 / VISIT</span>
            <h2 className="display-heading mt-6 text-[clamp(2rem,3.2vw,3.8rem)] font-light text-[#2F2F2F] leading-[1.12]">
              Come see the materials
              <span className="block italic font-display mt-1 text-[#C89B4A]">in person.</span>
            </h2>
            <p className="mt-6 font-body text-[0.95rem] font-light text-[#6B6B6B] leading-[1.8] max-w-sm">
              Our showroom features a curated selection of materials — veneers, laminates, plywood samples and hardware — all available to view and touch before you specify.
            </p>
          </motion.div>

          {/* Right Column — Info Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none"
          >
            {/* Showroom */}
            <InfoCard icon={MapPin} label="SHOWROOM">
              <p className="font-body font-light text-[0.92rem] text-[#6B6B6B] leading-[1.8] m-0">
                {settings.showroomAddress}
              </p>
            </InfoCard>

            {/* Direct */}
            <InfoCard icon={Phone} label="DIRECT">
              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${settings.phone}`}
                  className="font-body font-normal text-[0.92rem] text-[#6B6B6B] hover:text-[#C89B4A] no-underline transition-colors duration-200"
                >
                  {settings.phone}
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="font-body font-normal text-[0.92rem] text-[#6B6B6B] hover:text-[#C89B4A] no-underline transition-colors duration-200 break-all"
                >
                  {settings.email}
                </a>
              </div>
            </InfoCard>

            {/* Hours */}
            <InfoCard icon={Clock} label="HOURS">
              <p className="font-body font-light text-[0.92rem] text-[#6B6B6B] leading-[1.8] m-0">
                {settings.workingHours}
              </p>
            </InfoCard>

            {/* Social */}
            <InfoCard icon={Instagram} label="SOCIAL">
              <div className="flex flex-col gap-2.5 items-start">
                <a
                  href={settings.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-normal text-[0.92rem] text-[#6B6B6B] hover:text-[#C89B4A] no-underline transition-all duration-200 hover:translate-x-1 flex items-center gap-2"
                >
                  <Instagram size={12} className="text-[#C89B4A]" />
                  Instagram
                </a>
                <a
                  href={settings.linkedinUrl || 'https://linkedin.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-normal text-[0.92rem] text-[#6B6B6B] hover:text-[#C89B4A] no-underline transition-all duration-200 hover:translate-x-1 flex items-center gap-2"
                >
                  <Linkedin size={12} className="text-[#C89B4A]" />
                  LinkedIn
                </a>
                <a
                  href={settings.facebookUrl || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-normal text-[0.92rem] text-[#6B6B6B] hover:text-[#C89B4A] no-underline transition-all duration-200 hover:translate-x-1 flex items-center gap-2"
                >
                  <Facebook size={12} className="text-[#C89B4A]" />
                  Facebook
                </a>
              </div>
            </InfoCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
