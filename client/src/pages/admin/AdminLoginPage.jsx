import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminAxios from '../../utils/adminAxios';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react';
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
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await adminAxios.post('/auth/login', {
        username: usernameInput.trim(),
        password: passwordInput,
      });

      if (response.data?.success && response.data?.data?.token) {
        login(response.data.data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-theme min-h-screen flex flex-col md:flex-row bg-[var(--admin-bg-primary)]">
      <div
        className="hidden md:flex flex-col justify-between w-1/2 relative overflow-hidden bg-[var(--admin-bg-primary)] border-r border-[var(--admin-border)]"
        style={{
          padding: '3rem',
          background: 'linear-gradient(135deg, #F9F7F4 0%, #F1E8DC 60%, #EFE5D8 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(201,168,76,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(201,168,76,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.02) 45%, transparent 70%)',
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

        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative z-10 flex flex-col gap-8"
        >
          <div className="flex items-center gap-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)]">
              <img src="/thakkar-logo-transparent.png" alt="Thakkar Traders" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-accent)]">Portal Access</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9CA3AF]">Admin Suite</p>
            </div>
          </div>

          <div className="space-y-6 max-w-[420px]">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Shield className="h-3.5 w-3.5" />
              Secure Environment
            </span>
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold text-[#111827] leading-tight">
                Managing Luxury.
                <span className="text-[var(--admin-accent)]"> Simplified</span>
              </h1>
              <p className="text-sm text-[#6B7280] leading-7">
                Monitor client inquiries, curate product catalogs, and manage showroom highlights from one polished, modern dashboard.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 mt-auto">
          <p className="text-[11px] text-[#9CA3AF]">© {new Date().getFullYear()} Thakkar Traders. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-[var(--admin-bg-primary)] overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 62%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[500px] relative z-10 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-[32px] shadow-[0_40px_80px_rgba(15,23,42,0.08)] p-10"
        >
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)]">
                <img src="/thakkar-logo-transparent.png" alt="Thakkar logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-accent)]">Admin Login</p>
                <h2 className="text-2xl font-bold text-[#111827]">Welcome back</h2>
              </div>
            </div>
            <p className="text-sm text-[#6B7280]">Enter your admin credentials to access the dashboard and manage the site.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#FECACA] bg-[#FEF3F2] p-4 text-sm text-[#B91C1C]"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Username</label>
              <div className="input-with-icon">
                <span className="input-icon-left"><User className="h-4 w-4" /></span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-card)] py-3 text-sm text-[#111827] outline-none transition focus:border-[var(--admin-accent)] focus:ring-4 focus:ring-[rgba(201,168,76,0.12)] placeholder:text-[var(--admin-text-tertiary)]"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Password</label>
              <div className="input-with-icon">
                <span className="input-icon-left"><Lock className="h-4 w-4" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-card)] py-3 text-sm text-[#111827] outline-none transition focus:border-[var(--admin-accent)] focus:ring-4 focus:ring-[rgba(201,168,76,0.12)] placeholder:text-[var(--admin-text-tertiary)]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="input-icon-right text-[#6B7280] transition hover:text-[#111827]"
                  style={{ pointerEvents: 'auto' }}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[var(--admin-accent)] py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(201,168,76,0.24)] transition hover:bg-[var(--admin-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Access Workspace'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
