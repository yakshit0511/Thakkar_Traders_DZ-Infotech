import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Search, Trash2, Download, Eye, X, RefreshCw, Phone,
  MessageCircle, CheckCheck, Check, ChevronLeft, ChevronRight, Filter,
  Calendar, MapPin, AlertCircle, CalendarPlus
} from 'lucide-react';
import { useToast } from '../../components/admin/ToastNotification';
import '../../styles/admin.css';

const PAGE_SIZE = 15;
const DEBOUNCE_MS = 400;

/* ─── helpers ─────────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const fmtTime = (d) => {
  const date = new Date(d);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = String(hours).padStart(2, '0');
  return `${hourStr}:${minutes} ${ampm}`;
};

const statusColor = { new: '#C9A84C', read: 'var(--admin-text-secondary)', replied: 'var(--admin-success)' };
const statusBg    = { new: 'rgba(201,168,76,0.12)', read: 'rgba(122,139,168,0.12)', replied: 'rgba(16,185,129,0.1)' };
const statusLabel = { new: 'NEW', read: 'READ', replied: 'REPLIED' };

/* ─── Custom Checkbox ─────────────────────────────────────────────────── */
const CustomCheckbox = ({ checked, onChange }) => (
  <div onClick={onChange} style={{
    width: 16, height: 16, background: checked ? '#C9A84C' : 'var(--admin-bg-card)',
    border: '1px solid var(--admin-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', borderRadius: 0, flexShrink: 0
  }}>
    {checked && (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </div>
);

/* ─── sub-components ──────────────────────────────────────────────────── */
const StatusBadge = ({ status, loading }) => (
  <span style={{
    background: statusBg[status] || statusBg.new,
    color: statusColor[status] || statusColor.new,
    border: `1px solid ${statusColor[status] || statusColor.new}`,
    padding: '3px 10px', fontSize: '0.62rem', fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.12em', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 0,
  }}>
    {loading && <RefreshCw size={10} className="animate-spin-custom" />}
    {statusLabel[status] || status?.toUpperCase()}
  </span>
);

/* ─── Drawer Button with Hover ────────────────────────────────────────── */
const DrawerButton = ({ href, target, onClick, bg, border, color, icon: Icon, label }) => {
  const [hover, setHover] = useState(false);
  const elementStyle = {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
    background: hover ? bg.replace('0.1', '0.2') : bg,
    border: `1px solid ${border}`,
    color: color, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500,
    textDecoration: 'none', cursor: 'pointer', borderRadius: 0,
    transition: 'background-color 0.2s', width: '100%', boxSizing: 'border-box',
    justifyContent: 'center'
  };
  if (href) {
    return (
      <a href={href} target={target} rel="noreferrer" style={elementStyle}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <Icon size={15} /> {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={elementStyle}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Icon size={15} /> {label}
    </button>
  );
};

/* ─── Delete Dialog ───────────────────────────────────────────────────── */
const DeleteDialog = ({ inquiry, onCancel, onConfirm, loading }) => {
  const isBulk = Array.isArray(inquiry);
  const name = isBulk ? `${inquiry.length} inquiries` : inquiry?.fullName;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onCancel}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', borderRadius: 0 }}
      >
        <Trash2 size={32} color="var(--admin-danger)" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1.0rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
          {isBulk ? 'DELETE INQUIRIES' : 'DELETE INQUIRY'}
        </p>
        <p style={{ fontSize: '0.85rem', fontWeight: 300, color: 'var(--admin-text-secondary)', marginBottom: 28, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          {isBulk
            ? `Are you sure you want to delete ${inquiry.length} inquiries? This action cannot be undone.`
            : `This will permanently delete the inquiry from ${name}. This action cannot be undone.`}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ background: 'var(--admin-bg-card)', color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border-light)', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', borderRadius: 0 }}>
            CANCEL
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ background: 'var(--admin-danger)', color: '#fff', border: 'none', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.6 : 1, borderRadius: 0 }}>
            {loading ? 'DELETING...' : 'DELETE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Detail Drawer ───────────────────────────────────────────────────── */
const DetailDrawer = ({ inquiry, onClose, onStatusChange, onDelete }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(inquiry.status);
  const showToast = useToast();
  const navigate = useNavigate();

  const handleStatusPill = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(true);
    try {
      await adminAxios.patch(`/inquiries/${inquiry._id}/status`, { status: newStatus });
      setCurrentStatus(newStatus);
      onStatusChange(inquiry._id, newStatus);
      showToast('success', 'Status updated successfully');
    } catch {
      showToast('error', 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const waMsg = encodeURIComponent(`Hello, I am following up on your inquiry for ${inquiry.projectType || 'your project'} at Thakkar Traders.`);
  const cleanPhone = inquiry.phoneNumber?.replace(/\D/g, '') || '';
  const prefix = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? '' : '91';
  const waUrl = `https://wa.me/${prefix}${cleanPhone}?text=${waMsg}`;

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--admin-text-tertiary)', marginBottom: 4 }}>{label}</p>
      <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{children}</div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 195, background: 'rgba(15,23,42,0.12)' }} />
      {/* Drawer */}
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 200, width: 'min(480px, 100vw)', background: 'var(--admin-bg-card)', borderLeft: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRadius: 0 }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--admin-border)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: 'var(--admin-text-secondary)' }}>INQUIRY DETAILS</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--admin-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--admin-text-secondary)'}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, flex: 1 }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{inquiry.fullName}</p>
          <StatusBadge status={currentStatus} loading={updatingStatus} />
          <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)', margin: '20px 0' }} />

          <Field label="Phone Number">
            <a href={`tel:${inquiry.phoneNumber}`} style={{ color: 'var(--admin-text-primary)', textDecoration: 'none' }}>{inquiry.phoneNumber}</a>
          </Field>
          <Field label="Email Address">{inquiry.emailAddress || <span style={{ color: 'var(--admin-text-tertiary)', fontStyle: 'italic' }}>Not provided</span>}</Field>
          <Field label="City">{inquiry.city || '—'}</Field>
          <Field label="Project Type"><span style={{ color: '#C9A84C' }}>{inquiry.projectType || '—'}</span></Field>
          <Field label="Material Required">{inquiry.materialRequired || '—'}</Field>
          <Field label="Source">{inquiry.source?.toUpperCase() || 'WEB'}</Field>
          <Field label="Submitted Date">{fmtDate(inquiry.createdAt)} · {fmtTime(inquiry.createdAt)}</Field>

          {inquiry.message && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--admin-text-tertiary)', marginBottom: 8 }}>MESSAGE</p>
              <div style={{ background: 'var(--admin-bg-elevated)', padding: 16, fontSize: '0.88rem', fontWeight: 300, fontFamily: "'Inter', sans-serif", color: 'var(--admin-text-primary)', lineHeight: 1.7, borderRadius: 0 }}>
                {inquiry.message}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
            <DrawerButton
              href={`tel:${inquiry.phoneNumber}`}
              bg="rgba(16,185,129,0.08)"
              border="rgba(16,185,129,0.16)"
              color="var(--admin-success)"
              icon={Phone}
              label="CALL NOW"
            />
            <DrawerButton
              href={waUrl}
              target="_blank"
              bg="rgba(16,185,129,0.08)"
              border="rgba(16,185,129,0.16)"
              color="#25D366"
              icon={MessageCircle}
              label="SEND WHATSAPP"
            />
            {inquiry.emailAddress && (
              <DrawerButton
                href={`mailto:${inquiry.emailAddress}?subject=Following up on your inquiry - Thakkar Traders`}
                bg="rgba(59,130,246,0.08)"
                border="rgba(59,130,246,0.16)"
                color="#3498DB"
                icon={Mail}
                label="SEND EMAIL"
              />
            )}
            <DrawerButton
              onClick={() => {
                const materials = inquiry.materialRequired
                  ? inquiry.materialRequired.split(',').map(s => s.trim()).filter(Boolean)
                  : [];
                const prefill = {
                  clientName: inquiry.fullName || '',
                  clientPhone: inquiry.phoneNumber || '',
                  clientEmail: inquiry.emailAddress || '',
                  clientCity: inquiry.city || '',
                  projectName: inquiry.projectType || '',
                  materialsInterested: materials,
                  linkedInquiryId: inquiry._id,
                };
                onClose();
                navigate(`/admin/followups?prefill=${encodeURIComponent(JSON.stringify(prefill))}`);
              }}
              bg="rgba(201,168,76,0.08)"
              border="rgba(201,168,76,0.2)"
              color="#C9A84C"
              icon={CalendarPlus}
              label="CREATE FOLLOW-UP"
            />
          </div>

          {/* Status Change */}
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--admin-text-tertiary)', marginBottom: 12 }}>CHANGE STATUS</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['new', 'read', 'replied'].map(s => (
                <button key={s} onClick={() => handleStatusPill(s)} disabled={updatingStatus}
                  style={{
                    padding: '6px 16px', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace",
                    letterSpacing: '0.1em', cursor: 'pointer', border: `1px solid ${statusColor[s]}`,
                    background: currentStatus === s ? statusColor[s] : 'transparent',
                    color: currentStatus === s ? 'var(--admin-text-primary)' : statusColor[s], fontWeight: 600,
                    transition: 'all 0.2s', borderRadius: 0
                  }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          <button onClick={() => onDelete(inquiry)} style={{
            marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.14)',
            color: 'var(--admin-danger)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', borderRadius: 0
          }}>
            <Trash2 size={14} /> DELETE INQUIRY
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────── */
const AdminInquiriesPage = () => {
  const showToast = useToast();
  const [allInquiries, setAllInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debounceRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Drawer / Dialog
  const [drawer, setDrawer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatusIds, setUpdatingStatusIds] = useState(new Set());

  /* fetch */
  const fetchInquiries = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await adminAxios.get('/inquiries');
      setAllInquiries(res.data?.data || []);
    } catch {
      showToast('error', 'Failed to fetch inquiries');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  /* debounce search */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  /* filtered list */
  const filtered = useMemo(() => {
    let list = [...allInquiries];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(i => i.fullName?.toLowerCase().includes(q) || i.phoneNumber?.includes(q));
    }
    if (statusFilter) list = list.filter(i => i.status === statusFilter);
    if (dateFrom) {
      const fromTime = new Date(dateFrom).setHours(0, 0, 0, 0);
      list = list.filter(i => new Date(i.createdAt).getTime() >= fromTime);
    }
    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999);
      list = list.filter(i => new Date(i.createdAt).getTime() <= toTime);
    }
    return list;
  }, [allInquiries, debouncedSearch, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* counts for pills */
  const counts = useMemo(() => ({
    '': allInquiries.length,
    new: allInquiries.filter(i => i.status === 'new').length,
    read: allInquiries.filter(i => i.status === 'read').length,
    replied: allInquiries.filter(i => i.status === 'replied').length,
  }), [allInquiries]);

  const unread = counts.new;

  /* selection */
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(prev => prev.size === paged.length ? new Set() : new Set(paged.map(i => i._id)));
  const clearSelection = () => setSelected(new Set());

  /* status update (from table or drawer) */
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingStatusIds(prev => { const n = new Set(prev); n.add(id); return n; });
    try {
      await adminAxios.patch(`/inquiries/${id}/status`, { status: newStatus });
      setAllInquiries(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
      if (drawer?._id === id) setDrawer(prev => ({ ...prev, status: newStatus }));
      showToast('success', 'Status updated successfully');
    } catch {
      showToast('error', 'Failed to update status');
    } finally {
      setUpdatingStatusIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  /* bulk status */
  const bulkStatus = async (newStatus) => {
    try {
      await Promise.all([...selected].map(id => adminAxios.patch(`/inquiries/${id}/status`, { status: newStatus })));
      setAllInquiries(prev => prev.map(i => selected.has(i._id) ? { ...i, status: newStatus } : i));
      showToast('success', `${selected.size} inquiries marked as ${newStatus}`);
      clearSelection();
    } catch {
      showToast('error', 'Bulk status update failed');
    }
  };

  /* delete */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const ids = Array.isArray(deleteTarget) ? deleteTarget : [deleteTarget._id];
      await Promise.all(ids.map(id => adminAxios.delete(`/inquiries/${id}`)));
      setAllInquiries(prev => prev.filter(i => !ids.includes(i._id)));
      if (drawer && ids.includes(drawer._id)) setDrawer(null);
      showToast('success', `${ids.length} ${ids.length === 1 ? 'inquiry' : 'inquiries'} deleted`);
      clearSelection();
    } catch {
      showToast('error', 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* export CSV */
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminAxios.get('/inquiries/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'thakkar-inquiries.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('success', 'CSV exported successfully');
    } catch {
      showToast('error', 'CSV export failed');
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = search || statusFilter || dateFrom || dateTo;

  /* Input style */
  const inputStyle = {
    background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-primary)',
    padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
    outline: 'none', width: '100%', borderRadius: 0,
  };
  const labelStyle = {
    fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em',
    color: 'var(--admin-text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <AdminLayout title="Inquiries">
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif", margin: 0 }}>INQUIRIES</h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
            Showing {allInquiries.length} total inquiries, <span style={{ color: '#C9A84C' }}>{unread} unread</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'EXPORT CSV', icon: <Download size={14} />, onClick: handleExport, loading: exporting },
            { label: 'REFRESH', icon: <RefreshCw size={14} className={refreshing ? 'animate-spin-custom' : ''} />, onClick: () => fetchInquiries(true) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} disabled={btn.loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'transparent', border: '1px solid var(--admin-border-light)', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--admin-border-light)'; e.currentTarget.style.color = 'var(--admin-text-secondary)'; }}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div style={{ background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', padding: '20px 24px', marginBottom: 20, borderRadius: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          {/* Search */}
          <div style={{ flex: '1 1 280px' }}>
            <label style={labelStyle}>Search by Name or Phone</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--admin-text-tertiary)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH BY NAME OR PHONE"
                style={{ ...inputStyle, paddingLeft: 38, fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = 'var(--admin-border)'}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 160px' }}>
            <label style={labelStyle}>Status</label>
            <div style={{ position: 'relative' }}>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ ...inputStyle, padding: '10px 36px 10px 14px', appearance: 'none', WebkitAppearance: 'none' }}>
                <option value="">ALL STATUS</option>
                <option value="new">NEW</option>
                <option value="read">READ</option>
                <option value="replied">REPLIED</option>
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#C9A84C', fontSize: '0.7rem' }}>▼</div>
            </div>
          </div>

          {/* Date From */}
          <div style={{ flex: '0 1 150px' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> FROM</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = 'var(--admin-border)'} />
          </div>

          {/* Date To */}
          <div style={{ flex: '0 1 150px' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> TO</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = 'var(--admin-border)'} />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
              style={{ background: 'none', border: 'none', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', cursor: 'pointer', padding: '10px 0', borderRadius: 0 }}>
              CLEAR
            </button>
          )}
        </div>

        {/* Quick-filter pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'ALL', value: '' },
            { label: 'NEW', value: 'new' },
            { label: 'READ', value: 'read' },
            { label: 'REPLIED', value: 'replied' },
          ].map(pill => (
            <button key={pill.value} onClick={() => { setStatusFilter(pill.value); setPage(1); }}
              style={{
                padding: '5px 14px', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: statusFilter === pill.value ? '#C9A84C' : 'var(--admin-bg-card)',
                color: statusFilter === pill.value ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)', fontWeight: 600,
                borderRadius: 0
              }}>
              {pill.label} ({counts[pill.value]})
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Panel ── */}
      <div style={{ background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', overflow: 'hidden', borderRadius: 0 }}>
        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ background: 'var(--admin-bg-card)', padding: '12px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderRadius: 0 }}>
              <span style={{ fontSize: '0.83rem', fontWeight: 500, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>
                {selected.size} {selected.size === 1 ? 'inquiry' : 'inquiries'} selected
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'MARK AS READ', action: () => bulkStatus('read'), icon: <CheckCheck size={13} /> },
                  { label: 'MARK AS REPLIED', action: () => bulkStatus('replied'), icon: <Check size={13} /> },
                  { label: 'DELETE SELECTED', action: () => setDeleteTarget([...selected]), icon: <Trash2 size={13} />, danger: true },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                      background: 'none', border: `1px solid ${btn.danger ? 'var(--admin-danger)' : 'var(--admin-border-light)'}`,
                      color: btn.danger ? 'var(--admin-danger)' : 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace",
                      fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0
                    }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ padding: 40 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 56, background: 'var(--admin-bg-card)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <Mail size={48} color="var(--admin-text-tertiary)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>No inquiries found</p>
            {hasFilters && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
                style={{ marginTop: 12, color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', borderRadius: 0 }}>
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    {['', 'NAME & CONTACT', 'PROJECT DETAILS', 'CITY', 'DATE', 'STATUS', 'ACTIONS'].map((h, idx) => (
                      <th key={idx} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: 'var(--admin-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', background: 'var(--admin-bg-card)' }}>
                        {h === '' ? (
                          <CustomCheckbox checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} />
                        ) : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paged.map(inq => (
                      <motion.tr key={inq._id} layout exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                        style={{
                          borderBottom: '1px solid var(--admin-border)', cursor: 'pointer', transition: 'background 0.15s',
                          borderLeft: inq.status === 'new' ? '3px solid #C9A84C' : inq.status === 'replied' ? '3px solid var(--admin-success)' : '3px solid transparent',
                          background: selected.has(inq._id) ? 'rgba(201,168,76,0.08)' : 'transparent',
                        }}
                        onMouseEnter={e => { if (!selected.has(inq._id)) e.currentTarget.style.background = 'var(--admin-bg-card)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = selected.has(inq._id) ? 'rgba(201,168,76,0.08)' : 'transparent'; }}
                      >
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <CustomCheckbox checked={selected.has(inq._id)} onChange={() => toggleSelect(inq._id)} />
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={() => setDrawer(inq)}>
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>{inq.fullName}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{inq.phoneNumber}</p>
                          {inq.emailAddress && <p style={{ margin: '1px 0 0', fontSize: '0.75rem', fontWeight: 300, color: 'var(--admin-text-tertiary)', fontFamily: "'Inter', sans-serif" }}>{inq.emailAddress.length > 28 ? inq.emailAddress.slice(0, 28) + '…' : inq.emailAddress}</p>}
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={() => setDrawer(inq)}>
                          <p style={{ margin: 0, fontSize: '0.83rem', color: '#C9A84C', fontFamily: "'Inter', sans-serif" }}>{inq.projectType || '—'}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: 300, color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif" }}>{inq.materialRequired ? (inq.materialRequired.length > 35 ? inq.materialRequired.slice(0, 35) + '…' : inq.materialRequired) : '—'}</p>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.83rem', fontWeight: 300, color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif" }} onClick={() => setDrawer(inq)}>
                          {inq.city ? <><MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />{inq.city}</> : '—'}
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={() => setDrawer(inq)}>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{fmtDate(inq.createdAt)}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: 'var(--admin-text-tertiary)', fontFamily: "'DM Mono', monospace" }}>{fmtTime(inq.createdAt)}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <StatusBadge status={inq.status} loading={updatingStatusIds.has(inq._id)} />
                            <select value={inq.status} onChange={e => handleStatusUpdate(inq._id, e.target.value)} disabled={updatingStatusIds.has(inq._id)}
                              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', borderRadius: 0 }}>
                              <option value="new">NEW</option>
                              <option value="read">READ</option>
                              <option value="replied">REPLIED</option>
                            </select>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setDrawer(inq)} title="VIEW DETAILS"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', padding: 4, display: 'flex', borderRadius: 0 }}>
                              <Eye size={16} />
                            </button>
                            <button onClick={() => setDeleteTarget(inq)} title="DELETE"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', padding: 4, display: 'flex', transition: 'color 0.2s', borderRadius: 0 }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--admin-danger)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--admin-text-secondary)'}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {paged.map(inq => (
                <div key={inq._id} onClick={() => setDrawer(inq)}
                  style={{
                    background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)', padding: 16,
                    borderLeft: `3px solid ${inq.status === 'new' ? '#C9A84C' : inq.status === 'replied' ? 'var(--admin-success)' : 'var(--admin-border)'}`,
                    position: 'relative', borderRadius: 0
                  }}>
                  <div style={{ position: 'absolute', top: 12, right: 12 }} onClick={e => e.stopPropagation()}>
                    <CustomCheckbox checked={selected.has(inq._id)} onChange={() => toggleSelect(inq._id)} />
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>{inq.fullName}</p>
                  <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{inq.phoneNumber}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#C9A84C', fontFamily: "'Inter', sans-serif" }}>{inq.projectType || '—'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginTop: 10 }}>
                    <StatusBadge status={inq.status} loading={updatingStatusIds.has(inq._id)} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-tertiary)', fontFamily: "'DM Mono', monospace" }}>{fmtDate(inq.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--admin-border)', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} inquiries
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ background: 'var(--admin-bg-card)', border: 'none', color: page === 1 ? 'var(--admin-border-light)' : 'var(--admin-text-secondary)', padding: '6px 10px', cursor: page === 1 ? 'default' : 'pointer', borderRadius: 0 }}>
                    <ChevronLeft size={14} />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (page <= 3) p = i + 1;
                      else if (page >= totalPages - 2) p = totalPages - 4 + i;
                      else p = page - 2 + i;
                    }
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ background: page === p ? '#C9A84C' : 'var(--admin-bg-card)', border: 'none', color: page === p ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)', padding: '6px 12px', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', fontWeight: page === p ? 700 : 400, borderRadius: 0 }}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ background: 'var(--admin-bg-card)', border: 'none', color: page === totalPages ? 'var(--admin-border-light)' : 'var(--admin-text-secondary)', padding: '6px 10px', cursor: page === totalPages ? 'default' : 'pointer', borderRadius: 0 }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {drawer && (
          <DetailDrawer
            inquiry={drawer}
            onClose={() => setDrawer(null)}
            onStatusChange={handleStatusUpdate}
            onDelete={(inq) => { setDeleteTarget(inq); setDrawer(null); }}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Dialog ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            inquiry={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;
