import { motion } from 'framer-motion';
import {
  fadeUpVariant,
  staggerContainerVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const BRANDS = [
  'Century Ply',
  'Greenply',
  'Merino',
  'Action Tesa',
  'Austin',
  'Virgo',
  'Advance',
  'Kitply',
  'Archidply',
  'Durian',
  'Greenlam',
  'Hettich',
  'Hafele',
  'Fevicol',
  'Pidilite',
];

const BrandsSection = () => {
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: gridRef, controls: gridControls } = useScrollAnimation();

  return (
    <section id="brands" className="bg-[#F7F4EE] px-6 py-[60px] md:px-8 md:py-20 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerControls}
          variants={fadeUpVariant}
          className="max-w-2xl"
        >
          <p className="section-label text-[#C9A84C]">05 / AUTHORIZED BRANDS</p>
          <h2 className="display-heading mt-4 text-[clamp(2rem,3.5vw,3.5rem)] leading-[1.1] text-[#1C1C1C]">
            Trusted names,
            <br />
            <span className="font-display italic">authorized supply</span>.
          </h2>
          <p className="mt-6 font-body text-[0.95rem] font-light leading-[1.8] text-[#5A5A4A] lg:text-[1.05rem]">
            We stock only genuine inventory from India&apos;s most respected plywood, laminate,
            veneer, MDF and hardware brands — ready for architects, builders and furniture
            manufacturers.
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
              className="group flex min-h-[88px] items-center justify-center border border-[#D6D0C6] bg-white/50 px-4 py-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#C9A84C] hover:bg-white"
            >
              <span className="text-center font-display text-[1.05rem] font-medium text-[#1C1C1C] transition-colors duration-300 group-hover:text-[#8A6F2E] lg:text-[1.15rem]">
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
