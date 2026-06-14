import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
  fadeUpVariant,
  staggerContainerVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const PLACEHOLDER_GALLERY = [
  {
    _id: 'g1',
    imageUrl:
      'https://images.unsplash.com/photo-1618221198740-0a7c0643a088?w=600&q=80&auto=format&fit=crop',
    caption: 'Premium wood panel interior',
    category: 'living-room',
  },
  {
    _id: 'g2',
    imageUrl:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop',
    caption: 'Designer laminate kitchen',
    category: 'kitchen',
  },
  {
    _id: 'g3',
    imageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&auto=format&fit=crop',
    caption: 'Commercial office fitout',
    category: 'office',
  },
  {
    _id: 'g4',
    imageUrl:
      'https://images.unsplash.com/photo-1615874952213-4839332910a0?w=600&q=80&auto=format&fit=crop',
    caption: 'Veneer and laminate samples',
    category: 'material-closeup',
  },
  {
    _id: 'g5',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format&fit=crop',
    caption: 'Luxury residential finish',
    category: 'bedroom',
  },
  {
    _id: 'g6',
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format&fit=crop',
    caption: 'Architectural exterior cladding',
    category: 'exterior',
  },
];

const GallerySection = () => {
  const [images, setImages] = useState(PLACEHOLDER_GALLERY);
  const [loading, setLoading] = useState(true);
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: gridRef, controls: gridControls } = useScrollAnimation();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data } = await api.get('/gallery');
        if (data.success && data.data?.length > 0) {
          setImages(data.data.slice(0, 6));
        }
      } catch {
        /* use placeholders */
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <section id="gallery" className="bg-[#0A0F1E] px-6 py-[60px] md:px-8 md:py-20 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerControls}
          variants={fadeUpVariant}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="section-label">06 / GALLERY</p>
            <h2 className="display-heading mt-4 text-[clamp(2rem,3.5vw,3.5rem)] leading-[1.1] text-[#F5F0E8]">
              Materials in
              <br />
              <span className="font-display italic">real spaces</span>.
            </h2>
          </div>
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.15em] text-[#8A8A7A] no-underline transition-colors duration-300 hover:text-[#C9A84C]"
          >
            VIEW FULL GALLERY
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={gridControls}
          variants={staggerContainerVariant}
          className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse bg-[#12192B]" />
              ))
            : images.map((image) => (
                <motion.figure
                  key={image._id}
                  variants={fadeUpVariant}
                  className="group relative aspect-[4/3] overflow-hidden bg-[#12192B]"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption || 'Gallery image'}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,30,0.85)] via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                  <figcaption className="absolute bottom-0 left-0 right-0 translate-y-2 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#C9A84C]">
                      {image.category?.replace('-', ' ')}
                    </p>
                    <p className="mt-1 font-body text-[0.85rem] text-[#F5F0E8]">
                      {image.caption}
                    </p>
                  </figcaption>
                </motion.figure>
              ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;
