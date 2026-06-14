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
    coverImageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'placeholder-2',
    title: 'Commercial Office Fitout',
    location: 'Ahmedabad, Gujarat',
    year: 2023,
    category: 'commercial',
    coverImageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'placeholder-3',
    title: 'Boutique Hotel Lobby',
    location: 'Mumbai, Maharashtra',
    year: 2024,
    category: 'hospitality',
    coverImageUrl:
      'https://images.unsplash.com/photo-1618221198740-0a7c0643a088?w=800&q=80&auto=format&fit=crop',
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

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 5;

    setTransform({ rotateX, rotateY });
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
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
      className="project-card relative shrink-0 overflow-hidden lg:h-[620px] lg:w-[480px] max-lg:h-[420px] max-lg:w-full"
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <img
        src={project.coverImageUrl}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(10,15,30,0.9) 100%)',
        }}
      />

      {/* Shine overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.08) 0%, transparent 55%)`,
        }}
      />

      {/* Gold border on hover */}
      <div
        className="pointer-events-none absolute inset-0 border-2 border-transparent transition-[border-color] duration-300"
        style={{
          borderColor: isHovered ? 'rgba(201,168,76,0.6)' : 'transparent',
        }}
      />

      <span className="absolute left-0 top-0 z-10 p-7 font-mono text-[0.65rem] text-white/50">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-7 transition-transform duration-300"
        style={{ transform: isHovered ? 'translateY(-4px)' : 'translateY(0)' }}
      >
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#C9A84C]">
          {project.category}
        </p>
        <h3 className="mt-2 font-display text-[1.8rem] font-normal text-white">
          {project.title}
        </h3>
        <p className="mt-2 font-body text-[0.8rem] font-light text-white/60">
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
        if (data.success && data.data?.length > 0) {
          setProjects(data.data);
        } else {
          setProjects(DEFAULT_PROJECTS);
        }
      } catch {
        setProjects(DEFAULT_PROJECTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollLeft > 100) {
      setShowScrollHint(false);
    }
  };

  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  return (
    <section id="projects" className="overflow-hidden">
      {/* Heading zone — cream background */}
      <div className="bg-[#F7F4EE] px-6 py-[72px] md:px-8 lg:px-12 lg:py-[100px]">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between">
          <motion.div
            ref={headerRef}
            initial="hidden"
            animate={headerControls}
            variants={fadeUpVariant}
          >
            <p className="section-label text-[#C9A84C]">04 / PORTFOLIO</p>
            <h2 className="display-heading mt-4 text-[clamp(2rem,3.5vw,3.8rem)] leading-[1.1] text-[#1C1C1C]">
              Where our materials{' '}
              <span className="font-display italic">live</span>.
            </h2>
          </motion.div>

          <span className="hidden font-mono text-[0.65rem] tracking-[0.15em] text-[#8A8A7A] lg:block">
            SCROLL →
          </span>
        </div>
      </div>

      {/* Cards zone */}
      <div className="relative bg-[#0A0F1E]">
        <motion.div
          ref={cardsRef}
          initial="hidden"
          animate={cardsControls}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.1 },
            },
          }}
          className="projects-scroll relative"
        >
          {/* Edge fade masks — desktop only */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-16 bg-gradient-to-r from-[#0A0F1E] to-transparent lg:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-16 bg-gradient-to-l from-[#0A0F1E] to-transparent lg:block"
            aria-hidden="true"
          />

          {/* Scroll hint arrow */}
          {showScrollHint && (
            <motion.span
              className="absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 font-mono text-[0.65rem] text-[#C9A84C] lg:block"
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              →
            </motion.span>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="projects-scroll-inner flex flex-col gap-4 px-6 py-6 md:px-8 lg:flex-row lg:gap-6 lg:overflow-x-auto lg:px-12 lg:py-8 lg:pb-12"
          >
            {loading
              ? DEFAULT_PROJECTS.map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-[#12192B] lg:h-[620px] lg:w-[480px] max-lg:h-[420px] max-lg:w-full"
                  />
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
