import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const NAV_LINKS = [
  { label: 'ABOUT', path: '/#about', hash: '#about' },
  { label: 'PRODUCTS', path: '/#products', hash: '#products' },
  { label: 'BRANDS', path: '/#brands', hash: '#brands' },
  { label: 'PROJECTS', path: '/#projects', hash: '#projects' },
  { label: 'GALLERY', path: '/#gallery', hash: '#gallery' },
  { label: 'CONTACT', path: '/contact' },
];

const scrollToQuote = (e) => {
  e.preventDefault();
  const el = document.getElementById('quote-form');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = '/#quote-form';
  }
};

const scrollToSection = (sectionId, e, closeMenu) => {
  e.preventDefault();
  closeMenu?.();
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = `/#${sectionId}`;
  }
};

const scrollToAbout = (e, closeMenu) => scrollToSection('about', e, closeMenu);
const scrollToProducts = (e, closeMenu) => scrollToSection('products', e, closeMenu);
const scrollToProjects = (e, closeMenu) => scrollToSection('projects', e, closeMenu);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (link) => {
    if (link.hash) {
      return location.pathname === '/' && location.hash === link.hash;
    }
    return location.pathname === link.path;
  };

  const handleNavClick = (link, e) => {
    if (link.hash === '#about') {
      scrollToAbout(e, () => setMenuOpen(false));
    } else if (link.hash === '#products') {
      scrollToProducts(e, () => setMenuOpen(false));
    } else if (link.hash === '#projects') {
      scrollToProjects(e, () => setMenuOpen(false));
    } else if (link.hash === '#brands') {
      scrollToSection('brands', e, () => setMenuOpen(false));
    } else if (link.hash === '#gallery') {
      scrollToSection('gallery', e, () => setMenuOpen(false));
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`site-header fixed left-0 top-0 z-[100] w-full backdrop-blur-[10px] transition-[background-color,box-shadow,border-color] duration-[400ms] ease-in-out ${
          scrolled ? 'site-header-scrolled' : ''
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:h-[72px] lg:px-12">
          {/* Logo */}
          <Logo />

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) =>
              link.hash ? (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`gold-underline-hover font-body text-[0.72rem] font-normal tracking-[0.14em] text-[#8A8A7A] transition-colors duration-300 hover:text-[#F5F0E8] ${
                    isActive(link) ? 'nav-link-active' : ''
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`gold-underline-hover font-body text-[0.72rem] font-normal tracking-[0.14em] text-[#8A8A7A] transition-colors duration-300 hover:text-[#F5F0E8] ${
                    isActive(link) ? 'nav-link-active' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <a
            href="#quote-form"
            onClick={scrollToQuote}
            className="hidden border border-[#C9A84C] bg-transparent px-5 py-2.5 font-body text-[0.7rem] font-medium tracking-[0.12em] text-[#C9A84C] no-underline transition-[background-color,color] duration-300 ease-in-out hover:bg-[#C9A84C] hover:text-[#0A0F1E] lg:inline-block"
          >
            REQUEST QUOTE
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex items-center justify-center lg:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={24} color="#F5F0E8" />
            ) : (
              <Menu size={24} color="#F5F0E8" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed left-0 top-0 z-[200] w-full overflow-hidden bg-black"
            initial={{ height: 0 }}
            animate={{ height: '100vh' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          >
            <div className="flex h-full flex-col items-center justify-center px-6">
              <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
                {NAV_LINKS.map((link, index) =>
                  link.hash ? (
                    <motion.a
                      key={link.label}
                      href={link.path}
                      onClick={(e) => handleNavClick(link, e)}
                      className="font-display text-[2.5rem] font-normal italic text-[#F5F0E8] no-underline"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                    >
                      {link.label}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className="font-display text-[2.5rem] font-normal italic text-[#F5F0E8] no-underline"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}
              </nav>

              <motion.a
                href="#quote-form"
                onClick={(e) => {
                  scrollToQuote(e);
                  setMenuOpen(false);
                }}
                className="mt-10 w-full max-w-xs border border-[#C9A84C] bg-transparent px-5 py-3 text-center font-body text-[0.7rem] font-medium tracking-[0.12em] text-[#C9A84C] no-underline transition-[background-color,color] duration-300 ease-in-out hover:bg-[#C9A84C] hover:text-[#0A0F1E]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: NAV_LINKS.length * 0.08, duration: 0.4 }}
              >
                REQUEST QUOTE
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
