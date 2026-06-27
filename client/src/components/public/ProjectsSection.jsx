import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import api from '../../utils/api';

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

const ProjectsSection = () => {
  const containerRef = useRef(null);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // useScroll linked to the parent wrapper container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Translate track from 0% to -75% of its width (4 panels total = Title + 3 Cards)
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        if (data.success && data.data?.length > 0) {
          const dbProjects = data.data;
          // Maintain exactly 3 projects by slicing or padding
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

  // Update active slide index for display based on scroll progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      let index = Math.floor(latest * 4);
      if (index > 3) index = 3;
      if (index < 0) index = 0;
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  return (
    <div id="projects" ref={containerRef} className="relative w-full" style={{ height: '400vh' }}>
      
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#F5F1EA] flex items-center select-none">
        
        {/* Horizontal Scroll Track */}
        <motion.div
          style={{ x }}
          className="flex w-[400vw] h-full"
        >
          {/* Panel 0: Title Slide */}
          <div className="w-screen h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#F5F1EA] relative">
            <span 
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.22em', color: '#C89B4A' }}
              className="uppercase"
            >
              04 / PORTFOLIO
            </span>
            <h2 
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-light leading-[1.08] text-[#2F2F2F] mt-6 max-w-4xl"
            >
              Where our materials <br />
              <span className="italic text-[#C89B4A]">live</span>.
            </h2>
            <p 
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-[#6B6B6B] font-light text-[1rem] leading-[1.8] mt-6 max-w-lg"
            >
              Take a walk through spaces created with our premium selections of plywood, veneers, laminates, and custom joinery boards.
            </p>
            <div 
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: '#8C867A' }}
              className="mt-12 flex items-center gap-3 animate-pulse"
            >
              <span>SCROLL DOWN TO EXPLORE</span>
              <span>→</span>
            </div>
          </div>

          {/* Panels 1-3: Project Cards */}
          {displayProjects.map((project, idx) => (
            <div key={project._id || idx} className="w-screen h-full relative overflow-hidden bg-[#1A1A1A] flex-shrink-0">
              
              {/* Background Image */}
              <img
                src={project.coverImageUrl}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: 'linear-gradient(to bottom, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.2) 40%, rgba(5,5,5,0.85) 100%)',
                }}
              />

              {/* Slide Counter inside Card */}
              <div 
                className="absolute top-[100px] left-[28px] md:left-[56px] z-20"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}
              >
                {String(idx + 1).padStart(2, '0')} / 03
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-[80px] left-[28px] md:left-[56px] z-20 max-w-3xl">
                <span 
                  style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C9A84C' }}
                  className="uppercase font-medium"
                >
                  {project.category}
                </span>
                <h3 
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-[clamp(2rem,4.5vw,4.5rem)] font-light text-[#F5F0E8] leading-tight mt-3"
                >
                  {project.title}
                </h3>
                <p 
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-[0.95rem] text-[#9CA3AF] font-light mt-3"
                >
                  {project.location} · {project.year}
                </p>
              </div>

            </div>
          ))}

        </motion.div>

        {/* Floating Slide Counter in Viewport (At the bottom right) */}
        {activeIndex > 0 && (
          <div 
            className="absolute bottom-8 right-8 z-30 flex items-center gap-4 text-white"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', letterSpacing: '0.15em' }}
          >
            <span style={{ color: '#C9A84C' }}>0{activeIndex}</span>
            <span style={{ opacity: 0.3 }}>/</span>
            <span style={{ opacity: 0.5 }}>03</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectsSection;
