import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
  const galleryRef = useRef(null);
  
  // Track scroll progress to fade out the section as it leaves the top of the viewport
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start end', 'end start'],
  });
  
  // Keep opacity fully 1 until 60% scrolled out, then fade to 0
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);

  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [inquiryImage, setInquiryImage] = useState(null);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    city: '',
    projectType: '',
    materialRequired: '',
    message: '',
    selectedImageUrl: '',
    selectedImageCaption: '',
  });
  const [inquiryErrors, setInquiryErrors] = useState({ fullName: '', phoneNumber: '' });

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

  const openInquiry = (image) => {
    const caption = image.caption || 'Gallery material';
    const absoluteImageUrl = new URL(image.imageUrl, window.location.origin).toString();
    setInquiryImage(image);
    setInquiryStatus(null);
    setInquiryErrors({ fullName: '', phoneNumber: '' });
    setInquiryForm({
      fullName: '',
      phoneNumber: '',
      emailAddress: '',
      city: '',
      projectType: '',
      materialRequired: image.category ? image.category.replace(/-/g, ' ') : '',
      selectedImageUrl: absoluteImageUrl,
      selectedImageCaption: caption,
      message: `I am interested in ${caption}. Please share price, quality, brand, availability and any other details.`,
    });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const closeInquiry = useCallback(() => {
    setInquiryImage(null);
    setInquiryStatus(null);
    document.body.style.overflow = '';
  }, []);

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({ ...prev, [name]: value }));
    if (inquiryErrors[name]) {
      setInquiryErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryStatus(null);

    let hasErrors = false;
    const nextErrors = { fullName: '', phoneNumber: '' };

    if (!inquiryForm.fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
      hasErrors = true;
    }
    if (!inquiryForm.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'Phone number is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setInquiryErrors(nextErrors);
      return;
    }

    setInquirySubmitting(true);
    try {
      const response = await api.post('/inquiries', inquiryForm);
      if (response.data?.success) {
        setInquiryStatus({
          type: 'success',
          text: 'Inquiry sent successfully. We will contact you soon.',
        });
        setInquiryForm({
          fullName: '',
          phoneNumber: '',
          emailAddress: '',
          city: '',
          projectType: '',
          materialRequired: inquiryForm.materialRequired,
          selectedImageUrl: inquiryForm.selectedImageUrl,
          selectedImageCaption: inquiryForm.selectedImageCaption,
          message: inquiryForm.message,
        });
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Gallery inquiry submission error:', error);
      setInquiryStatus({
        type: 'error',
        text: 'Could not send inquiry right now. Please try again.',
      });
    } finally {
      setInquirySubmitting(false);
    }
  };

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
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) closeLightbox();
        if (inquiryImage !== null) closeInquiry();
      }
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, inquiryImage, closeLightbox, closeInquiry, navigateLightbox]);

  return (
    <motion.section
      ref={galleryRef}
      style={{ opacity: sectionOpacity }}
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
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-50px' }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120F0C]/78 via-[#120F0C]/28 to-transparent opacity-70 transition-opacity duration-350 ease-in-out group-hover:opacity-100" />

                      {/* Gold Plus Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInquiry(image);
                        }}
                        aria-label={`Send inquiry for ${image.caption || 'gallery image'}`}
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[#0D0A07]/70 text-[#FFF9F0] shadow-[0_10px_22px_rgba(0,0,0,0.22)] backdrop-blur-[4px] opacity-100 translate-y-0 pointer-events-auto transition-all duration-300 hover:border-[#C89B4A]/55 hover:bg-[#C89B4A] hover:text-white md:opacity-0 md:translate-y-1 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto"
                      >
                        <Plus size={18} />
                      </button>

                      {/* Caption text */}
                      {image.caption && (
                        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#0D0A07]/55 px-4 py-3 text-center text-[#F8F4EE] opacity-100 translate-y-0 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[4px] transition-all duration-350 ease-out md:opacity-0 md:translate-y-5 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                          <p className="font-display italic text-[0.95rem] md:text-[1.02rem] leading-snug m-0 text-[#FFF9F0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
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

      {/* Inquiry Modal */}
      <AnimatePresence>
        {inquiryImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[520] flex items-end justify-center bg-[#0D0A07]/94 px-0 py-0 sm:items-center sm:px-6 sm:py-6"
            onClick={closeInquiry}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl overflow-hidden rounded-t-[24px] border border-white/10 bg-[#FEFCF8] shadow-[0_28px_80px_rgba(0,0,0,0.45)] max-h-[calc(100dvh-16px)] sm:max-h-[92vh] sm:rounded-[28px]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#E8E1D5] bg-[#F5F1EA] px-4 py-3 sm:px-6 sm:py-4">
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.22em] text-[#C89B4A] uppercase m-0">
                    Gallery Inquiry
                  </p>
                  <h3 className="display-heading mt-1.5 text-[1.25rem] sm:mt-2 sm:text-[1.8rem] text-[#2F2F2F] m-0">
                    Ask about this material
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeInquiry}
                  className="text-[#6B6B6B] transition-colors duration-200 hover:text-[#2F2F2F]"
                  aria-label="Close inquiry form"
                >
                  <X size={26} />
                </button>
              </div>

              <div className="grid max-h-[calc(100dvh-120px)] grid-cols-1 overflow-y-auto lg:grid-cols-[38%_62%] lg:max-h-[calc(92vh-80px)]">
                <div className="border-b border-[#E8E1D5] bg-[#F5F1EA] p-3 sm:p-4 lg:border-b-0 lg:border-r lg:p-6">
                  <div className="overflow-hidden rounded-2xl border border-[#DED8CC] bg-[#FEFCF8] shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
                    <img
                      src={inquiryImage.imageUrl}
                      alt={inquiryImage.caption || 'Selected gallery material'}
                      className="h-32 w-full object-cover sm:h-44 md:h-56 lg:h-auto lg:min-h-[280px]"
                    />
                  </div>
                  <p className="font-mono mt-3 text-[0.58rem] sm:mt-4 sm:text-[0.62rem] tracking-[0.18em] text-[#8A847C] uppercase m-0">
                    Selected image
                  </p>
                  <p className="font-display mt-1.5 text-[0.95rem] sm:mt-2 sm:text-[1.1rem] italic text-[#2F2F2F] m-0 leading-snug">
                    {inquiryImage.caption || 'Gallery material'}
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="p-3 pb-6 sm:p-6 sm:pb-8">
                  <p className="font-body text-[0.85rem] sm:text-[0.95rem] text-[#6B6B6B] leading-[1.6] mb-4 sm:mb-6">
                    Share your requirement, price range, quality preference, brand choice, or any other details. We will send this inquiry to the team by email.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]" htmlFor="galleryFullName">
                        Full Name <span className="text-[#C89B4A]">*</span>
                      </label>
                      <input
                        id="galleryFullName"
                        name="fullName"
                        value={inquiryForm.fullName}
                        onChange={handleInquiryChange}
                        className={`w-full px-4 py-3 bg-[#FEFCF8] border text-[0.92rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)] ${
                          inquiryErrors.fullName
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-[#DED8CC] focus:border-[#C89B4A]'
                        }`}
                        placeholder="Your full name"
                      />
                      <AnimatePresence>
                        {inquiryErrors.fullName && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-red-500 font-body text-[0.76rem] mt-1 block"
                          >
                            {inquiryErrors.fullName}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]" htmlFor="galleryPhoneNumber">
                        Phone Number <span className="text-[#C89B4A]">*</span>
                      </label>
                      <input
                        id="galleryPhoneNumber"
                        name="phoneNumber"
                        value={inquiryForm.phoneNumber}
                        onChange={handleInquiryChange}
                        className={`w-full px-4 py-3 bg-[#FEFCF8] border text-[0.92rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)] ${
                          inquiryErrors.phoneNumber
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-[#DED8CC] focus:border-[#C89B4A]'
                        }`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                      <AnimatePresence>
                        {inquiryErrors.phoneNumber && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-red-500 font-body text-[0.76rem] mt-1 block"
                          >
                            {inquiryErrors.phoneNumber}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]" htmlFor="galleryEmailAddress">
                        Email Address
                      </label>
                      <input
                        id="galleryEmailAddress"
                        name="emailAddress"
                        type="email"
                        value={inquiryForm.emailAddress}
                        onChange={handleInquiryChange}
                        className="w-full px-4 py-3 bg-[#FEFCF8] border border-[#DED8CC] text-[0.92rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:border-[#C89B4A] focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)]"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]" htmlFor="galleryCity">
                        City
                      </label>
                      <input
                        id="galleryCity"
                        name="city"
                        value={inquiryForm.city}
                        onChange={handleInquiryChange}
                        className="w-full px-4 py-3 bg-[#FEFCF8] border border-[#DED8CC] text-[0.92rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:border-[#C89B4A] focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)]"
                        placeholder="Surat, Ahmedabad, Mumbai..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]" htmlFor="galleryProjectType">
                        Material / Brand Needed
                      </label>
                      <input
                        id="galleryProjectType"
                        name="projectType"
                        value={inquiryForm.projectType}
                        onChange={handleInquiryChange}
                        className="w-full px-4 py-3 bg-[#FEFCF8] border border-[#DED8CC] text-[0.92rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:border-[#C89B4A] focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)]"
                        placeholder="Price, quality, brand, laminate, plywood, veneer..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]" htmlFor="galleryMaterialRequired">
                        Notes / Requirement
                      </label>
                      <textarea
                        id="galleryMaterialRequired"
                        name="message"
                        value={inquiryForm.message}
                        onChange={handleInquiryChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#FEFCF8] border border-[#DED8CC] text-[0.92rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:border-[#C89B4A] focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)] resize-y min-h-[110px] sm:min-h-[140px]"
                        placeholder="Tell us exactly what you need..."
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 pb-2 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-0">
                    <p className="font-body text-[0.74rem] sm:text-[0.82rem] text-[#7A7468] m-0 leading-[1.4]">
                      Your inquiry will be emailed to the team after submission.
                    </p>
                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="inline-flex w-full items-center justify-center bg-[#C89B4A] px-6 py-3.5 text-[0.76rem] font-body font-medium tracking-[0.16em] text-white uppercase transition-all duration-300 hover:bg-[#A8732A] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#9A9A8C]/50 sm:w-auto sm:px-8 sm:py-4"
                    >
                      {inquirySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Inquiry'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {inquiryStatus && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`mt-4 mb-0 font-body text-[0.9rem] ${
                          inquiryStatus.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {inquiryStatus.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default GallerySection;
