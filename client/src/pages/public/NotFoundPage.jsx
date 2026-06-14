import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Thakkar Traders</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>

      <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#F0EBE1] px-6 overflow-hidden select-none">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(196,137,46,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Top gold line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4892E]/45 to-transparent" />

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        >
          {/* Large 404 */}
          <p className="font-display text-[clamp(7rem,20vw,18rem)] font-light leading-none text-[#C4892E]/10 tracking-tighter select-none">
            404
          </p>

          {/* Section label */}
          <motion.span
            className="section-label text-[#C4892E] -mt-6 sm:-mt-10 lg:-mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            PAGE NOT FOUND
          </motion.span>

          {/* Heading */}
          <motion.h1
            className="display-heading mt-6 text-[clamp(1.8rem,4vw,3.5rem)] font-light text-[#1A1714] leading-[1.1] max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            This page has{' '}
            <span className="italic font-display text-[#C4892E]">moved on</span>.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-6 max-w-md font-body font-light text-[0.95rem] text-[#5A5450] leading-[1.8]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been relocated. Let&apos;s
            get you back to something useful.
          </motion.p>

          {/* Gold divider */}
          <motion.div
            className="mt-10 h-px w-16 bg-[#C4892E]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
          />

          {/* CTA buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-[#C4892E] text-white px-8 py-3.5 font-body text-[0.8rem] font-medium tracking-[0.12em] uppercase no-underline transition-all duration-300 hover:bg-[#A8602A] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(196,137,46,0.25)]"
            >
              BACK TO HOME
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center border border-[#1A1714]/30 bg-transparent text-[#1A1714] px-8 py-3.5 font-body text-[0.8rem] font-medium tracking-[0.12em] uppercase no-underline transition-all duration-300 hover:border-[#C4892E] hover:text-[#C4892E]"
            >
              VIEW GALLERY
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4892E]/20 to-transparent" />
      </section>
    </>
  );
};

export default NotFoundPage;
