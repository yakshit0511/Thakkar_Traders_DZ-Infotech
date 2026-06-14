import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BRANDS = [
  'CENTURY PLY',
  'GREENPLY',
  'MERINO',
  'ACTION TESA',
  'AUSTIN',
  'VIRGO',
  'ADVANCE',
  'KITPLY',
  'ARCHIDPLY',
  'DURIAN',
];

/* Interior building materials — plywood, laminates, veneers, MDF, doors, hardware */
const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1615874952213-4839332910a0?w=1920&q=80&auto=format&fit=crop',
    alt: 'Wood veneer and laminate sample stacks',
  },
  {
    url: 'https://images.unsplash.com/photo-1507089947368-19c7354e2655?w=1920&q=80&auto=format&fit=crop',
    alt: 'Premium natural wood grain texture',
  },
  {
    url: 'https://images.unsplash.com/photo-1513694206110-3e5af556165e?w=1920&q=80&auto=format&fit=crop',
    alt: 'Stacked plywood and timber panels',
  },
  {
    url: 'https://images.unsplash.com/photo-1618221198740-0a7c0643a088?w=1920&q=80&auto=format&fit=crop',
    alt: 'Modern interior with premium wood paneling',
  },
  {
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80&auto=format&fit=crop',
    alt: 'Hardwood flooring and laminate surfaces',
  },
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&auto=format&fit=crop',
    alt: 'Luxury residential interior wood finishes',
  },
  {
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80&auto=format&fit=crop',
    alt: 'Designer kitchen with laminate cabinetry',
  },
  {
    url: 'https://images.unsplash.com/photo-1591825729269-caeb344f5de2?w=1920&q=80&auto=format&fit=crop',
    alt: 'Exotic veneer sheets for furniture',
  },
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format&fit=crop',
    alt: 'Commercial office interior fitout materials',
  },
  {
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80&auto=format&fit=crop',
    alt: 'Architectural interior with wood and MDF',
  },
];

const SLIDE_INTERVAL = 1000;

const lineVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.7,
      type: 'spring',
      stiffness: 80,
      damping: 18,
    },
  }),
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0, 0, 0.2, 1] },
  }),
};

const scrollToQuote = (e) => {
  e.preventDefault();
  const el = document.getElementById('quote-form');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const HeroSection = () => {
  const slideshowRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loaded = 0;
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.onload = () => {
        loaded += 1;
        if (loaded === HERO_SLIDES.length) setImagesLoaded(true);
      };
      img.onerror = () => {
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
      const scrollY = window.scrollY;
      slideshow.style.transform = `translateY(${scrollY * 0.25}px)`;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const marqueeContent = BRANDS.map((brand, i) => (
    <span key={`${brand}-${i}`} className="flex items-center">
      <span className="marquee-item">{brand}</span>
      <span className="mx-6 text-[#C9A84C]">·</span>
    </span>
  ));

  return (
    <section className="hero-section relative w-full overflow-hidden bg-[#0A0F1E]">
      {/* Gold separator */}
      <div
        className="absolute left-0 right-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-60"
        aria-hidden="true"
      />

      {/* Slideshow background */}
      <div
        ref={slideshowRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
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
              opacity: index === currentSlide && imagesLoaded ? 1 : index === currentSlide ? 0.3 : 0,
              scale: index === currentSlide ? 1.04 : 1.08,
            }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Overlays — lighter so photos remain visible */}
      <div className="absolute inset-0 bg-[rgba(10,15,30,0.35)]" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(10, 15, 30, 0.78) 0%, rgba(10, 15, 30, 0.5) 45%, rgba(10, 15, 30, 0.35) 70%, rgba(10, 15, 30, 0.65) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Slide progress dots */}
      <div className="absolute bottom-14 right-6 z-20 hidden gap-1.5 sm:flex lg:right-12">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.url}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-6 bg-[#C9A84C]'
                : 'w-1.5 bg-[rgba(201,168,76,0.35)] hover:bg-[rgba(201,168,76,0.6)]'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 pb-[40px] pt-8 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          <p className="section-label mb-6">Premium Interior Building Materials — Surat</p>

          <h1 className="display-heading hero-headline">
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              Building
            </motion.span>
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              custom={0.35}
            >
              Spaces With
            </motion.span>
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              custom={0.5}
            >
              <span className="font-display italic text-[#C9A84C]">Premium</span> Wood.
            </motion.span>
          </h1>

          <motion.p
            className="hero-subtext mt-8 max-w-[520px] font-body font-light text-[#8A8A7A]"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.7}
          >
            Authorized distributors of India&apos;s leading plywood, laminate, veneer, MDF and
            interior material brands.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.85}
          >
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center bg-[#C9A84C] px-8 py-3.5 font-body text-[0.8rem] font-medium tracking-[0.1em] text-[#0A0F1E] no-underline transition-[background-color,transform,box-shadow] duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#B87333] hover:shadow-[0_8px_24px_rgba(201,168,76,0.25)] sm:w-auto"
            >
              EXPLORE PRODUCTS
            </Link>
            <a
              href="#quote-form"
              onClick={scrollToQuote}
              className="inline-flex w-full items-center justify-center border border-[#F5F0E8] bg-transparent px-8 py-3.5 font-body text-[0.8rem] font-medium tracking-[0.1em] text-[#F5F0E8] no-underline transition-[border-color,color] duration-300 ease-in-out hover:border-[#C9A84C] hover:text-[#C9A84C] sm:w-auto"
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
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-hidden="true"
        >
          <div className="relative h-12 w-px bg-[rgba(201,168,76,0.4)]">
            <motion.div
              className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C9A84C]"
              animate={{ y: [0, 36, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
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
