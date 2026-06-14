import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Mail,
  Package,
  FolderGit2,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink
} from 'lucide-react';
import '../../styles/admin.css';

const AdminLayout = ({ children, title = 'Dashboard' }) => {
  const { username, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inquiries', path: '/admin/inquiries', icon: Mail },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--admin-bg-card)] border-r border-[var(--admin-border)]">
      {/* Brand Monogram Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[var(--admin-border)]">
        <div className="w-10 h-10 rounded-lg bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] flex items-center justify-center shadow-md">
          <span className="text-lg font-bold text-[var(--admin-accent)]">TT</span>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-[var(--admin-text-primary)]">THAKKAR</h1>
          <p className="text-[10px] font-semibold tracking-widest text-[var(--admin-accent)]">CONTROL PANEL</p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[var(--admin-accent)] text-[#080C14] font-semibold shadow-lg shadow-[var(--admin-accent)]/10'
                  : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text-primary)]'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout footer */}
      <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg-deep)]/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] flex items-center justify-center">
              <User className="h-4 w-4 text-[var(--admin-accent)]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[var(--admin-text-primary)] truncate max-w-[100px]">
                {username || 'Administrator'}
              </p>
              <p className="text-[10px] text-[var(--admin-text-secondary)]">Online</p>
            </div>
          </div>
          <Link
            to="/"
            target="_blank"
            className="p-1.5 rounded-md text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text-primary)] transition"
            title="View Live Website"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-semibold text-[var(--admin-danger)] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-theme min-h-screen bg-[var(--admin-bg-deep)]">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 z-20 hidden md:block w-64">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm"
            />
            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 z-40 w-64 md:hidden"
            >
              {sidebarContent}
              {/* Close Button overlay */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-[-3rem] p-2 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-md text-[var(--admin-text-primary)] md:hidden hover:bg-[var(--admin-bg-elevated)]"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main workspace layout */}
      <div className="flex flex-col min-h-screen md:pl-64">
        {/* Header bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--admin-bg-deep)]/80 backdrop-blur-md border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg md:hidden border border-[var(--admin-border)] bg-[var(--admin-bg-card)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-elevated)]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-[var(--admin-text-primary)] font-sans">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Simple status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-card)] text-xs text-[var(--admin-text-secondary)] font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--admin-success)] animate-pulse" />
              <span>Workspace Active</span>
            </div>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
