import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import api from '../../utils/api';

const DEFAULT_SETTINGS = {
  phone: '+91 98765 43210',
  whatsappNumber: '919876543210',
};

const WhatsAppIcon = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.948 9.948 0 0 0 4.779 1.218h.004c5.502 0 9.985-4.479 9.986-9.986a9.982 9.982 0 0 0-10-9.987Zm5.806 14.137c-.25.703-1.444 1.293-1.996 1.358-.5.06-1.127.106-3.23-.767-2.69-1.115-4.408-3.853-4.542-4.033-.134-.18-1.09-1.447-1.09-2.76 0-1.314.686-1.96.932-2.222.247-.262.541-.328.72-.328.18 0 .36.002.518.01.166.007.392-.06.613.473.226.547.773 1.887.84 2.022.067.135.111.292.02.473-.09.18-.135.293-.27.45-.136.158-.285.353-.406.473-.135.135-.277.283-.12.55.158.267.701 1.154 1.503 1.868.802.714 1.48.936 1.765 1.05.285.113.45.09.613-.09.162-.18.705-.818.895-1.096.19-.278.38-.233.642-.135.263.097 1.667.785 1.952.928.285.143.474.214.544.336.07.12.07.701-.18 1.404Z" />
  </svg>
);

const FloatingButtons = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data && response.data.success && response.data.data) {
          setSettings({
            phone: response.data.data.phone || DEFAULT_SETTINGS.phone,
            whatsappNumber: response.data.data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          });
        }
      } catch (error) {
        console.error('Error fetching settings for floating buttons, using defaults:', error);
      }
    };
    fetchSettings();
  }, []);

  // Format whatsapp link safely
  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-0 right-0 z-[300] pointer-events-none select-none">
      {/* Phone Button */}
      <motion.a
        href={`tel:${settings.phone}`}
        whileHover={{ scale: 1.1 }}
        className="absolute bottom-[86px] sm:bottom-[100px] right-[23px] sm:right-[28px] pointer-events-auto flex items-center justify-center rounded-full bg-[#1C1C1C] text-[#F5F0E8] shadow-lg transition-colors duration-200 hover:bg-[#C9A84C] hover:text-[#0A0F1E] w-[44px] h-[44px] sm:w-12 sm:h-12"
        aria-label="Call Thakkar Traders"
      >
        <Phone size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
      </motion.a>

      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${cleanWhatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        className="absolute bottom-6 sm:bottom-8 right-5 sm:right-6 pointer-events-auto flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg w-[50px] h-[50px] sm:w-14 sm:h-14"
        aria-label="Chat with Thakkar Traders on WhatsApp"
      >
        <WhatsAppIcon size={26} className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]" />

        {/* Pulsing Ripple Ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#25D366] -z-10"
          animate={{
            scale: [1, 1.6],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </motion.a>
    </div>
  );
};

export default FloatingButtons;
