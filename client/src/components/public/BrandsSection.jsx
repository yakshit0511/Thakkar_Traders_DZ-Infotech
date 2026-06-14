import { motion } from 'framer-motion';
import {
  fadeUpVariant,
  staggerContainerVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const BRANDS = [
  'Century Ply', 'Greenply', 'Merino', 'Action Tesa', 'Austin',
  'Virgo', 'Advance', 'Kitply', 'Archidply', 'Durian',
  'Greenlam', 'Hettich', 'Hafele', 'Fevicol', 'Pidilite',
];

const BrandsSection = () => {
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: gridRef, controls: gridControls } = useScrollAnimation();

  return (
    <section id="brands" className="bg-[#ECE6DC] px-6 py-[72px] md:px-8 md:py-20 lg:px-12 lg:py-[128px]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerControls}
          variants={fadeUpVariant}
          className="max-w-2xl"
        >
          <p className="section-label text-[#C89B4A]">05 / AUTHORIZED BRANDS</p>
          <h2 className="display-heading mt-4 text-[clamp(2.2rem,3.8vw,4rem)] leading-[1.08] text-[#2F2F2F]">
            Trusted names,
            <br />
            <span className="font-display italic text-[#C89B4A]">authorized supply</span>.
          </h2>
          <p className="mt-6 font-body text-[1rem] font-light leading-[1.85] text-[#6B6B6B]">
            We stock only genuine inventory from India&apos;s most respected plywood, laminate,
            veneer, MDF and hardware brands — specification-ready for every project type.
          </p>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={gridControls}
          variants={staggerContainerVariant}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4"
        >
          {BRANDS.map((brand) => (
            <motion.div
              key={brand}
              variants={fadeUpVariant}
              className="group flex min-h-[92px] items-center justify-center border border-[#DED8CC] bg-[#FEFCF8] px-4 py-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C89B4A]/50 hover:bg-[#F5F1EA] hover:shadow-[0_12px_32px_rgba(200,155,74,0.13)]"
            >
              <span className="text-center font-display text-[1.05rem] font-medium text-[#2F2F2F] transition-colors duration-300 group-hover:text-[#C89B4A] lg:text-[1.12rem]">
                {brand}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrandsSection;
