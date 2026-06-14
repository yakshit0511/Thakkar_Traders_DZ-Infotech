import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import GallerySection from '../../components/public/GallerySection';

const GALLERY_TIPS = [
  { icon: '🔍', text: 'Click any image to open the full-screen lightbox viewer' },
  { icon: '⌨️', text: 'Use arrow keys to navigate images in lightbox mode' },
  { icon: '🏷️', text: 'Filter by room or material type using the category tabs' },
];

const GalleryPage = () => (
  <>
    <Helmet>
      <title>Gallery | Thakkar Traders — Material Showcase</title>
      <meta
        name="description"
        content="Visual showcase of premium interiors using Thakkar Traders materials — kitchens, living rooms, bedrooms, offices and material closeups."
      />
    </Helmet>

    <div className="bg-[#F0EBE1] min-h-screen">
      {/* Unique Page Hero */}
      <PageHero
        label="05 / VISUAL INDEX"
        title={
          <>
            Materials{' '}
            <span className="italic font-display text-[#C4892E]">in the wild</span>.
          </>
        }
        subtitle="A curated visual collection of interiors featuring our plywood, veneers, laminates and hardware — from luxury residences to hospitality spaces."
        bgImage="/images/kitchen.png"
        accent={
          <div className="flex flex-wrap gap-6">
            {GALLERY_TIPS.map((tip) => (
              <div key={tip.text} className="flex items-center gap-2">
                <span className="text-lg leading-none">{tip.icon}</span>
                <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[#8A847C]">
                  {tip.text}
                </span>
              </div>
            ))}
          </div>
        }
      />

      {/* Decorative count bar */}
      <div className="bg-[#E8E3DA] border-b border-[#DDD8CF] px-6 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.p
            className="font-mono text-[0.65rem] tracking-[0.18em] text-[#5A5450] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Browsing — All Categories
          </motion.p>
          <div className="flex gap-6 items-center">
            <div className="h-px w-12 bg-[#C4892E]/40" />
            <span className="font-mono text-[0.62rem] tracking-[0.14em] text-[#C4892E] uppercase">
              12 images available
            </span>
          </div>
        </div>
      </div>

      {/* Gallery with filters and lightbox */}
      <GallerySection />
    </div>
  </>
);

export default GalleryPage;
