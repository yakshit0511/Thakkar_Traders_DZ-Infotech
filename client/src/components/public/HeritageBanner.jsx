import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  { number: '01', label: 'HERITAGE', text: '15+ years of curating the finest materials in India.' },
  { number: '02', label: 'AUDIENCE', text: 'Serving architects, builders & interior designers.' },
  { number: '03', label: 'CRAFT', text: 'Premium materials for exceptional spaces.' },
  { number: '04', label: 'REACH', text: 'Trusted across Gujarat & beyond.' },
];

const slideVariants = {
  enter: (direction) => ({ y: direction > 0 ? 44 : -44, opacity: 0 }),
  center: {
    y: 0, opacity: 1,
    transition: {
      y: { type: 'spring', stiffness: 200, damping: 28 },
      opacity: { duration: 0.5 },
    },
  },
  exit: (direction) => ({
    y: direction < 0 ? 44 : -44, opacity: 0,
    transition: { opacity: { duration: 0.4 } },
  }),
};

const HeritageBanner = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const currentSlide = Math.abs(page % SLIDES.length);
  const slide = SLIDES[currentSlide];

  const paginate = (newDirection) => setPage([page + newDirection, newDirection]);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 4500);
    return () => clearInterval(timer);
  }, [page]);

  return (
    <section className="relative w-full overflow-hidden bg-[#2F2F2F] flex items-center justify-center select-none py-[100px] min-h-[560px]">
      {/* Decorative wood-grain texture overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="heritage-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.7  0 0 0 0 0.5  0 0 0 0.9 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#heritage-noise)" />
        </svg>
      </div>

      {/* Gold top/bottom border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/40 to-transparent" />

      {/* Gold corner accents */}
      <div className="absolute top-8 left-8 w-10 h-10 border-t border-l border-[#C89B4A]/30 hidden lg:block" />
      <div className="absolute top-8 right-8 w-10 h-10 border-t border-r border-[#C89B4A]/30 hidden lg:block" />
      <div className="absolute bottom-8 left-8 w-10 h-10 border-b border-l border-[#C89B4A]/30 hidden lg:block" />
      <div className="absolute bottom-8 right-8 w-10 h-10 border-b border-r border-[#C89B4A]/30 hidden lg:block" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[1200px] w-full">
        {/* Slide content */}
        <div className="relative h-[300px] sm:h-[240px] lg:h-[260px] w-full flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Label */}
              <span className="font-mono text-[0.62rem] tracking-[0.28em] uppercase text-[#C89B4A] mb-8">
                {slide.number} — {slide.label}
              </span>

              {/* Main text */}
              <h2 className="font-display font-light text-[clamp(2.4rem,5.2vw,5.5rem)] leading-[1.12] text-[#F5F1EA] max-w-5xl text-center">
                {slide.text.includes('&') ? (
                  <>
                    {slide.text.split('&')[0]}
                    <span className="font-display italic text-[#C89B4A] mx-3">&</span>
                    {slide.text.split('&')[1]}
                  </>
                ) : (
                  slide.text
                )}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gold divider */}
        <div className="mt-8 h-px w-16 bg-[#C89B4A]/50" />

        {/* Navigation dots */}
        <div className="flex gap-3 z-20 justify-center mt-8">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const dir = index > currentSlide ? 1 : -1;
                setPage([index, dir]);
              }}
              className={`h-[3px] rounded-full transition-all duration-400 ${
                index === currentSlide
                  ? 'w-8 bg-[#C89B4A]'
                  : 'w-3 bg-[#C89B4A]/25 hover:bg-[#C89B4A]/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeritageBanner;
