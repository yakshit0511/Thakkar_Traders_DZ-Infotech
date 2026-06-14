import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: 'Thakkar Traders has been our go-to material partner for every flagship residential project. The quality of veneers and the consistency of supply is unmatched.',
    name: 'Ar. Riya Mehta',
    designation: 'PRINCIPAL, STUDIO MEHTA ARCHITECTS',
    initials: 'RM',
  },
  {
    quote: 'From specification to site delivery, the team handles everything with the precision a design studio needs. They genuinely understand materials.',
    name: 'Karan Shah',
    designation: 'INTERIOR DESIGNER, FORM AND FUNCTION',
    initials: 'KS',
  },
  {
    quote: 'We have been sourcing plywood and hardware from Thakkar Traders for over a decade. Honest pricing, premium brands, on-time delivery.',
    name: 'Vinod Patel',
    designation: 'CONTRACTOR, PATEL BUILD CO.',
    initials: 'VP',
  },
];

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const columnVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] } },
};

const TestimonialsSection = () => (
  <section className="relative bg-[#F5F1EA] px-6 py-[80px] sm:px-8 lg:px-12 lg:py-[128px]">
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={headerVariants}
        className="flex flex-col items-start"
      >
        <span className="section-label text-[#C89B4A]">07 / TRUSTED BY</span>
        <h2 className="display-heading mt-5 text-[clamp(2.4rem,3.8vw,4.2rem)] font-light text-[#2F2F2F] italic">
          In their words.
        </h2>
      </motion.div>

      {/* Testimonials Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
        className="mt-[72px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {TESTIMONIALS.map((t, index) => (
          <motion.div
            key={index}
            variants={columnVariants}
            className="group flex flex-col bg-[#FEFCF8] border border-[#DED8CC] p-8 relative select-none transition-all duration-350 hover:border-[#C89B4A]/40 hover:shadow-[0_16px_48px_rgba(200,155,74,0.1)] hover:-translate-y-1"
          >
            {/* Watermark quote mark */}
            <span className="absolute top-3 right-5 font-display text-[6rem] font-light text-[#C89B4A]/12 leading-none pointer-events-none select-none">
              "
            </span>

            {/* Quote text */}
            <p className="relative z-10 font-display italic text-[1.1rem] leading-[1.8] text-[#2F2F2F] m-0 flex-1">
              {t.quote}
            </p>

            {/* Gold separator */}
            <div className="mt-7 h-px w-10 bg-[#C89B4A]" />

            {/* Author */}
            <div className="mt-6 flex items-center gap-4">
              {/* Avatar circle */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C89B4A]/12 border border-[#C89B4A]/25">
                <span className="font-mono text-[0.62rem] font-medium text-[#C89B4A]">
                  {t.initials}
                </span>
              </div>
              <div>
                <h4 className="font-body font-medium text-[0.88rem] tracking-[0.04em] text-[#2F2F2F] m-0">
                  {t.name}
                </h4>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#9A9A8C]">
                  {t.designation}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
