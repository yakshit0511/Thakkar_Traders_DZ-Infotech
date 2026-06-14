import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const NAV_LINKS = [
  { label: 'ABOUT',    path: '/#about',    hash: '#about' },
  { label: 'PRODUCTS', path: '/#products', hash: '#products' },
  { label: 'BRANDS',   path: '/#brands',   hash: '#brands' },
  { label: 'PROJECTS', path: '/#projects', hash: '#projects' },
  { label: 'GALLERY',  path: '/#gallery',  hash: '#gallery' },
  { label: 'CONTACT',  path: '/#contact',  hash: '#contact' },
];

const scrollToSection = (sectionId, e, closeMenu) => {
  e?.preventDefault();
  closeMenu?.();
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = `/#${sectionId}`;
  }
};

const scrollToQuote = (e) => scrollToSection('quote', e);

const Navbar = () => {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }
    const SECTION_IDS = ['about', 'products', 'brands', 'projects', 'gallery', 'contact'];
    const updateActive = () => {
      const threshold = window.innerHeight * 0.45;
      let current = '';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener('scroll', updateActive);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (link) => {
    if (link.hash) {
      if (location.pathname !== '/') return false;
      return activeSection === link.hash.replace('#', '');
    }
    return location.pathname === link.path;
  };

  const handleNavClick = (link, e) => {
    scrollToSection(link.hash.replace('#', ''), e, () => setMenuOpen(false));
  };

  return (
    <>
      <header
        className={`site-header fixed left-0 top-0 z-[100] w-full transition-all duration-500 ${
          scrolled ? 'site-header-scrolled' : ''
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 lg:h-[76px] lg:px-12">

          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => handleNavClick(link, e)}
                className={`nav-link ${isActive(link) ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA — gold outline with gold fill on hover */}
          <a
            href="#quote"
            onClick={scrollToQuote}
            className="hidden border border-[#C89B4A] bg-transparent px-5 py-2.5 font-body text-[0.7rem] font-medium tracking-[0.15em] text-[#C89B4A] no-underline transition-all duration-300 hover:bg-[#C89B4A] hover:text-white lg:inline-block"
          >
            REQUEST QUOTE
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex items-center justify-center lg:hidden"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <X size={24} color="#2F2F2F" />
              : <Menu size={24} color="#2F2F2F" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: '#ECE6DC' }}
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.42, ease: [0, 0, 0.2, 1] }}
          >
            {/* Close button */}
            <button
              className="absolute right-6 top-5 text-[#6B6B6B] hover:text-[#2F2F2F] transition-colors"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={26} />
            </button>

            {/* Gold top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/60 to-transparent" />

            {/* Logo in mobile menu */}
            <div className="absolute top-4 left-6">
              <Logo />
            </div>

            <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.path}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`font-display text-[2.8rem] font-light leading-none no-underline transition-colors duration-200 ${
                    isActive(link) ? 'text-[#C89B4A] italic' : 'text-[#2F2F2F] hover:text-[#C89B4A]'
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.a
              href="#quote"
              onClick={(e) => { scrollToQuote(e); setMenuOpen(false); }}
              className="mt-12 bg-[#C89B4A] px-12 py-3.5 text-center font-body text-[0.72rem] font-medium tracking-[0.18em] text-white no-underline uppercase transition-all duration-300 hover:bg-[#A8732A]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.07, duration: 0.4 }}
            >
              REQUEST QUOTE
            </motion.a>

            {/* Bottom gold accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/40 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
