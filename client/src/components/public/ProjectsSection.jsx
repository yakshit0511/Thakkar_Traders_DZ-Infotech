import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { fadeUpVariant, useScrollAnimation } from '../../hooks/useScrollAnimation';

const DEFAULT_PROJECTS = [
  {
    _id: 'placeholder-1',
    title: 'The Obsidian Villa',
    location: 'Ahmedabad, Gujarat',
    year: 2023,
    category: 'Veneer & Plywood Solutions',
    coverImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  },
  {
    _id: 'placeholder-2',
    title: 'Sakai Zen Lounge',
    location: 'Surat, Gujarat',
    year: 2024,
    category: 'Laminate & Board Fabrication',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
  {
    _id: 'placeholder-3',
    title: 'Atelier Residence',
    location: 'Vadodara, Gujarat',
    year: 2024,
    category: 'Doors & Premium Hardware',
    coverImageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  },
];

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isTouch) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Divide X offset by card width and multiply by 12 to get rotateY degrees
    const rY = (x / rect.width) * 12;
    // Divide Y offset by card height and multiply by 8 to get rotateX degrees
    const rX = -(y / rect.height) * 8; // Inverted Y-axis rotate standard for natural tilt direction

    setTilt({ rotateX: rX, rotateY: rY });
    setShine({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [isTouch]);

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-screen h-[420px] md:w-[380px] md:h-[520px] lg:w-[480px] lg:h-[620px] overflow-hidden cursor-pointer rounded-none select-none"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: isHovered ? 'transform 0.1s linear' : 'transform 0.5s ease-out',
      }}
    >
      {/* Background Image */}
      <img
        src={project.coverImageUrl || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.6s ease-out',
        }}
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,5,2,0.05) 0%, rgba(8,5,2,0.15) 40%, rgba(8,5,2,0.82) 100%)',
        }}
      />

      {/* Specular Shine Overlay */}
      {!isTouch && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.06), transparent 60%)`,
          }}
        />
      )}

      {/* Gold Inner Border on Hover */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-all duration-300"
        style={{
          boxShadow: isHovered ? 'inset 0 0 0 2px rgba(201,168,76,0.5)' : 'none',
        }}
      />

      {/* Project Number */}
      <span
        style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}
        className="absolute top-[28px] left-[28px] z-20"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Card Content at bottom left */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 p-8 flex flex-col items-start"
        style={{
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Category */}
        <span
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C9A84C', marginBottom: '10px' }}
          className="uppercase"
        >
          {project.category}
        </span>

        {/* Title */}
        <h3
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.9rem', color: '#FFFFFF', lineHeight: 1.1, marginBottom: '8px' }}
        >
          {project.title}
        </h3>

        {/* Location & Year */}
        <p
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}
        >
          {project.location} · {project.year}
        </p>
      </div>
    </div>
  );
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: cardsRef, controls: cardsControls } = useScrollAnimation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        if (data.success && data.data?.length > 0) {
          const dbProjects = data.data;
          // Pad with defaults to reach exactly 3 projects if there are less in DB
          if (dbProjects.length < 3) {
            setProjects([...dbProjects, ...DEFAULT_PROJECTS.slice(dbProjects.length)]);
          } else {
            setProjects(dbProjects.slice(0, 3));
          }
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

  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  return (
    <section id="projects" className="relative overflow-hidden bg-[#F5F1EA]">
      {/* CSS Styles to hide scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes scroll-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1.0; }
        }
        .pulse-gently {
          animation: scroll-pulse 2s infinite ease-in-out;
        }
      `}} />

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

          {/* Desktop Scroll Hint */}
          <div className="hidden lg:block pb-2">
            <span
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: '#8C867A' }}
              className="pulse-gently"
            >
              SCROLL →
            </span>
          </div>
        </div>
      </div>

      {/* Cards zone with Horizontal Scroll */}
      <div className="relative w-full bg-[#F5F1EA]">
        {/* Right-side fade mask */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-[100px]"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(245, 241, 234, 0.85) 85%)',
          }}
        />

        {/* cardsRef is attached to this wrapper which is ALWAYS rendered */}
        <motion.div
          ref={cardsRef}
          initial="hidden"
          animate={cardsControls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          <div
            ref={scrollRef}
            className="no-scrollbar flex flex-row flex-nowrap align-items-stretch overflow-x-auto overflow-y-hidden w-full"
          >
            {loading ? (
              <div className="flex flex-row flex-nowrap">
                {DEFAULT_PROJECTS.map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-[#DED8CC] w-screen h-[420px] md:w-[380px] md:h-[520px] lg:w-[480px] lg:h-[620px]"
                  />
                ))}
              </div>
            ) : (
              displayProjects.map((project, index) => (
                <ProjectCard key={project._id || index} project={project} index={index} />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
