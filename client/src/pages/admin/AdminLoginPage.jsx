import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminAxios from '../../utils/adminAxios';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import '../../styles/admin.css';

const AdminLoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const status = err.response?.status;

      if (status === 401) {
        setError('Invalid credentials. Please try again.');
      } else if (status === 404) {
        setError('Admin API endpoint not found. Check the backend URL and deployment routing.');
      } else if (!err.response) {
        setError('Cannot reach the admin API. Check VITE_API_URL and the backend deployment.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      setError('Please provide all credentials.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await adminAxios.post('/auth/login', {
        username: usernameInput,
        password: passwordInput,
      });

      if (response.data?.success && response.data?.data?.token) {
        login(response.data.data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Login returned invalid data formats.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-theme min-h-screen flex flex-col md:flex-row bg-[var(--admin-bg-deep)]">

      {/* ══════════════════════════════════════════════
          LEFT BRAND PANEL
      ══════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col justify-start w-1/2 relative overflow-hidden"
        style={{
          padding: '3rem 3rem 2.5rem',
          gap: '0',
          background: 'linear-gradient(135deg, #0F1520 0%, #080C14 60%, #0a0e18 100%)',
          borderRight: '1px solid rgba(201,168,76,0.10)',
        }}
      >
        {/* Blueprint grid — 20% less visible */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(128,128,128,0.048) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.048) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Warm gold radial glow — anchored behind logo area */}
        <div
          className="absolute"
          style={{
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,155,74,0.09) 0%, rgba(200,155,74,0.03) 45%, transparent 70%)',
            top: '10px',
            left: '-40px',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
            bottom: '100px',
            right: '-40px',
            pointerEvents: 'none',
          }}
        />

        {/* ── Top Header: Logo LEFT + Labels RIGHT ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative z-10"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0px' }}
        >
          {/* Actual Thakkar Traders Logo Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{
              background: 'linear-gradient(145deg, #263A5E 0%, #1C2E4E 100%)',
              border: '1px solid rgba(201,168,76,0.28)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src="/thakkar-logo-transparent.png"
              alt="Thakkar Traders"
              style={{
                height: '52px',
                width: '52px',
                objectFit: 'contain',
                display: 'block',
                filter: 'brightness(1.15) saturate(1.08)',
              }}
            />
          </motion.div>



          {/* Thin vertical gold divider */}
          <div
            style={{
              width: '1px',
              height: '36px',
              background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.4), transparent)',
              margin: '0 16px',
              flexShrink: 0,
            }}
          />

          {/* Labels — right side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1,
              }}
            >
              Portal Access
            </p>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(140,158,185,0.88)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Thakkar Traders &mdash; Admin Suite
            </p>
          </div>
        </motion.div>



        {/* ── Center Copy ── */}
        <div className="relative z-10" style={{ marginTop: 'auto', marginBottom: 'auto', paddingTop: '2.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-3"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-widest"
              style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.2)',
                color: '#C89B4A',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.18em',
              }}
            >
              <Shield className="h-3.5 w-3.5" />
              Secure Environment
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#E8EDF5',
                lineHeight: 1.15,
                maxWidth: '380px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Managing Luxury. <br />
              <span style={{ color: '#C89B4A' }}>Simplified</span> in One Command.
            </h2>
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#7A8BA8',
                lineHeight: 1.75,
                maxWidth: '340px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Monitor client inquiries, curate product catalogs, configure showroom highlights, and manage core settings from a single unified workspace.
            </p>
          </motion.div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10" style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(122,139,168,0.50)', fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} Thakkar Traders. All rights reserved.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT LOGIN PANEL
      ══════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Subtle radial glow behind the card */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
          style={{
            background: 'linear-gradient(145deg, rgba(21,29,46,0.95) 0%, rgba(15,21,32,0.98) 100%)',
            border: '1px solid rgba(201,168,76,0.14)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* ── Mobile-only Logo Header ── */}
          <div className="flex md:hidden flex-col items-center mb-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.025 }}
              style={{
                background: 'rgba(18, 24, 38, 0.92)',
                border: '1px solid rgba(201,168,76,0.28)',
                borderRadius: '13px',
                padding: '10px 13px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                display: 'inline-flex',
                marginBottom: '8px',
              }}
            >
              <img
                src="/thakkar-logo-transparent.png"
                alt="Thakkar Traders Logo"
                style={{
                  height: '60px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(1.25) contrast(1.15) saturate(1.1)',
                  imageRendering: '-webkit-optimize-contrast',
                }}
              />
            </motion.div>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Portal Access
            </p>
          </div>


          {/* ── Card Header ── */}
          <div className="hidden md:block mb-6">
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#E8EDF5',
                fontFamily: "'Inter', sans-serif",
                marginBottom: '4px',
              }}
            >
              Welcome back
            </h3>
            <p style={{ fontSize: '12px', color: '#7A8BA8', fontFamily: "'Inter', sans-serif" }}>
              Enter your administrative credentials to verify identity.
            </p>
          </div>

          {/* ── Gold divider ── */}
          <div
            className="hidden md:block mb-6"
            style={{
              height: '1px',
              background: 'linear-gradient(to right, rgba(201,168,76,0.25), rgba(201,168,76,0.05), transparent)',
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3.5 rounded-lg text-xs"
                style={{
                  background: 'rgba(239,68,68,0.09)',
                  border: '1px solid rgba(239,68,68,0.22)',
                  color: '#EF4444',
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-snug">{error}</p>
              </motion.div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#7A8BA8',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                  display: 'block',
                }}
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--admin-text-secondary)]">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] focus:border-[var(--admin-accent)] rounded-lg text-sm transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#7A8BA8',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                  display: 'block',
                }}
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--admin-text-secondary)]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] focus:border-[var(--admin-accent)] rounded-lg text-sm transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-admin-primary justify-center py-3 text-sm rounded-lg"
              style={{ marginTop: '0.25rem' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#080C14] border-t-transparent animate-spin" />
              ) : (
                'Access Workspace'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
