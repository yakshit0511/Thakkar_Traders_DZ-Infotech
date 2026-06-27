import { useEffect, useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUpVariant}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer rounded-none select-none bg-[#1A1A1A]"
    >
      {/* Background Image */}
      <img
        src={project.coverImageUrl}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.6s ease-out',
        }}
        loading="lazy"
      />

      {/* Dark/Gradient Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-colors duration-500"
        style={{
          background: isHovered 
            ? 'linear-gradient(to bottom, rgba(5,5,5,0.1) 0%, rgba(5,5,5,0.3) 40%, rgba(5,5,5,0.9) 100%)'
            : 'linear-gradient(to bottom, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.2) 40%, rgba(5,5,5,0.85) 100%)',
        }}
      />

      {/* Card Content at bottom left */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8 flex flex-col items-start pointer-events-none">
        {/* Title */}
        <h3
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
          className="text-[clamp(1.5rem,2.2vw,2rem)] text-[#F5F0E8] leading-tight mb-2"
        >
          {project.title}
        </h3>

        {/* Location & Year */}
        <p
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          className="text-[0.78rem] text-[#C9A84C]"
        >
          {project.location} · {project.year}
        </p>
      </div>
    </motion.div>
  );
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: gridRef, controls: gridControls } = useScrollAnimation();

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
    <section id="projects" className="bg-[#F5F1EA] py-[80px] md:py-24 lg:py-[128px] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12">
        
        {/* Heading zone */}
        <div className="flex flex-col items-start mb-16">
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

        {/* 3-Column Grid Cards Zone (Always rendered so useInView triggers correctly) */}
        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={gridControls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading
            ? DEFAULT_PROJECTS.map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-[#DED8CC] w-full aspect-[3/4]"
                />
              ))
            : displayProjects.map((project, index) => (
                <ProjectCard key={project._id || index} project={project} index={index} />
              ))
          }
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
