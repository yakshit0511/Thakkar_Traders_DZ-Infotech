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
    coverImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  },
  {
    _id: 'placeholder-2',
    title: 'Commercial Office Fitout',
    location: 'Ahmedabad, Gujarat',
    year: 2023,
    category: 'commercial',
    coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
  {
    _id: 'placeholder-3',
    title: 'Boutique Hotel Lobby',
    location: 'Mumbai, Maharashtra',
    year: 2024,
    category: 'hospitality',
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
    
    const rY = (x / rect.width) * 12;
    const rX = -(y / rect.height) * 8;

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

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,5,2,0.05) 0%, rgba(8,5,2,0.15) 40%, rgba(8,5,2,0.82) 100%)',
        }}
      />

      {!isTouch && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.06), transparent 60%)`,
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-20 transition-all duration-300"
        style={{
          boxShadow: isHovered ? 'inset 0 0 0 2px rgba(201,168,76,0.5)' : 'none',
        }}
      />

      <span
        style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}
        className="absolute top-[28px] left-[28px] z-20"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 p-8 flex flex-col items-start"
        style={{
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <span
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C9A84C', marginBottom: '10px' }}
          className="uppercase"
        >
          {project.category}
        </span>

        <h3
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.9rem', color: '#FFFFFF', lineHeight: 1.1, marginBottom: '8px' }}
        >
          {project.title}
        </h3>

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

  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  return (
    <section id="projects" className="relative overflow-hidden bg-[#F5F1EA]">
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

      <div className="relative w-full bg-[#F5F1EA]">
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-[100px]"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(245, 241, 234, 0.85) 85%)',
          }}
        />

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
      </div>
    </section>
  );
};

export default ProjectsSection;
