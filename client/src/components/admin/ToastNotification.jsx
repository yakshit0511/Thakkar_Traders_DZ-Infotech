import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─── Context ─────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

const TOAST_DURATION = 4000;

const TYPE_CONFIG = {
  success: {
    Icon: CheckCircle2,
    border: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    iconColor: '#10B981',
    textColor: '#064E3B',
    messageColor: '#065F46',
  },
  error: {
    Icon: XCircle,
    border: '#E74C3C',
    bg: 'rgba(231,76,60,0.08)',
    iconColor: '#E74C3C',
    textColor: '#0F172A',
    messageColor: '#475569',
  },
  warning: {
    Icon: AlertTriangle,
    border: '#F39C12',
    bg: 'rgba(243,156,18,0.08)',
    iconColor: '#F39C12',
    textColor: '#0F172A',
    messageColor: '#475569',
  },
  info: {
    Icon: Info,
    border: '#3498DB',
    bg: 'rgba(52,152,219,0.08)',
    iconColor: '#3498DB',
    textColor: '#0F172A',
    messageColor: '#475569',
  },
};

/* ─── Single Toast Card ────────────────────────────────────────────────── */
const ToastCard = ({ toast, onDismiss }) => {
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const { Icon } = cfg;
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());
  const elapsed = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    const tick = () => {
      if (!paused) {
        elapsed.current = Date.now() - startTime.current;
        const pct = Math.max(0, 100 - (elapsed.current / TOAST_DURATION) * 100);
        setProgress(pct);
        if (pct <= 0) { onDismiss(toast.id); return; }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [paused]); // eslint-disable-line

  const handleMouseEnter = () => {
    elapsed.current = Date.now() - startTime.current;
    setPaused(true);
  };
  const handleMouseLeave = () => {
    startTime.current = Date.now() - elapsed.current;
    setPaused(false);
  };

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="toast-card"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        borderRadius: 0
      }}
    >
      <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Icon size={18} color={cfg.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.83rem', color: cfg.textColor || '#0F172A', lineHeight: 1.3 }}>
            {toast.title}
          </p>
          {toast.message && (
            <p style={{ margin: '4px 0 0', fontWeight: 300, fontSize: '0.78rem', color: cfg.messageColor || '#475569', lineHeight: 1.5 }}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: cfg.iconColor || cfg.messageColor || '#475569', flexShrink: 0 }}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div style={{ height: '100%', background: cfg.border, width: `${progress}%`, transition: 'none' }} />
      </div>
    </motion.div>
  );
};

/* ─── Provider ─────────────────────────────────────────────────────────── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type, title, message = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — top-right fixed */}
      <div className="toast-container">
        <AnimatePresence mode="sync">
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastCard toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

/* ─── Hook ─────────────────────────────────────────────────────────────── */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.showToast;
};

export default ToastProvider;
