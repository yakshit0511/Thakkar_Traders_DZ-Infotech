import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageHero from '../../components/shared/PageHero';
import QuoteFormSection from '../../components/public/QuoteFormSection';
import ContactSection from '../../components/public/ContactSection';

const RESPONSE_STEPS = [
  {
    step: '01',
    title: 'Submit Your Enquiry',
    body: 'Fill in your project details and material requirements in the form below.',
  },
  {
    step: '02',
    title: 'We Review & Respond',
    body: 'Our team reviews your brief and prepares brand options with availability and pricing — usually within one business day.',
  },
  {
    step: '03',
    title: 'Visit or We Deliver',
    body: 'Collect material samples from our showroom or have them delivered directly to your site.',
  },
];

const ContactPage = () => (
  <>
    <Helmet>
      <title>Contact Us | Thakkar Traders — Surat</title>
      <meta
        name="description"
        content="Get in touch with Thakkar Traders. Request a quote, visit our showroom in Surat, or reach us directly for premium building materials."
      />
    </Helmet>

    <div className="bg-[#F5F1EA] min-h-screen">
      {/* Page Hero */}
      <PageHero
        label="09 / GET IN TOUCH"
        title={
          <>
            Let&apos;s talk about your{' '}
            <span className="italic font-display text-[#C89B4A]">project</span>.
          </>
        }
        subtitle="Whether you're specifying materials for a residence, office, or hotel — our team is ready to help you find exactly what you need."
        bgImage="/images/wardrobe.png"
      />

      {/* How It Works */}
      <div className="bg-[#ECE6DC] border-b border-[#DED8CC] px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="section-label text-[#C89B4A] mb-12">HOW IT WORKS</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {RESPONSE_STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="group bg-[#FEFCF8] border border-[#DED8CC] px-8 py-10 flex flex-col gap-5 transition-all duration-350 hover:border-[#C89B4A]/40 hover:shadow-[0_12px_36px_rgba(200,155,74,0.1)] hover:-translate-y-1"
              >
                <span className="font-mono text-[0.62rem] tracking-[0.22em] text-[#C89B4A]">
                  {item.step}
                </span>
                <div className="w-8 h-px bg-[#C89B4A] transition-all duration-300 group-hover:w-14" />
                <h3 className="font-display text-[1.25rem] font-medium text-[#2F2F2F] group-hover:text-[#C89B4A] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="font-body text-[0.88rem] font-light text-[#6B6B6B] leading-[1.75]">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote form */}
      <QuoteFormSection />

      {/* Google Map */}
      <div className="bg-[#ECE6DC] border-t border-[#DED8CC]">
        <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-8 lg:px-12">
          <p className="section-label text-[#C89B4A] mb-8">FIND US</p>
          <div className="w-full h-[380px] border border-[#DED8CC] overflow-hidden">
            <iframe
              title="Thakkar Traders Showroom Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119144.92774498735!2d72.77741165!3d21.1702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xfe4558290938b042!2sSurat%2C+Gujarat!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(30%) contrast(1.05)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Contact details */}
      <ContactSection />
    </div>
  </>
);

export default ContactPage;
