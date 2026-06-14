import { useState } from 'react';
import { Link } from 'react-router-dom';

const CATALOGUE_LINKS = [
  { label: 'Natural Veneers', path: '/products?category=veneers' },
  { label: 'BWP Plywood', path: '/products?category=plywood' },
  { label: 'MDF and HDHMR', path: '/products?category=mdf-hdhmr' },
  { label: 'Designer Hardware', path: '/products?category=hardware' },
  { label: 'Flush Doors', path: '/products?category=flush-doors' },
  { label: 'Designer Laminates', path: '/products?category=laminates' },
];

const STUDIO_LINKS = [
  { label: 'Request Quote', id: 'quote' },
  { label: 'About Us', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const handleLinkClick = (id, e) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = id;
    }
  };

  return (
    <footer className="border-t border-[#DED8CC] bg-[#ECE6DC] select-none">
      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-0 sm:px-8 lg:px-12">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[40%_25%_25%] gap-12 lg:gap-x-[10%]">

          {/* Left Column: Brand & Newsletter */}
          <div className="flex flex-col items-start">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center no-underline" aria-label="Thakkar Traders — Home">
              <img
                src="/thakkar-logo-transparent.png"
                className="h-[80px] w-auto object-contain"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1)) brightness(1.04)' }}
                alt="Thakkar Traders Logo"
              />
            </Link>

            {/* Tagline */}
            <p className="mt-5 font-body font-light text-[0.875rem] text-[#6B6B6B] leading-[1.75] max-w-sm">
              Curated material supply for exceptional interiors. Premium plywood, laminates,
              veneers, MDF and hardware — backed by 15+ years of trade trust.
            </p>

            {/* Newsletter */}
            <div className="mt-8 w-full max-w-sm min-h-[46px]">
              {subscribed ? (
                <div className="flex items-center h-[46px] border border-[#C89B4A]/30 bg-[#FEFCF8] px-4">
                  <span className="font-mono text-[0.64rem] tracking-[0.1em] text-[#C89B4A] uppercase">
                    THANK YOU FOR SUBSCRIBING
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex w-full">
                  <input
                    type="email"
                    required
                    placeholder="YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#FEFCF8] border border-[#DED8CC] px-4 py-3 font-mono text-[0.64rem] tracking-[0.1em] text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 focus:border-[#C89B4A] focus:outline-none transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    className="bg-[#C89B4A] text-white px-5 py-3 font-body font-medium text-[0.72rem] tracking-[0.1em] transition-colors duration-300 hover:bg-[#A8732A]"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Center Column: Catalogue */}
          <div className="flex flex-col items-start">
            <span className="font-mono text-[0.64rem] tracking-[0.22em] uppercase text-[#9A9A8C] mb-6">
              CATALOGUE
            </span>
            <div className="flex flex-col gap-4">
              {CATALOGUE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="font-body font-light text-[0.875rem] text-[#6B6B6B] hover:text-[#C89B4A] transition-all duration-250 hover:translate-x-1 no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Studio */}
          <div className="flex flex-col items-start">
            <span className="font-mono text-[0.64rem] tracking-[0.22em] uppercase text-[#9A9A8C] mb-6">
              STUDIO
            </span>
            <div className="flex flex-col gap-4">
              {STUDIO_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={`#${link.id}`}
                  onClick={(e) => handleLinkClick(link.id, e)}
                  className="font-body font-light text-[0.875rem] text-[#6B6B6B] hover:text-[#C89B4A] transition-all duration-250 hover:translate-x-1 no-underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-[#DED8CC] py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="font-mono text-[0.64rem] tracking-[0.08em] text-[#9A9A8C]">
            © 2026 THAKKAR TRADERS. ALL RIGHTS RESERVED.
          </span>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="font-mono text-[0.64rem] tracking-[0.08em] text-[#9A9A8C] hover:text-[#C89B4A] no-underline transition-colors duration-200"
            >
              PRIVACY
            </Link>
            <Link
              to="/terms"
              className="font-mono text-[0.64rem] tracking-[0.08em] text-[#9A9A8C] hover:text-[#C89B4A] no-underline transition-colors duration-200"
            >
              TERMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
