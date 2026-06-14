import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import ProjectsSection from '../../components/public/ProjectsSection';

const STATS = [
  { value: '500+', label: 'Projects Completed' },
  { value: '15+', label: 'Years of Experience' },
  { value: '100+', label: 'Architect Partners' },
  { value: '3', label: 'States Served' },
];

const ProjectsPage = () => (
  <>
    <Helmet>
      <title>Projects | Thakkar Traders — Portfolio</title>
      <meta
        name="description"
        content="Explore completed projects by Thakkar Traders across residential, commercial and hospitality segments — where premium materials shape exceptional spaces."
      />
    </Helmet>

    <div className="bg-[#F5F1EA] min-h-screen">
      {/* Page Hero */}
      <PageHero
        label="04 / PORTFOLIO"
        title={
          <>
            Where our materials{' '}
            <span className="italic font-display text-[#C89B4A]">live</span>.
          </>
        }
        subtitle="From luxury residences to boutique hotels — a selection of spaces where Thakkar Traders materials were specified, supplied and delivered."
        bgImage="/images/tv_unit.png"
      />

      {/* Project Stats Bar */}
      <div className="bg-[#ECE6DC] border-b border-[#DED8CC]">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-1 flex-col items-center justify-center border-b border-[#DED8CC] py-10 text-center sm:border-b-0 sm:border-r sm:py-12 last:border-r-0 last:border-b-0"
              >
                <p className="font-display text-[clamp(2.4rem,4.5vw,4rem)] font-light leading-none text-[#C89B4A]">
                  {stat.value}
                </p>
                <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#6B6B6B]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects scroll section */}
      <ProjectsSection />

      {/* Collaborate CTA */}
      <div className="bg-[#ECE6DC] border-t border-[#DED8CC] px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <p className="section-label text-[#C89B4A]">WORK WITH US</p>
            <h2 className="display-heading mt-4 text-[clamp(2rem,3.2vw,3.4rem)] font-light text-[#2F2F2F] leading-[1.1]">
              Planning your next{' '}
              <span className="italic font-display text-[#C89B4A]">project?</span>
            </h2>
            <p className="mt-4 max-w-lg font-body text-[0.92rem] text-[#6B6B6B] leading-[1.8]">
              Share your brief and we&apos;ll connect you with the right materials, brands and pricing — from specification to site delivery.
            </p>
          </div>
          <a
            href="/#quote"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#quote'; }}
            className="shrink-0 inline-flex items-center justify-center bg-[#C89B4A] text-white px-12 py-4 font-body text-[0.78rem] font-medium tracking-[0.14em] uppercase no-underline transition-all duration-300 hover:bg-[#A8732A] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,155,74,0.28)]"
          >
            REQUEST QUOTE
          </a>
        </div>
      </div>
    </div>
  </>
);

export default ProjectsPage;
