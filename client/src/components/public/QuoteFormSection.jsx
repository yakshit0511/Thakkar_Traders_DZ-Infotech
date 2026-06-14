import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
};

const shakeVariants = {
  shake: { x: [-6, 6, -6, 6, -3, 3, 0], transition: { duration: 0.35 } },
};

const inputCls = (hasError) =>
  `w-full px-4 py-3.5 bg-[#FEFCF8] border text-[0.94rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:outline-none focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)] ${
    hasError
      ? 'border-red-400 focus:border-red-400'
      : 'border-[#DED8CC] focus:border-[#C89B4A]'
  }`;

const QuoteFormSection = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    city: '',
    projectType: '',
    materialRequired: '',
    message: '',
  });

  const [errors, setErrors] = useState({ fullName: '', phoneNumber: '' });
  const [shakeField, setShakeField] = useState({ fullName: false, phoneNumber: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(() => setSubmitStatus(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    let hasErrors = false;
    const newErrors = { fullName: '', phoneNumber: '' };
    const newShakes = { fullName: false, phoneNumber: false };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      newShakes.fullName = true;
      hasErrors = true;
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      newShakes.phoneNumber = true;
      hasErrors = true;
    }
    if (hasErrors) {
      setErrors(newErrors);
      setShakeField(newShakes);
      setTimeout(() => setShakeField({ fullName: false, phoneNumber: false }), 400);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/inquiries', formData);
      if (response.data?.success) {
        setSubmitStatus({ type: 'success', text: 'Thank you — we will respond within one business day.' });
        setFormData({ fullName: '', phoneNumber: '', emailAddress: '', city: '', projectType: '', materialRequired: '', message: '' });
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Inquiry submission error:', error);
      setSubmitStatus({ type: 'error', text: 'Something went wrong. Please try WhatsApp or call us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="quote"
      className="relative bg-[#ECE6DC] px-6 py-[80px] sm:px-8 lg:px-12 lg:py-[128px]"
    >
      <div className="mx-auto max-w-[1040px]">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
          className="flex flex-col items-start"
        >
          <span className="section-label text-[#C89B4A]">08 / REQUEST A QUOTE</span>
          <h2 className="display-heading mt-5 text-[clamp(2.2rem,3.8vw,4rem)] font-light text-[#2F2F2F]">
            Tell us about the project.
          </h2>
          <p className="font-body font-light text-[1rem] text-[#6B6B6B] leading-[1.8] mt-4 max-w-2xl mb-0">
            Share your requirement and our team will respond with brand options, availability and pricing — usually within one business day.
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-16 w-full select-none" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                FULL NAME <span className="text-[#C89B4A]">*</span>
              </label>
              <motion.div animate={shakeField.fullName ? 'shake' : 'visible'} variants={shakeVariants}>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputCls(!!errors.fullName)}
                  placeholder="Your full name"
                />
              </motion.div>
              <AnimatePresence>
                {errors.fullName && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-500 font-body text-[0.76rem] mt-1 block"
                  >
                    {errors.fullName}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phoneNumber" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                PHONE NUMBER <span className="text-[#C89B4A]">*</span>
              </label>
              <motion.div animate={shakeField.phoneNumber ? 'shake' : 'visible'} variants={shakeVariants}>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={inputCls(!!errors.phoneNumber)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </motion.div>
              <AnimatePresence>
                {errors.phoneNumber && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-500 font-body text-[0.76rem] mt-1 block"
                  >
                    {errors.phoneNumber}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="emailAddress" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                EMAIL ADDRESS
              </label>
              <input
                id="emailAddress"
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                placeholder="your@email.com"
                className={inputCls(false)}
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                CITY
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Surat, Ahmedabad, Mumbai..."
                className={inputCls(false)}
              />
            </div>

            {/* Project Type */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectType" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                PROJECT TYPE
              </label>
              <input
                id="projectType"
                type="text"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                placeholder="Residential Bungalow, Commercial Office..."
                className={inputCls(false)}
              />
            </div>

            {/* Material Required */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="materialRequired" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                MATERIAL REQUIRED
              </label>
              <input
                id="materialRequired"
                type="text"
                name="materialRequired"
                value={formData.materialRequired}
                onChange={handleChange}
                placeholder="Century Marine Plywood, Merino Laminates..."
                className={inputCls(false)}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="message" className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-[#6B6B6B]">
                MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional details about your requirements..."
                className="w-full px-4 py-3.5 bg-[#FEFCF8] border border-[#DED8CC] text-[0.94rem] font-body text-[#2F2F2F] placeholder:text-[#9A9A8C]/60 transition-all duration-250 focus:border-[#C89B4A] focus:outline-none focus:shadow-[0_0_0_2px_rgba(200,155,74,0.15)] resize-y min-h-[120px]"
              />
            </div>
          </div>

          {/* Submit & Status */}
          <div className="mt-10 flex flex-col items-start gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center bg-[#C89B4A] text-white px-14 py-4 text-[0.78rem] font-body font-medium tracking-[0.16em] uppercase transition-all duration-300 hover:bg-[#A8732A] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,155,74,0.3)] disabled:bg-[#9A9A8C]/50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : 'SEND ENQUIRY'}
            </button>

            <AnimatePresence>
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p
                    className={`m-0 ${
                      submitStatus.type === 'success'
                        ? 'font-display italic text-[1.15rem] text-emerald-700'
                        : 'font-body text-[0.9rem] text-red-600'
                    }`}
                  >
                    {submitStatus.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </section>
  );
};

export default QuoteFormSection;
