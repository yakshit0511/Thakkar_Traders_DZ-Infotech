import { motion } from 'framer-motion';

const SERVICES = [
  {
    number: '01',
    title: 'Architect & Designer Support',
    description: 'Specification consultation, material samples and project-side coordination for every stage of your design.',
  },
  {
    number: '02',
    title: 'Contractor & Builder Supply',
    description: 'Bulk supply with reliable pricing and consistent stock availability for ongoing site requirements.',
  },
  {
    number: '03',
    title: 'Furniture Manufacturer Supply',
    description: 'Standing inventory and just-in-time replenishment to keep your workshop running without interruptions.',
  },
  {
    number: '04',
    title: 'Site Delivery',
    description: 'Fast, scheduled deliveries across the region — no last-minute scrambles or delays on your project timeline.',
  },
  {
    number: '05',
    title: 'Material Consultation',
    description: 'Expert guidance on selecting the right grade, finish and brand for every specific application and budget.',
  },
  {
    number: '06',
    title: 'Custom Procurement',
    description: 'Special-order veneers, hardware and decorative finishes sourced on request from our trusted supplier network.',
  },
];

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
};

const ServicesSection = () => (
  <section
    id="services"
    className="relative bg-[#ECE6DC] px-6 py-[80px] sm:px-8 lg:px-12 lg:py-[128px]"
  >
    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C89B4A]/10 to-transparent" />

    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={headerVariants}
        className="flex flex-col items-start"
      >
        <span className="section-label text-[#C89B4A]">06 / SERVICES</span>
        <h2 className="display-heading mt-5 text-[clamp(2.4rem,3.8vw,4.2rem)] font-light text-[#2F2F2F]">
          Trade support, <span className="italic font-display text-[#C89B4A]">end to end.</span>
        </h2>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
        className="mt-[72px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {SERVICES.map((service) => (
          <motion.div
            key={service.number}
            variants={cardVariants}
            className="group relative bg-[#FEFCF8] border border-[#DED8CC] px-8 py-10 flex flex-col transition-all duration-350 hover:-translate-y-2 hover:border-[#C89B4A]/40 hover:shadow-[0_16px_48px_rgba(200,155,74,0.12)] select-none"
          >
            {/* Number */}
            <span className="font-mono text-[0.62rem] tracking-[0.22em] text-[#C89B4A] mb-5">
              {service.number}
            </span>

            {/* Gold accent bar */}
            <div className="w-8 h-px bg-[#C89B4A] mb-6 transition-all duration-300 group-hover:w-14" />

            {/* Title */}
            <h3 className="font-display font-medium text-[1.35rem] text-[#2F2F2F] transition-colors duration-300 group-hover:text-[#C89B4A] m-0 leading-tight">
              {service.title}
            </h3>

            {/* Description */}
            <p className="font-body font-light text-[0.88rem] text-[#6B6B6B] leading-[1.75] mt-4 mb-0 flex-1">
              {service.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ServicesSection;
