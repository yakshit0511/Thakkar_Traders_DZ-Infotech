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
      navigate('/admin/dashboard');
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
      {/* Brand Showcase Panel (Left) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-[var(--admin-bg-card)] to-[var(--admin-bg-deep)] border-r border-[var(--admin-border)] relative overflow-hidden">
        {/* Subtle decorative grid/glows */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[var(--admin-accent)]/5 blur-[80px] top-[-50px] left-[-50px]" />
        
        {/* Top Header */}
        <div className="flex items-center gap-4 relative z-10">
          <img
            src="/thakkar-logo-transparent.png"
            className="h-14 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12)) brightness(1.1)' }}
            alt="Thakkar Traders Logo"
          />
          <div className="border-l border-[var(--admin-border)] pl-4 py-1">
            <p className="text-[10px] font-bold text-[var(--admin-accent)] tracking-widest uppercase">Portal Access</p>
          </div>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] text-xs font-semibold border border-[var(--admin-accent)]/20 uppercase tracking-widest">
              <Shield className="h-3.5 w-3.5" />
              Secure Environment
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-[var(--admin-text-primary)] leading-tight max-w-md">
              Managing Luxury. <br />
              Simplified in One Command.
            </h2>
            <p className="text-sm text-[var(--admin-text-secondary)] leading-relaxed max-w-sm">
              Use this dashboard to monitor incoming client inquiries, customize available product catalogs, configure showroom highlight boards, and edit core configurations.
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[var(--admin-text-secondary)]">
          <p>© {new Date().getFullYear()} Thakkar Traders. All rights reserved.</p>
        </div>
      </div>

      {/* Login Screen (Right) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/60 relative"
        >
          {/* Mobile Logo Header */}
          <div className="flex md:hidden flex-col items-center mb-8 text-center">
            <img
              src="/thakkar-logo-transparent.png"
              className="h-14 w-auto object-contain mb-3"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12)) brightness(1.1)' }}
              alt="Thakkar Traders Logo"
            />
            <p className="text-[10px] font-semibold text-[var(--admin-accent)] tracking-widest uppercase pl-[0.2em]">
              Admin Workspace
            </p>
          </div>


          <div className="hidden md:block mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-[var(--admin-text-primary)]">
              Welcome back
            </h3>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1.5">
              Enter your administrative credentials to verify identity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--admin-danger)]"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <p className="leading-tight">{error}</p>
              </motion.div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
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
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-admin-primary justify-center py-3 text-sm rounded-lg hover:shadow-lg hover:shadow-[var(--admin-accent)]/10"
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
