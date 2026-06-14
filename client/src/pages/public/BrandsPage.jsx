import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import BrandsSection from '../../components/public/BrandsSection';

const WHY_AUTHORIZED = [
  {
    title: 'Genuine Quality',
    body: 'Every sheet and board comes with original brand certification — no imitations, no compromises.',
  },
  {
    title: 'Warranty Coverage',
    body: 'Authorized dealers carry full manufacturer warranty, protecting your projects and clients.',
  },
  {
    title: 'Consistent Supply',
    body: 'We maintain large in-stock inventory of each brand so you never face project delays.',
  },
  {
    title: 'Expert Guidance',
    body: 'Our team has hands-on experience with every brand we stock — spec advice is always free.',
  },
];

const BrandsPage = () => (
  <>
    <Helmet>
      <title>Authorized Brands | Thakkar Traders — Surat</title>
      <meta
        name="description"
        content="Thakkar Traders is an authorized distributor of Century Ply, Greenply, Merino, Action Tesa, Hettich, Hafele and more premium interior material brands."
      />
    </Helmet>

    <div className="bg-[#F0EBE1] min-h-screen">
      {/* Unique Page Hero */}
      <PageHero
        label="05 / AUTHORIZED BRANDS"
        title={
          <>
            Trusted names,{' '}
            <span className="italic font-display text-[#C4892E]">verified supply</span>.
          </>
        }
        subtitle="We carry authorized inventory from India's most respected plywood, laminate, veneer, hardware and adhesive brands — all genuine, all in-stock."
        bgImage="/images/wall_cladding.png"
      />

      {/* Why Authorized strip */}
      <div className="bg-[#E8E3DA] border-b border-[#DDD8CF] px-6 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="section-label text-[#C4892E] mb-10">WHY AUTHORIZED MATTERS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_AUTHORIZED.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group flex flex-col border-t-2 border-[#DDD8CF] pt-6 transition-[border-color] duration-300 hover:border-[#C4892E]"
              >
                <span className="font-mono text-[0.65rem] tracking-[0.2em] text-[#C4892E] mb-4">
                  0{i + 1}
                </span>
                <h3 className="font-display text-[1.1rem] font-medium text-[#1A1714] group-hover:text-[#C4892E] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="mt-3 font-body text-[0.85rem] font-light text-[#5A5450] leading-[1.7]">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand grid */}
      <BrandsSection />
    </div>
  </>
);

export default BrandsPage;
