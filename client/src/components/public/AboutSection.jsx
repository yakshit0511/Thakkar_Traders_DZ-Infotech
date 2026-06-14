import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
  fadeUpVariant,
  slideLeftVariant,
  staggerContainerVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const DEFAULT_PARAGRAPH_1 =
  'For over fifteen years, Thakkar Traders has supplied premium plywood, laminates, veneers, MDF, HDHMR, doors and decorative materials to homeowners, architects, interior designers, contractors and furniture manufacturers across the region.';

const DEFAULT_PARAGRAPH_2 =
  "We carry only authorized inventory from India's most trusted brands and pair it with expert consultation, fast site delivery and honest pricing — so the materials you specify always land on site exactly as intended.";

const FEATURE_TAGS = [
  'GENUINE BRANDED INVENTORY',
  'TRUSTED BY 100+ ARCHITECTS',
  'COMPETITIVE TRADE PRICING',
  'LARGE IN-STOCK CATALOGUE',
  'EXPERT MATERIAL CONSULTATION',
  'FAST SITE DELIVERY',
];

const AboutSection = () => {
  const [paragraph1, setParagraph1] = useState(DEFAULT_PARAGRAPH_1);
  const [paragraph2, setParagraph2] = useState(DEFAULT_PARAGRAPH_2);
  const { ref: labelRef, controls: labelControls } = useScrollAnimation();
  const { ref: headingRef, controls: headingControls } = useScrollAnimation();
  const { ref: textRef, controls: textControls } = useScrollAnimation();
  const { ref: tagsRef, controls: tagsControls } = useScrollAnimation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.success && data.data) {
          if (data.data.aboutParagraph1) setParagraph1(data.data.aboutParagraph1);
          if (data.data.aboutParagraph2) setParagraph2(data.data.aboutParagraph2);
        }
      } catch { /* use defaults */ }
    };
    fetchSettings();
  }, []);

  return (
    <section
      id="about"
      className="relative bg-[#F5F1EA] px-6 py-[72px] md:px-8 md:py-20 lg:px-12 lg:py-[128px]"
    >
      {/* Decorative separator */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/12 to-transparent" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 lg:grid-cols-[44%_56%] lg:gap-24">
        {/* Left column */}
        <div>
          <motion.p
            ref={labelRef}
            initial="hidden"
            animate={labelControls}
            variants={fadeUpVariant}
            className="section-label text-[#C89B4A]"
          >
            01 / THE STUDIO
          </motion.p>

          <motion.h2
            ref={headingRef}
            initial="hidden"
            animate={headingControls}
            variants={slideLeftVariant}
            transition={{ delay: 0.15 }}
            className="display-heading mt-6 text-[clamp(2rem,3.2vw,3.8rem)] font-light leading-[1.12] text-[#2F2F2F]"
          >
            A material library for the
            <br />
            <span className="font-display italic text-[#C89B4A]">modern architect</span>.
          </motion.h2>

          {/* Image accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-10 hidden lg:block"
          >
            <img
              src="/images/wood_closeup.png"
              alt="Premium wood material closeup"
              className="w-full h-[220px] object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Right column */}
        <div>
          <motion.div
            ref={textRef}
            initial="hidden"
            animate={textControls}
            variants={fadeUpVariant}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-6"
          >
            <p className="font-body text-[1rem] font-light leading-[1.85] text-[#6B6B6B]">
              {paragraph1}
            </p>
            <p className="font-body text-[1rem] font-light leading-[1.85] text-[#6B6B6B]">
              {paragraph2}
            </p>
          </motion.div>

          <div className="mt-12 h-px w-full bg-[#DED8CC]" />

          <motion.div
            ref={tagsRef}
            initial="hidden"
            animate={tagsControls}
            variants={staggerContainerVariant}
            className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {FEATURE_TAGS.map((tag) => (
              <motion.div
                key={tag}
                variants={fadeUpVariant}
                className="flex items-center gap-3 border border-[#DED8CC] bg-[#FEFCF8] px-4 py-3 transition-all duration-300 hover:border-[#C89B4A]/40 hover:bg-[#F5F0E8]"
              >
                <span className="h-px w-5 shrink-0 bg-[#C89B4A]" />
                <span className="font-body text-[0.72rem] font-medium uppercase tracking-[0.13em] text-[#2F2F2F]">
                  {tag}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
