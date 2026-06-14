import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { fadeUpVariant, useScrollAnimation } from '../../hooks/useScrollAnimation';

const DEFAULT_PROJECTS = [
  {
    _id: 'placeholder-1',
    title: 'Luxury Residential Bungalow',
    location: 'Surat, Gujarat',
    year: 2024,
    category: 'residential',
    coverImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'placeholder-2',
    title: 'Commercial Office Fitout',
    location: 'Ahmedabad, Gujarat',
    year: 2023,
    category: 'commercial',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'placeholder-3',
    title: 'Boutique Hotel Lobby',
    location: 'Mumbai, Maharashtra',
    year: 2024,
    category: 'hospitality',
    coverImageUrl: '/images/wall_cladding.png',
  },
];

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTransform({
      rotateY: ((x - centerX) / centerX) * 6,
      rotateX: ((centerY - y) / centerY) * 4,
    });
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <motion.article
      ref={cardRef}
      variants={fadeUpVariant}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="project-card relative shrink-0 overflow-hidden lg:h-[640px] lg:w-[500px] max-lg:h-[440px] max-lg:w-full"
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <img
        src={project.coverImageUrl}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
        style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 45%, rgba(20,16,10,0.92) 100%)',
        }}
      />

      {/* Shine overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
        }}
      />

      {/* Gold border on hover */}
      <div
        className="pointer-events-none absolute inset-0 border-2 transition-[border-color] duration-400"
        style={{ borderColor: isHovered ? 'rgba(200,155,74,0.65)' : 'transparent' }}
      />

      {/* Index */}
      <span className="absolute left-0 top-0 z-10 p-7 font-mono text-[0.62rem] text-white/40">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Content */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-7 transition-transform duration-350"
        style={{ transform: isHovered ? 'translateY(-6px)' : 'translateY(0)' }}
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#C89B4A]">
          {project.category}
        </p>
        <h3 className="mt-2 font-display text-[1.9rem] font-normal text-white leading-tight">
          {project.title}
        </h3>
        <p className="mt-2 font-body text-[0.82rem] font-light text-white/55">
          {project.location} · {project.year}
        </p>
      </div>
    </motion.article>
  );
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef(null);
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: cardsRef, controls: cardsControls } = useScrollAnimation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        if (data.success && data.data?.length > 0) setProjects(data.data);
        else setProjects(DEFAULT_PROJECTS);
      } catch {
        setProjects(DEFAULT_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollLeft > 100) setShowScrollHint(false);
  };

  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  return (
    <section id="projects" className="overflow-hidden">
      {/* Heading zone */}
      <div className="bg-[#F5F1EA] px-6 py-[80px] md:px-8 lg:px-12 lg:py-[108px]">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between">
          <motion.div
            ref={headerRef}
            initial="hidden"
            animate={headerControls}
            variants={fadeUpVariant}
          >
            <p className="section-label text-[#C89B4A]">04 / PORTFOLIO</p>
            <h2 className="display-heading mt-4 text-[clamp(2.2rem,3.8vw,4.2rem)] leading-[1.08] text-[#2F2F2F]">
              Where our materials{' '}
              <span className="font-display italic text-[#C89B4A]">live</span>.
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Cards zone */}
      <div className="relative bg-[#F5F1EA]">
        <motion.div
          ref={cardsRef}
          initial="hidden"
          animate={cardsControls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
          className="projects-scroll relative"
        >
          {/* Edge fade masks */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-20 bg-gradient-to-r from-[#F5F1EA] to-transparent lg:block" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-20 bg-gradient-to-l from-[#F5F1EA] to-transparent lg:block" />

          {/* Scroll hint */}
          {showScrollHint && (
            <motion.span
              className="absolute right-10 top-1/2 z-20 hidden -translate-y-1/2 font-mono text-[0.64rem] text-[#C89B4A] lg:block"
              animate={{ x: [0, 9, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              →
            </motion.span>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="projects-scroll-inner flex flex-col gap-4 px-6 py-6 md:px-8 lg:flex-row lg:gap-6 lg:overflow-x-auto lg:px-12 lg:py-8 lg:pb-14"
          >
            {loading
              ? DEFAULT_PROJECTS.map((_, i) => (
                <div key={i} className="animate-pulse bg-[#DED8CC] lg:h-[640px] lg:w-[500px] max-lg:h-[440px] max-lg:w-full" />
              ))
              : displayProjects.map((project, index) => (
                <ProjectCard key={project._id || index} project={project} index={index} />
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
