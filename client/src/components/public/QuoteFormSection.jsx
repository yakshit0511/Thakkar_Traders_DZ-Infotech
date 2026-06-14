import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import api from '../../utils/api';
import {
  fadeUpVariant,
  slideLeftVariant,
  slideRightVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const INITIAL_FORM = {
  fullName: '',
  phoneNumber: '',
  emailAddress: '',
  city: '',
  projectType: '',
  materialRequired: '',
  message: '',
};

const QuoteFormSection = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    phone: '+91 98765 43210',
    email: 'inquiry@thakkartraders.com',
    whatsappNumber: '919876543210',
    showroomAddress: 'Plot 12, Industrial Hub, Surat, Gujarat 395004, India',
  });

  const { ref: leftRef, controls: leftControls } = useScrollAnimation();
  const { ref: rightRef, controls: rightControls } = useScrollAnimation();

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.phoneNumber.trim()) {
      toast.error('Please enter your name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/inquiries', form);
      if (data.success) {
        toast.success('Inquiry submitted! We will contact you shortly.');
        setForm(INITIAL_FORM);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-[#2A3147] bg-[#12192B] px-4 py-3 font-body text-[0.9rem] text-[#F5F0E8] outline-none transition-[border-color] duration-300 placeholder:text-[#5A5A7A] focus:border-[#C9A84C]';

  return (
    <section
      id="quote-form"
      className="bg-[#0D1220] px-6 py-[60px] md:px-8 md:py-20 lg:px-12 lg:py-[120px]"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div
          ref={leftRef}
          initial="hidden"
          animate={leftControls}
          variants={slideLeftVariant}
        >
          <p className="section-label">07 / REQUEST A QUOTE</p>
          <h2 className="display-heading mt-4 text-[clamp(2rem,3.5vw,3.5rem)] leading-[1.1] text-[#F5F0E8]">
            Tell us about
            <br />
            <span className="font-display italic">your project</span>.
          </h2>
          <p className="mt-6 max-w-md font-body text-[0.95rem] font-light leading-[1.8] text-[#8A8A7A]">
            Share your material requirements and our team will respond with availability,
            specifications and trade pricing within one business day.
          </p>

          <div className="mt-10 space-y-4 border-t border-[#2A3147] pt-8">
            <p className="font-body text-[0.9rem] text-[#8A8A7A]">
              <span className="text-[#C9A84C]">Phone:</span> {settings.phone}
            </p>
            <p className="font-body text-[0.9rem] text-[#8A8A7A]">
              <span className="text-[#C9A84C]">Email:</span> {settings.email}
            </p>
            <p className="font-body text-[0.9rem] text-[#8A8A7A]">
              <span className="text-[#C9A84C]">Showroom:</span> {settings.showroomAddress}
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-[0.7rem] tracking-[0.15em] text-[#C9A84C] no-underline transition-colors hover:text-[#F5F0E8]"
            >
              WHATSAPP US →
            </a>
          </div>
        </motion.div>

        <motion.form
          ref={rightRef}
          initial="hidden"
          animate={rightControls}
          variants={slideRightVariant}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name *"
              required
              className={inputClass}
            />
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number *"
              required
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="email"
              name="emailAddress"
              value={form.emailAddress}
              onChange={handleChange}
              placeholder="Email Address"
              className={inputClass}
            />
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className={inputClass}
            />
          </div>
          <input
            type="text"
            name="projectType"
            value={form.projectType}
            onChange={handleChange}
            placeholder="Project Type (e.g. Residential Bungalow, Office Fitout)"
            className={inputClass}
          />
          <input
            type="text"
            name="materialRequired"
            value={form.materialRequired}
            onChange={handleChange}
            placeholder="Materials Required (e.g. Marine Plywood, Merino Laminates)"
            className={inputClass}
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Additional details about your project"
            rows={4}
            className={`${inputClass} resize-none`}
          />
          <motion.button
            type="submit"
            disabled={submitting}
            variants={fadeUpVariant}
            className="inline-flex w-full items-center justify-center gap-2 bg-[#C9A84C] px-8 py-4 font-body text-[0.8rem] font-medium tracking-[0.1em] text-[#0A0F1E] transition-[background-color,transform] duration-300 hover:bg-[#B87333] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Send size={16} />
            {submitting ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

export default QuoteFormSection;
