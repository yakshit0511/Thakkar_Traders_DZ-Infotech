import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import api from '../../utils/api';
import Logo from './Logo';

const DEFAULT_SETTINGS = {
  showroomAddress: 'Plot 12, Industrial Hub, Surat, Gujarat 395004, India',
  phone: '+91 98765 43210',
  email: 'inquiry@thakkartraders.com',
  workingHours: 'Mon — Sat, 09:30 — 19:00 IST',
  instagramUrl: '',
  linkedinUrl: '',
  facebookUrl: '',
};

const FOOTER_LINKS = [
  { label: 'About', path: '/#about' },
  { label: 'Products', path: '/#products' },
  { label: 'Brands', path: '/#brands' },
  { label: 'Projects', path: '/#projects' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

const Footer = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      } catch {
        /* use defaults */
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="border-t border-[rgba(201,168,76,0.2)] bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <Logo imageClassName="h-14 w-auto" />
            <p className="mt-4 font-body text-[0.85rem] font-light leading-relaxed text-[#8A8A7A]">
              Authorized distributors of premium plywood, laminates, veneers, MDF, HDHMR boards,
              flush doors and hardware in Surat, Gujarat.
            </p>
          </div>

          <div>
            <p className="section-label mb-4">Quick Links</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-body text-[0.85rem] text-[#8A8A7A] no-underline transition-colors duration-300 hover:text-[#C9A84C]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-label mb-4">Contact</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 font-body text-[0.85rem] text-[#8A8A7A]">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" />
                {settings.showroomAddress}
              </li>
              <li className="flex items-center gap-3 font-body text-[0.85rem] text-[#8A8A7A]">
                <Phone size={16} className="shrink-0 text-[#C9A84C]" />
                {settings.phone}
              </li>
              <li className="flex items-center gap-3 font-body text-[0.85rem] text-[#8A8A7A]">
                <Mail size={16} className="shrink-0 text-[#C9A84C]" />
                {settings.email}
              </li>
            </ul>
            <p className="mt-4 font-mono text-[0.65rem] tracking-[0.12em] text-[#5A5A7A]">
              {settings.workingHours}
            </p>
          </div>

          <div>
            <p className="section-label mb-4">Follow Us</p>
            <div className="flex gap-4">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8A8A7A] transition-colors hover:text-[#C9A84C]"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8A8A7A] transition-colors hover:text-[#C9A84C]"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8A8A7A] transition-colors hover:text-[#C9A84C]"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
            </div>
            <a
              href="#quote-form"
              className="mt-6 inline-block border border-[#C9A84C] px-5 py-2.5 font-body text-[0.7rem] font-medium tracking-[0.12em] text-[#C9A84C] no-underline transition-colors duration-300 hover:bg-[#C9A84C] hover:text-black"
            >
              REQUEST QUOTE
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#2A3147] pt-8 sm:flex-row">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-[#5A5A7A]">
            © {new Date().getFullYear()} Thakkar Traders. All rights reserved.
          </p>
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-[#5A5A7A]">
            Surat, Gujarat · Est. 2009
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
