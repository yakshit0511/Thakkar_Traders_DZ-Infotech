import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import ProductsSection from '../../components/public/ProductsSection';

const CATEGORIES = [
  { label: 'Veneers', description: 'Natural & reconstituted wood veneers for feature walls and bespoke furniture' },
  { label: 'Plywood', description: 'BWP / BWR marine grade for structural and moisture-prone applications' },
  { label: 'Laminates', description: 'Acrylic, matte, high-gloss, and charcoal designer surfaces' },
  { label: 'MDF & HDHMR', description: 'High-density boards for modular furniture and cabinetry' },
  { label: 'Flush Doors', description: 'Factory-finished skin and solid-core doors for all projects' },
  { label: 'Hardware', description: 'Hinges, channels, handles and adhesives from trusted brands' },
];

const ProductsPage = () => (
  <>
    <Helmet>
      <title>Products | Thakkar Traders — Premium Interior Materials</title>
      <meta
        name="description"
        content="Browse our curated catalogue of premium plywood, laminates, veneers, MDF, HDHMR, flush doors, and hardware from India's leading brands."
      />
    </Helmet>

    <div className="bg-[#F5F1EA] min-h-screen">
      {/* Page Hero */}
      <PageHero
        label="02 / COLLECTION"
        title={
          <>
            Curated Material{' '}
            <span className="italic font-display text-[#C89B4A]">Catalogue</span>
          </>
        }
        subtitle="Authorized stock of India's most trusted plywood, laminate, veneer, MDF, hardware and door brands — specification-ready for every project type."
        bgImage="/images/wood_closeup.png"
        accent={
          <Link
            to="/#quote"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/#quote';
            }}
            className="inline-flex items-center gap-2 border border-[#C89B4A]/60 px-6 py-2.5 font-mono text-[0.7rem] tracking-[0.14em] text-[#C89B4A] no-underline transition-all duration-300 hover:bg-[#C89B4A] hover:text-white"
          >
            REQUEST QUOTE →
          </Link>
        }
      />

      {/* Category Overview */}
      <div className="bg-[#ECE6DC] border-b border-[#DED8CC] px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="section-label text-[#C89B4A] mb-10">PRODUCT CATEGORIES</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="group bg-[#FEFCF8] border border-[#DED8CC] px-5 py-8 flex flex-col gap-3 cursor-default transition-all duration-300 hover:bg-[#F5F1EA] hover:border-[#C89B4A]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(200,155,74,0.1)]"
              >
                <div className="w-6 h-px bg-[#C89B4A] transition-all duration-300 group-hover:w-10" />
                <h3 className="font-display text-[1.05rem] font-medium text-[#2F2F2F] group-hover:text-[#C89B4A] transition-colors duration-300 leading-tight">
                  {cat.label}
                </h3>
                <p className="font-body text-[0.78rem] font-light text-[#6B6B6B] leading-[1.65]">
                  {cat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main products grid */}
      <ProductsSection />

      {/* CTA strip */}
      <div className="bg-[#ECE6DC] border-t border-[#DED8CC] px-6 py-20 sm:px-8 lg:px-12 text-center">
        <p className="font-display italic text-[clamp(1.6rem,2.8vw,2.6rem)] text-[#2F2F2F]">
          Can&apos;t find what you need?
        </p>
        <p className="mt-3 font-body text-[0.92rem] text-[#6B6B6B]">
          We source special-order materials on request. Tell us what you need.
        </p>
        <a
          href="/#quote"
          onClick={(e) => { e.preventDefault(); window.location.href = '/#quote'; }}
          className="mt-8 inline-flex items-center justify-center bg-[#C89B4A] text-white px-12 py-4 font-body text-[0.78rem] font-medium tracking-[0.14em] uppercase no-underline transition-all duration-300 hover:bg-[#A8732A] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,155,74,0.28)]"
        >
          SEND ENQUIRY
        </a>
      </div>
    </div>
  </>
);

export default ProductsPage;
