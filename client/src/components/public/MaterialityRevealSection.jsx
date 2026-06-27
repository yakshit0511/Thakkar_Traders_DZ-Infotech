import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const CLOUDINARY_IMAGE_URL = 'https://res.cloudinary.com/dclc4tor2/image/upload/v1782538251/thakkar_traders_growth/plant_growth.jpg';

const MaterialityRevealSection = () => {
  const sectionRef = useRef(null);
  
  // Detect if touch/mobile device
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.matchMedia('(hover: none) or (max-width: 768px)').matches);
  }, []);

  // useInView with threshold of 0.2 and triggering once when entering viewport
  const isInView = useInView(sectionRef, { threshold: 0.2, once: true });

  // useScroll to track scroll progress relative to this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress [0.5, 1] to opacity [1, 0]. Keep it fully visible [1] before 0.5
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  // Subtle parallax upward movement: map scroll progress [0, 1] to y offsets ['0%', '-15%']
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity: sectionOpacity }}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Background Image Container with parallax */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 w-full h-[120%] pointer-events-none"
      >
        <motion.img
          src={CLOUDINARY_IMAGE_URL}
          alt="Hands cupping soil with green seedling"
          initial={{ scale: isMobile ? 1.06 : 1.1, opacity: 0 }}
          animate={isInView ? { scale: 1.0, opacity: 1 } : { scale: isMobile ? 1.06 : 1.1, opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Dark Slightly Green-Tinted Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.35 } : { opacity: 0 }}
        transition={{ duration: 1.0 }}
        className="absolute inset-0 bg-[#050a05] pointer-events-none z-10"
      />

      {/* Text Content Overlay Centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-none">
        
        {/* Section Label: 06 — GROWTH */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.65 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: '#F5F0E8',
          }}
          className="uppercase"
        >
          06 — GROWTH
        </motion.span>

        {/* Heading: Where craft meets nature. */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 0.92, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(1.8rem, 3.5vw, 3.5rem)',
            color: '#F5F0E8',
            marginTop: '16px',
          }}
        >
          Where craft meets nature.
        </motion.h2>

        {/* Subtext: Premium materials grown from trust. */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.5 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
            color: '#F5F0E8',
            marginTop: '12px',
            letterSpacing: '0.08em',
          }}
        >
          Premium materials grown from trust.
        </motion.p>

        {/* Thin Gold Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5, delay: 1.2, ease: 'easeOut' }}
          style={{
            width: '48px',
            height: '1px',
            background: 'rgba(201,168,76,0.6)',
            marginTop: '28px',
            transformOrigin: 'left center',
          }}
        />

      </div>
    </motion.section>
  );
};

export default MaterialityRevealSection;
