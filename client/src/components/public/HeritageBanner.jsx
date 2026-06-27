import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    number: '01',
    label: 'HERITAGE',
    ghostLine1: '15+ years of curating the',
    ghostLine2: 'finest materials in India',
    foreLine1: 'Serving architects, builders',
    foreLine2: 'and interior designers.',
  },
  {
    number: '02',
    label: 'AUDIENCE',
    ghostLine1: 'Serving architects, builders',
    ghostLine2: 'and interior designers',
    foreLine1: 'Premium materials for',
    foreLine2: 'exceptional spaces.',
  },
  {
    number: '03',
    label: 'CRAFT',
    ghostLine1: 'Premium materials for',
    ghostLine2: 'exceptional spaces',
    foreLine1: 'Trusted across Gujarat',
    foreLine2: 'and far beyond.',
  },
  {
    number: '04',
    label: 'REACH',
    ghostLine1: 'Trusted across Gujarat',
    ghostLine2: 'and far beyond',
    foreLine1: 'Defining luxury interiors',
    foreLine2: 'with curated heritage.',
  },
];

const HeritageBanner = () => {
  const parentRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: parentRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // Divide progress into 4 ranges
      let index = Math.floor(latest * 4);
      if (index > 3) index = 3;
      if (index < 0) index = 0;
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const slide = SLIDES[activeIndex];

  return (
    <div ref={parentRef} className="relative w-full" style={{ height: '300vh' }}>
      <div className="sticky top-0 w-full h-screen bg-[#2F2F2F] overflow-hidden flex flex-col items-center justify-center select-none">
        
        {/* Decorative wood-grain texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="heritage-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.7  0 0 0 0 0.5  0 0 0 0 0.9 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#heritage-noise)" />
          </svg>
        </div>

        {/* Gold top/bottom border lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

        {/* Corner frame decorations */}
        <div className="absolute top-6 left-6 w-10 h-10 border-t border-l border-[rgba(245,240,232,0.15)] pointer-events-none hidden sm:block" />
        <div className="absolute top-6 right-6 w-10 h-10 border-t border-r border-[rgba(245,240,232,0.15)] pointer-events-none hidden sm:block" />
        <div className="absolute bottom-6 left-6 w-10 h-10 border-b border-l border-[rgba(245,240,232,0.15)] pointer-events-none hidden sm:block" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b border-r border-[rgba(245,240,232,0.15)] pointer-events-none hidden sm:block" />

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-[60px] left-1/2 -translate-x-1/2 z-10"
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.22em', color: '#C9A84C' }} className="uppercase">
            02 — HERITAGE
          </span>
        </motion.div>

        {/* Relative container that fills the sticky section */}
        <div className="relative w-full max-w-[1200px] h-full flex flex-col items-center justify-center z-10 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Foreground prominent text */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  pointerEvents: 'auto',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 'clamp(2.8rem, 6vw, 6.5rem)', color: '#F5F0E8', margin: 0, lineHeight: 1.1 }}>
                    {slide.foreLine1}
                  </h3>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(2.8rem, 6vw, 6.5rem)', color: '#C9A84C', margin: 0, lineHeight: 1.1 }}>
                    {slide.foreLine2}
                  </h3>

                  {/* Decorative gold line */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    style={{
                      marginTop: '40px',
                      width: '60px',
                      height: '1px',
                      background: '#C9A84C',
                    }}
                  />

                  {/* Decorative dots */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    style={{
                      marginTop: '24px',
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {SLIDES.map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: idx === activeIndex ? '#C9A84C' : 'transparent',
                          border: idx === activeIndex ? 'none' : '1px solid rgba(245,240,232,0.25)',
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default HeritageBanner;
