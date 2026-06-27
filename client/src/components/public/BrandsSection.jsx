import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND_CATEGORIES = [
  {
    id: 'laminates',
    label: 'Laminates',
    brands: ['Merino Laminates', 'Greenlam Laminates', 'Virgo Laminates', 'Advance Laminates', 'Durian Laminates'],
  },
  {
    id: 'plywood',
    label: 'Plywood',
    brands: ['Century Ply', 'Greenply Plywood', 'Austin Plywood', 'Kitply', 'Archidply Plywood'],
  },
  {
    id: 'veneer',
    label: 'Veneer',
    brands: ['Century Veneers', 'Green Veneer', 'Merino Veneers', 'Decoply Veneers'],
  },
  {
    id: 'hardware',
    label: 'Hardware',
    brands: ['Hettich Hardware', 'Hafele Fittings', 'Fevicol Adhesives', 'Pidilite Industries'],
  },
  {
    id: 'solidsurface',
    label: 'Solid Surface',
    brands: ['Merino Hanex', 'Virgo Solid Surface', 'Century Solidex'],
  },
];

const BrandsSection = () => {
  const [activeCategory, setActiveCategory] = useState('laminates');

  const currentCategory = BRAND_CATEGORIES.find((cat) => cat.id === activeCategory) || BRAND_CATEGORIES[0];

  return (
    <section id="brands" className="bg-[#1A1A1A] text-[#F5F0E8] px-6 py-[80px] md:px-8 md:py-24 lg:px-12 lg:py-[128px] overflow-hidden select-none">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column — Headers & Category Tabs */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <span 
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.22em', color: '#C9A84C' }}
              className="uppercase font-semibold"
            >
              03 / AUTHORIZED BRANDS
            </span>
            <h2 
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-[clamp(2.5rem,4.5vw,4.5rem)] font-light leading-[1.08] text-[#F5F0E8] mt-6"
            >
              Trusted names,<br />
              <span className="italic text-[#C9A84C]">authorized supply</span>.
            </h2>
            <p 
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-[#9CA3AF] font-light text-[0.95rem] leading-[1.8] mt-6 max-w-md"
            >
              We stock only genuine inventory from India's most respected interior material brands — specification-ready for every architectural design.
            </p>

            {/* Tabs Selector list (Vertical on desktop, horizontal scroll on mobile) */}
            <div className="w-full mt-10 flex lg:flex-col flex-row gap-4 overflow-x-auto no-scrollbar lg:overflow-visible pb-4 lg:pb-0">
              {BRAND_CATEGORIES.map((cat) => {
                const isActive = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="relative text-left shrink-0 py-2 pr-6 focus:outline-none transition-all duration-300"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.78rem',
                      letterSpacing: '0.12em',
                      color: isActive ? '#F5F0E8' : '#6B7280',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {cat.label.toUpperCase()}
                    {isActive && (
                      <motion.div
                        layoutId="activeBrandIndicator"
                        className="absolute bottom-0 left-0 h-[2px] bg-[#C9A84C]"
                        style={{ width: '40px' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column — Brands List */}
          <div className="lg:col-span-7 w-full border-t border-[#2A2A2A] lg:border-t-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col"
              >
                {currentCategory.brands.map((brand, index) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #2A2A2A' }}
                    className="group py-6 flex items-center justify-between transition-all duration-300 cursor-pointer"
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
                        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.4s ease',
                      }}
                      className="text-[#9CA3AF] group-hover:text-[#C9A84C] group-hover:translate-x-3"
                    >
                      {brand}
                    </span>
                    <span 
                      style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#6B7280' }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      SPECIFICATION SUPPORT →
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default BrandsSection;
