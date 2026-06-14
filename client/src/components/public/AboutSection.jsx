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
      } catch {
        /* use defaults */
      }
    };

    fetchSettings();
  }, []);

  return (
    <section
      id="about"
      className="section-light bg-[#F7F4EE] px-6 py-[60px] md:px-8 md:py-20 lg:px-12 lg:py-[120px]"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-[42%_58%] lg:gap-20">
        {/* Left column */}
        <div>
          <motion.p
            ref={labelRef}
            initial="hidden"
            animate={labelControls}
            variants={fadeUpVariant}
            className="section-label"
          >
            01 / THE STUDIO
          </motion.p>

          <motion.h2
            ref={headingRef}
            initial="hidden"
            animate={headingControls}
            variants={slideLeftVariant}
            transition={{ delay: 0.15 }}
            className="display-heading mt-6 text-[clamp(2.2rem,3.5vw,3.8rem)] leading-[1.1] text-[#1C1C1C]"
          >
            A material library for the
            <br />
            <span className="font-display italic">modern architect</span>.
          </motion.h2>
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
            <p className="font-body text-[0.95rem] font-light leading-[1.8] text-[#5A5A4A] lg:text-[1.05rem]">
              {paragraph1}
            </p>
            <p className="font-body text-[0.95rem] font-light leading-[1.8] text-[#5A5A4A] lg:text-[1.05rem]">
              {paragraph2}
            </p>
          </motion.div>

          <div className="mt-12 h-px w-full bg-[#D6D0C6]" />

          <motion.div
            ref={tagsRef}
            initial="hidden"
            animate={tagsControls}
            variants={staggerContainerVariant}
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4"
          >
            {FEATURE_TAGS.map((tag) => (
              <motion.div
                key={tag}
                variants={fadeUpVariant}
                className="flex items-center gap-3"
              >
                <span className="h-px w-6 shrink-0 bg-[#C9A84C]" />
                <span className="font-body text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[#3A3A2A]">
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
