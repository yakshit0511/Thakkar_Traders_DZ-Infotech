import { motion } from 'framer-motion';

/**
 * Reusable inner-page hero banner.
 * Props:
 *   label      — small monospaced tag, e.g. "01 / COLLECTION"
 *   title      — main display heading (string, may include JSX italic spans)
 *   subtitle   — body text below heading
 *   accent     — optional extra text/node shown below subtitle
 *   bgImage    — optional background image URL for a subtle parallax feel
 */
const PageHero = ({ label, title, subtitle, accent, bgImage }) => (
  <section
    className="relative overflow-hidden bg-[#060608] px-6 pt-28 pb-20 sm:px-8 lg:px-12 lg:pt-36 lg:pb-28"
    aria-label="Page hero"
  >
    {/* Ambient radial glow */}
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)',
      }}
    />

    {/* Optional background image with dark overlay */}
    {bgImage && (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#050A14]/60" aria-hidden="true" />
      </>
    )}

    {/* Top gold accent line */}
    <div
      className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent"
      aria-hidden="true"
    />

    {/* Bottom border */}
    <div
      className="absolute bottom-0 left-6 right-6 h-px bg-[#2A3147] lg:left-12 lg:right-12"
      aria-hidden="true"
    />

    <div className="relative z-10 mx-auto max-w-[1400px]">
      {label && (
        <motion.p
          className="section-label text-[#C9A84C]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {label}
        </motion.p>
      )}

      <motion.h1
        className="display-heading mt-5 text-[clamp(2.4rem,5vw,5rem)] font-light leading-[1.05] text-[#F5F0E8]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="mt-6 max-w-2xl font-body font-light text-[0.95rem] leading-[1.8] text-[#8A8A7A] lg:text-[1.05rem]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
        >
          {subtitle}
        </motion.p>
      )}

      {accent && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {accent}
        </motion.div>
      )}
    </div>
  </section>
);

export default PageHero;
