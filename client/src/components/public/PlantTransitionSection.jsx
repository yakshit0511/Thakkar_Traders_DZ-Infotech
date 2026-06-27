import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * PlantTransitionSection
 *
 * Sits between ProjectsSection and GallerySection.
 * - When the user scrolls into view  → image zooms/fades IN
 * - While pinned in the viewport     → stays fully visible
 * - As the user scrolls past         → image fades OUT
 *
 * The section occupies 200vh of scroll space so the animation
 * has a comfortable entry & exit phase.
 */
const PlantTransitionSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Entry: 0 → 0.25 — fade + scale in
  // Hold:  0.25 → 0.70 — fully visible
  // Exit:  0.70 → 1    — fade out
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.70, 1],
    [0, 1, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.70, 1],
    [1.08, 1.0, 1.0, 0.96]
  );

  // Subtle upward drift on the image itself for a parallax feel
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  // Text fades in a bit after the image
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.65, 0.90],
    [0, 1, 1, 0]
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 0.22, 0.65, 0.90],
    [30, 0, 0, -20]
  );

  return (
    /* Outer scroll container — sets the total scroll travel */
    <div ref={containerRef} className="relative w-full" style={{ height: '200vh' }}>
      
      {/* Sticky viewport so content sticks while we scroll through it */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* Animated wrapper */}
        <motion.div
          style={{ opacity, scale }}
          className="relative w-full h-full"
        >
          {/* Parallax image layer */}
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-0 w-full h-[110%] -top-[5%]"
          >
            <img
              src="/images/plant_hands.jpg"
              alt="Hands holding a young plant in soil — growth and sustainability"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </motion.div>

          {/* Gradient overlay — dark centre vignette + bottom-up scrim for readability */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: [
                /* heavy centre vignette so text sits on dark */
                'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(6,4,2,0.52) 0%, rgba(6,4,2,0.10) 100%)',
                /* bottom scrim */
                'linear-gradient(to top, rgba(6,4,2,0.65) 0%, transparent 55%)',
                /* top scrim */
                'linear-gradient(to bottom, rgba(6,4,2,0.30) 0%, transparent 40%)',
              ].join(', '),
            }}
          />

          {/* Centered text overlay */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            {/* Eyebrow label */}
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.70rem',
                letterSpacing: '0.24em',
                color: '#E2B96A',
                textShadow: '0 1px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6)',
              }}
              className="uppercase mb-5 block"
            >
              Rooted in quality
            </span>

            {/* Main headline */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                textShadow: '0 2px 20px rgba(0,0,0,0.7), 0 4px 40px rgba(0,0,0,0.5)',
              }}
              className="text-[clamp(2.2rem,5vw,5rem)] font-light text-[#F5F0E8] leading-[1.1] max-w-3xl"
            >
              Every space begins with{' '}
              <span
                className="italic"
                style={{ color: '#E2B96A' }}
              >
                something real
              </span>
              .
            </h2>

            {/* Sub-copy */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                textShadow: '0 1px 10px rgba(0,0,0,0.75)',
              }}
              className="mt-6 text-[clamp(0.9rem,1.6vw,1.1rem)] font-light text-[#F5F0E8] max-w-xl leading-[1.8]"
            >
              Premium materials sourced from nature, crafted for lasting beauty
              — explore what we carry below.
            </p>

            {/* Scroll nudge */}
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.64rem',
                letterSpacing: '0.18em',
                color: 'rgba(245,240,232,0.80)',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
              }}
              className="mt-10 flex items-center gap-3 animate-bounce"
            >
              <span>↓</span>
              <span>SCROLL TO VIEW THE GALLERY</span>
              <span>↓</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default PlantTransitionSection;
