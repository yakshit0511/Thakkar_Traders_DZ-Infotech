import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const CATEGORIES = [
  { label: 'ALL', value: 'all' },
  { label: 'LIVING ROOM', value: 'living-room' },
  { label: 'KITCHEN', value: 'kitchen' },
  { label: 'OFFICE', value: 'office' },
  { label: 'BEDROOM', value: 'bedroom' },
  { label: 'EXTERIOR', value: 'exterior' },
  { label: 'MATERIAL CLOSEUP', value: 'material-closeup' },
];

const FALLBACK_IMAGES = [
  {
    _id: 'fallback-1',
    imageUrl: '/images/tv_unit.png',
    caption: 'Luxury Living Room with Premium Veneer Panel',
    category: 'living-room',
  },
  {
    _id: 'fallback-2',
    imageUrl: '/images/kitchen.png',
    caption: 'Modern Kitchen with Glossy Acrylic Laminates',
    category: 'kitchen',
  },
  {
    _id: 'fallback-3',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
    caption: 'Corporate Office Boardroom with Warm Oak Paneling',
    category: 'office',
  },
  {
    _id: 'fallback-4',
    imageUrl: '/images/wardrobe.png',
    caption: 'Dark Veneer Wardrobe for Master Bedroom',
    category: 'bedroom',
  },
  {
    _id: 'fallback-5',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop',
    caption: 'Premium Exterior Wooden Cladding for Modern Facade',
    category: 'exterior',
  },
  {
    _id: 'fallback-6',
    imageUrl: '/images/wood_closeup.png',
    caption: 'Exotic Teak Wood Grain Texture Closeup',
    category: 'material-closeup',
  },
  {
    _id: 'fallback-7',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&auto=format&fit=crop',
    caption: 'Living Room TV Unit with Designer Laminate Background',
    category: 'living-room',
  },
  {
    _id: 'fallback-8',
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80&auto=format&fit=crop',
    caption: 'Bespoke Oak Veneer Kitchen Island and Cabinetry',
    category: 'kitchen',
  },
  {
    _id: 'fallback-9',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80&auto=format&fit=crop',
    caption: 'Minimalist Office Desk in Solid Ash Wood',
    category: 'office',
  },
  {
    _id: 'fallback-10',
    imageUrl: '/images/wall_cladding.png',
    caption: 'Contemporary Bedroom Veneer Wall Cladding',
    category: 'bedroom',
  },
  {
    _id: 'fallback-11',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop',
    caption: 'Weather-Resistant Wooden Accents on Luxury Villa',
    category: 'exterior',
  },
  {
    _id: 'fallback-12',
    imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80&auto=format&fit=crop',
    caption: 'BWP Grade Marine Plywood Layered Edges',
    category: 'material-closeup',
  },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const GallerySection = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Fetch images from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await api.get('/gallery');
        if (response.data && response.data.success && response.data.data.length > 0) {
          setImages(response.data.data);
        } else {
          setImages(FALLBACK_IMAGES);
        }
      } catch (error) {
        console.error('Error fetching gallery images, using placeholders:', error);
        setImages(FALLBACK_IMAGES);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Filter images based on tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter((img) => img.category === activeTab));
    }
  }, [activeTab, images]);

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const navigateLightbox = useCallback(
    (direction) => {
      if (lightboxIndex === null) return;
      let newIndex = lightboxIndex + direction;
      if (newIndex < 0) {
        newIndex = filteredImages.length - 1;
      } else if (newIndex >= filteredImages.length) {
        newIndex = 0;
      }
      setLightboxIndex(newIndex);
    },
    [lightboxIndex, filteredImages]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, navigateLightbox]);

  return (
    <section
      id="gallery"
      className="relative bg-[#ECE6DC] px-6 py-[80px] sm:px-8 lg:px-12 lg:py-[128px]"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
          className="flex flex-col items-start"
        >
          <span className="section-label text-[#C89B4A]">05 / VISUAL INDEX</span>
          <h2 className="display-heading mt-5 text-[clamp(2.4rem,3.8vw,4.2rem)] font-light text-[#2F2F2F]">
            In the <span className="italic font-display text-[#C89B4A]">wild</span>.
          </h2>
        </motion.div>

        {/* Categories Tabs */}
        <div className="mt-10 overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="flex flex-nowrap gap-2.5 pb-2">
            {CATEGORIES.map((tab) => {
              const isSelected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] transition-all duration-300 border ${
                    isSelected
                      ? 'bg-[#C89B4A] text-white border-[#C89B4A]'
                      : 'bg-[#F5F1EA] text-[#6B6B6B] border-[#DED8CC] hover:bg-[#FEFCF8] hover:text-[#2F2F2F] hover:border-[#C89B4A]/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mt-10">
          {loading ? (
            /* Skeleton Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:grid-auto-rows-[280px]">
              {[...Array(6)].map((_, index) => {
                const isTall = index % 6 === 1 || index % 6 === 4;
                return (
                  <div
                    key={index}
                    className={`bg-[#F5F1EA] animate-pulse border border-[#DED8CC] ${
                      isTall
                        ? 'lg:row-span-2 lg:h-[584px]'
                        : 'lg:row-span-1 lg:h-[280px]'
                    } h-[280px] w-full`}
                  />
                );
              })}
            </div>
          ) : (
            /* Image Grid with Animations */
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:grid-auto-rows-[280px]"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => {
                  const isTall = index % 6 === 1 || index % 6 === 4;
                  return (
                    <motion.div
                      key={image._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.45 }}
                      onClick={() => openLightbox(index)}
                      className={`group relative overflow-hidden cursor-pointer select-none bg-[#FEFCF8] border border-[#DED8CC] transition-[border-color,box-shadow,transform] duration-500 hover:border-[#C89B4A]/60 hover:shadow-[0_16px_48px_rgba(200,155,74,0.14)] ${
                        isTall
                          ? 'lg:row-span-2 lg:h-[584px]'
                          : 'lg:row-span-1 lg:h-[280px]'
                      } h-[280px] w-full`}
                    >
                      {/* Image */}
                      <img
                        src={image.imageUrl}
                        alt={image.caption || 'Thakkar Traders Material'}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[600ms] will-change-transform group-hover:scale-105"
                      />

                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-[#1C1915]/78 opacity-0 transition-opacity duration-350 ease-in-out group-hover:opacity-100" />

                      {/* Gold Plus Icon */}
                      <div className="absolute right-4 top-4 text-[#C89B4A] opacity-0 transition-opacity duration-350 ease-in-out group-hover:opacity-100">
                        <Plus size={20} />
                      </div>

                      {/* Caption text */}
                      {image.caption && (
                        <div className="absolute bottom-12 left-0 right-0 px-4 text-center text-[#F2EDE3] opacity-0 translate-y-5 transition-all duration-350 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                          <p className="font-display italic text-lg m-0 text-[#F2EDE3]">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[500] flex flex-col justify-between bg-[#0D0A07]/98 py-6 px-4 md:px-8 select-none"
          >
            {/* Header bar */}
            <div className="flex justify-between items-center w-full z-10">
              <div className="font-mono text-[0.7rem] text-[#8A8A7A]">
                {lightboxIndex + 1} / {filteredImages.length}
              </div>
              <button
                onClick={closeLightbox}
                className="text-[#F2EDE3] hover:text-[#C4892E] transition-colors duration-200"
                aria-label="Close lightbox"
              >
                <X size={28} />
              </button>
            </div>

            {/* Middle row: navigation & image */}
            <div className="flex flex-1 items-center justify-between relative w-full my-4">
              {/* Left Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox(-1);
                }}
                className="text-[#F2EDE3]/60 hover:text-[#F2EDE3] transition-colors duration-200 p-2 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7 sm:h-9 sm:w-9" />
              </button>

              {/* Centered Image Container */}
              <div className="flex-1 flex justify-center items-center h-full max-h-[80vh] px-2">
                <motion.img
                  key={filteredImages[lightboxIndex]?._id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                  src={filteredImages[lightboxIndex]?.imageUrl}
                  alt={filteredImages[lightboxIndex]?.caption}
                  className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain shadow-2xl"
                />
              </div>

              {/* Right Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox(1);
                }}
                className="text-[#F2EDE3]/60 hover:text-[#F2EDE3] transition-colors duration-200 p-2 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7 sm:h-9 sm:w-9" />
              </button>
            </div>

            {/* Bottom caption */}
            <div className="w-full text-center pb-2 z-10">
              {filteredImages[lightboxIndex]?.caption && (
                <p className="font-body font-light text-[0.9rem] text-[#F2EDE3]/70 m-0">
                  {filteredImages[lightboxIndex].caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
