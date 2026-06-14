import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const BRANDS = [
  'CENTURY PLY', 'GREENPLY', 'MERINO', 'ACTION TESA', 'AUSTIN',
  'VIRGO', 'ADVANCE', 'KITPLY', 'ARCHIDPLY', 'DURIAN', 'GREENLAM', 'HAFELE',
];

const HERO_SLIDES = [
  { url: '/images/kitchen.png', alt: 'Premium laminate kitchen cabinetry' },
  { url: '/images/wood_closeup.png', alt: 'Natural wood grain texture close-up' },
  { url: 'https://images.unsplash.com/photo-1618221198740-0a7c0643a088?w=1920&q=85&auto=format&fit=crop', alt: 'Modern interior with premium wood paneling' },
  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format&fit=crop', alt: 'Luxury residential interior wood finishes' },
  { url: '/images/tv_unit.png', alt: 'Living room with wooden TV unit' },
  { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=85&auto=format&fit=crop', alt: 'Designer kitchen with laminate cabinetry' },
  { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&auto=format&fit=crop', alt: 'Architectural interior with wood and MDF' },
];

const SLIDE_INTERVAL = 3500;

const lineVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay) => ({
    opacity: 1, y: 0,
    transition: { delay, duration: 0.8, type: 'spring', stiffness: 70, damping: 18 },
  }),
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay) => ({
    opacity: 1, y: 0,
    transition: { delay, duration: 0.7, ease: [0, 0, 0.2, 1] },
  }),
};

const scrollToProducts = (e) => {
  e.preventDefault();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
};
const scrollToQuote = (e) => {
  e.preventDefault();
  document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
};

const HeroSection = () => {
  const slideshowRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loaded = 0;
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === HERO_SLIDES.length) setImagesLoaded(true);
      };
      img.src = slide.url;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slideshow = slideshowRef.current;
    if (!slideshow) return;
    const handleScroll = () => {
      slideshow.style.transform = `translateY(${window.scrollY * 0.22}px)`;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const marqueeContent = BRANDS.map((brand, i) => (
    <span key={`${brand}-${i}`} className="flex items-center">
      <span className="marquee-item">{brand}</span>
      <span className="mx-7 text-[#C89B4A] opacity-60">·</span>
    </span>
  ));

  return (
    <section className="hero-section relative w-full overflow-hidden bg-[#F5F1EA]">
      {/* Gold top accent */}
      <div
        className="absolute left-0 right-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#C89B4A] to-transparent opacity-50"
        aria-hidden="true"
      />

      {/* Slideshow background */}
      <div ref={slideshowRef} className="absolute inset-0 will-change-transform" aria-hidden="true">
        {HERO_SLIDES.map((slide, index) => (
          <motion.img
            key={slide.url}
            src={slide.url}
            alt={slide.alt}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={{
              opacity: index === currentSlide && imagesLoaded ? 0.82 : index === currentSlide ? 0.6 : 0,
              scale: index === currentSlide ? 1.03 : 1.07,
            }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Gradient overlay — stronger on left for text, lighter on right for image */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(245,241,234,0.92) 0%, rgba(245,241,234,0.72) 40%, rgba(245,241,234,0.18) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Slide dots */}
      <div className="absolute bottom-14 right-6 z-20 hidden gap-2 sm:flex lg:right-12">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.url}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-[3px] rounded-full transition-all duration-400 ${
              index === currentSlide
                ? 'w-7 bg-[#C89B4A]'
                : 'w-2 bg-[rgba(200,155,74,0.3)] hover:bg-[rgba(200,155,74,0.55)]'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 pb-[44px] pt-8 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          <motion.p
            className="section-label text-[#C89B4A] mb-7"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            Premium Interior Building Materials — Surat
          </motion.p>

          <h1 className="display-heading hero-headline">
            <motion.span
              className="block text-[#2F2F2F]"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              custom={0.25}
            >
              Building
            </motion.span>
            <motion.span
              className="block text-[#2F2F2F]"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              Spaces With
            </motion.span>
            <motion.span
              className="block text-[#2F2F2F]"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              custom={0.55}
            >
              <span className="font-display italic text-[#C89B4A]">Premium</span> Wood.
            </motion.span>
          </h1>

          <motion.p
            className="hero-subtext mt-8 max-w-[520px] font-body font-light text-[#6B6B6B]"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.75}
          >
            Authorized distributors of India&apos;s leading plywood, laminate, veneer, MDF and
            interior material brands — serving architects, builders and designers.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.9}
          >
            <a
              href="#products"
              onClick={scrollToProducts}
              className="inline-flex w-full items-center justify-center bg-[#C89B4A] px-8 py-4 font-body text-[0.78rem] font-medium tracking-[0.12em] text-white no-underline transition-all duration-300 hover:bg-[#A8732A] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,155,74,0.3)] sm:w-auto"
            >
              EXPLORE PRODUCTS
            </a>
            <a
              href="#quote"
              onClick={scrollToQuote}
              className="inline-flex w-full items-center justify-center border border-[#2F2F2F]/25 bg-transparent px-8 py-4 font-body text-[0.78rem] font-medium tracking-[0.12em] text-[#2F2F2F] no-underline transition-all duration-300 hover:border-[#C89B4A] hover:bg-[#C89B4A] hover:text-white sm:w-auto"
            >
              REQUEST QUOTE
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          aria-hidden="true"
        >
          <div className="relative h-12 w-px bg-[rgba(200,155,74,0.35)]">
            <motion.div
              className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C89B4A]"
              animate={{ y: [0, 36, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Brand marquee strip */}
      <div className="marquee-strip absolute bottom-0 left-0 right-0 z-20">
        <div className="marquee-track">
          {marqueeContent}
          {marqueeContent}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
