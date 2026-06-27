import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
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
    imageUrl: '/images/kitchen_1.png',
    caption: 'Modern Matte Charcoal Kitchen Cabinets',
    category: 'kitchen',
  },
  {
    _id: 'fallback-3',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
    caption: 'Minimalist Office Boardroom Table and Veneer Walls',
    category: 'office',
  },
  {
    _id: 'fallback-4',
    imageUrl: '/images/wardrobe.png',
    caption: 'Acrylic Textured Wardrobe Shutters in Master Bedroom',
    category: 'bedroom',
  },
  {
    _id: 'fallback-5',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop',
    caption: 'Villa Cladding with Weatherproof High-Pressure Laminates',
    category: 'exterior',
  },
  {
    _id: 'fallback-6',
    imageUrl: '/images/closeup_veneer.png',
    caption: 'Flitch-Matched Natural Teak Wood Veneer Close-Up',
    category: 'material-closeup',
  },
  {
    _id: 'fallback-7',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&auto=format&fit=crop',
    caption: 'Warm Cream Fluted Louver TV Backdrop in Bedroom',
    category: 'bedroom',
  },
  {
    _id: 'fallback-8',
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80&auto=format&fit=crop',
    caption: 'Open Layout Kitchen with Integrated Solid Surface Countertops',
    category: 'kitchen',
  },
  {
    _id: 'fallback-9',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80&auto=format&fit=crop',
    caption: 'Corporate Workspace featuring Sound-Absorbing Wood Slat Panels',
    category: 'office',
  },
  {
    _id: 'fallback-10',
    imageUrl: '/images/charcoal_louvers.png',
    caption: 'Abstract Fluted Charcoal Wall Panels with Gold Highlights',
    category: 'material-closeup',
  },
  {
    _id: 'fallback-11',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop',
    caption: 'Double Height Lobby Clad with Architectural Walnut Veneers',
    category: 'living-room',
  },
  {
    _id: 'fallback-12',
    imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80&auto=format&fit=crop',
    caption: 'Exterior Gate detailing using Rust-Proof Decorative Laminates',
    category: 'exterior',
  },
];

const GalleryItem = ({ image, index, total, openLightbox, openInquiry }) => {
  const itemRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(hover: none) or (max-width: 768px)').matches);
  }, []);

  const isInView = useInView(itemRef, { threshold: 0.15, once: true });

  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ['start end', 'end start'],
  });

  // Fade out as it scrolls out of the top of the viewport
  const itemOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <motion.div
      ref={itemRef}
      style={{ opacity: itemOpacity }}
      className="relative w-full h-screen overflow-hidden bg-black select-none"
    >
      {/* Background Image with parallax */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 w-full h-[120%] pointer-events-none"
      >
        <motion.img
          src={image.imageUrl}
          alt={image.caption || 'Gallery Material'}
          initial={{ scale: isMobile ? 1.05 : 1.1, opacity: 0 }}
          animate={isInView ? { scale: 1.0, opacity: 1 } : { scale: isMobile ? 1.05 : 1.1, opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#080502]/40 z-10 pointer-events-none" />

      {/* Info Overlay (Index, Caption, Actions) */}
      <div className="absolute inset-0 z-20">
        
        {/* Top row: positioned absolutely to sit high up in the viewport */}
        <div className="absolute top-[80px] md:top-[90px] lg:top-[96px] left-6 right-6 md:left-12 md:right-12 lg:left-16 lg:right-16 flex justify-between items-center z-30">
          <div className="flex flex-col items-start gap-1">
            <span 
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}
            >
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <span 
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.18em', color: '#C9A84C' }}
              className="uppercase font-medium"
            >
              {image.category?.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => openLightbox(index)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.12em' }}
              className="text-[#F5F0E8] hover:text-[#C9A84C] transition-colors border-b border-white/20 hover:border-[#C9A84C] pb-1 uppercase focus:outline-none"
            >
              VIEW FULLSCREEN
            </button>
            
            <button
              onClick={() => openInquiry(image)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.12em' }}
              className="bg-[#C9A84C] hover:bg-[#A8732A] text-white px-5 py-2 transition-all uppercase flex items-center gap-2 focus:outline-none"
            >
              <Plus size={14} />
              <span>INQUIRE</span>
            </button>
          </div>
        </div>

        {/* Center: Caption */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 pointer-events-none">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 0.95, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-[clamp(1.8rem,4vw,3.8rem)] font-light text-[#F5F0E8] leading-tight"
          >
            {image.caption}
          </motion.h3>
        </div>

      </div>
    </motion.div>
  );
};

const GallerySection = () => {
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

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const openInquiry = (image) => {
    setInquiryImage(image);
    setInquiryForm({
      fullName: '',
      phoneNumber: '',
      emailAddress: '',
      city: '',
      projectType: image.category?.toUpperCase() || '',
      materialRequired: image.caption || '',
      message: `I'm interested in learning more about this material: "${image.caption || 'Gallery Image'}". Please provide specifications and price details.`,
      selectedImageUrl: image.imageUrl,
      selectedImageCaption: image.caption || '',
    });
    setInquiryErrors({ fullName: '', phoneNumber: '' });
    setInquiryStatus(null);
  };

  const closeInquiry = () => setInquiryImage(null);

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'fullName' || name === 'phoneNumber') {
      setInquiryErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    let hasErrors = false;
    const errors = { fullName: '', phoneNumber: '' };

    if (!inquiryForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
      hasErrors = true;
    }
    if (!inquiryForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setInquiryErrors(errors);
      return;
    }

    setInquirySubmitting(true);
    setInquiryStatus(null);

    try {
      const response = await api.post('/inquiries', {
        ...inquiryForm,
        fullName: inquiryForm.fullName,
        phoneNumber: inquiryForm.phoneNumber,
        email: inquiryForm.emailAddress,
        city: inquiryForm.city,
        notes: inquiryForm.message,
      });

      if (response.data && response.data.success) {
        setInquiryStatus({
          type: 'success',
          text: 'Thank you! Your inquiry has been sent successfully. We will contact you soon.',
        });
        setTimeout(() => {
          closeInquiry();
        }, 3000);
      } else {
        setInquiryStatus({
          type: 'error',
          text: response.data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setInquiryStatus({
        type: 'error',
        text: 'Failed to send inquiry. Please check your connection and try again.',
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, navigateLightbox]);

  return (
    <div id="gallery" className="relative w-full bg-[#ECE6DC]">
      
      {/* Header (scrollable/natural) */}
      <div className="bg-[#ECE6DC] px-6 py-[80px] sm:px-8 lg:px-12 lg:py-[108px] border-b border-[#DED8CC]">
        <div className="mx-auto max-w-[1400px]">
          <span className="section-label text-[#C89B4A]">06 / VISUAL INDEX</span>
          <h2 className="display-heading mt-5 text-[clamp(2.4rem,3.8vw,4.2rem)] font-light text-[#2F2F2F]">
            In the <span className="italic font-display text-[#C89B4A]">wild</span>.
          </h2>
        </div>
      </div>

      {/* Sticky Categories Bar */}
      <div className="sticky top-[68px] lg:top-[76px] w-full z-40 bg-[#ECE6DC]/85 backdrop-blur-[12px] border-b border-[#DED8CC] px-6 py-4 md:px-8 lg:px-12 flex justify-center">
        <div className="overflow-x-auto scrollbar-hide no-scrollbar max-w-[1400px] w-full">
          <div className="flex flex-row gap-2.5 justify-center md:justify-start lg:justify-center">
            {CATEGORIES.map((tab) => {
              const isSelected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`shrink-0 rounded-full px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] transition-all duration-300 border ${
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
      </div>

      {/* Vertical Stack of Scroll Reveal Items */}
      <div className="w-full">
        {loading ? (
          <div className="w-full h-screen flex items-center justify-center bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-[#C89B4A]" />
          </div>
        ) : (
          filteredImages.map((image, index) => (
            <GalleryItem
              key={image._id || index}
              image={image}
              index={index}
              total={filteredImages.length}
              openLightbox={openLightbox}
              openInquiry={openInquiry}
            />
          ))
        )}
      </div>

      {/* Lightbox Modal rendered via Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeLightbox}
              className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/96 py-6 px-4 md:px-8 select-none cursor-pointer"
            >
              {/* Header bar */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex justify-between items-center w-full z-10 cursor-default"
              >
                <div className="font-mono text-[0.7rem] text-[#8A8A7A]">
                  {lightboxIndex + 1} / {filteredImages.length}
                </div>
                <button
                  onClick={closeLightbox}
                  className="text-white bg-black/50 hover:bg-black hover:text-[#C89B4A] rounded-full p-2.5 transition-colors duration-200 focus:outline-none cursor-pointer"
                  aria-label="Close lightbox"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Middle row: navigation & image */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex flex-1 items-center justify-between relative w-full my-4 cursor-default"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(-1);
                  }}
                  className="text-[#F2EDE3]/60 hover:text-[#F2EDE3] transition-colors duration-200 p-2 z-10 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-7 w-7 sm:h-9 sm:w-9" />
                </button>

                <div 
                  onClick={closeLightbox} 
                  className="flex-1 flex justify-center items-center h-full max-h-[80vh] px-2 cursor-pointer"
                >
                  <motion.img
                    key={filteredImages[lightboxIndex]?._id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.3 }}
                    src={filteredImages[lightboxIndex]?.imageUrl}
                    alt={filteredImages[lightboxIndex]?.caption}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain shadow-2xl cursor-default"
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(1);
                  }}
                  className="text-[#F2EDE3]/60 hover:text-[#F2EDE3] transition-colors duration-200 p-2 z-10 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-7 w-7 sm:h-9 sm:w-9" />
                </button>
              </div>

              {/* Bottom caption */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full text-center pb-2 z-10 cursor-default"
              >
                {filteredImages[lightboxIndex]?.caption && (
                  <p className="font-body font-light text-[0.9rem] text-[#F2EDE3]/70 m-0">
                    {filteredImages[lightboxIndex].caption}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Inquiry Modal rendered via Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {inquiryImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[9999] flex items-end justify-center bg-[#0D0A07]/94 px-0 py-0 sm:items-center sm:px-6 sm:py-6"
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
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};

export default GallerySection;
