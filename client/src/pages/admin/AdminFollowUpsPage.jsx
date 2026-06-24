import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Phone, MessageCircle, Mail, MapPin,
  Eye, Edit3, Trash2, Calendar, ChevronLeft, ChevronRight,
  RefreshCw, CalendarDays, Package, Users, FileText, Circle,
  Tag, Clock, CheckCircle, AlertCircle, TrendingUp, LayoutList,
  CalendarRange, Kanban, IndianRupee, Copy, Check,
} from 'lucide-react';
import { useToast } from '../../components/admin/ToastNotification';
import '../../styles/admin.css';

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

// ─── Constants ────────────────────────────────────────────────────────────────
const CLIENT_TYPES = [
  { value: 'architect', label: 'Architect' },
  { value: 'interior-designer', label: 'Interior Designer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'builder', label: 'Builder' },
  { value: 'furniture-manufacturer', label: 'Furniture Manufacturer' },
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'other', label: 'Other' },
];

const FOLLOW_UP_TYPES = [
  { value: 'call', label: 'Call', icon: Phone, color: '#3B82F6' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#10B981' },
  { value: 'site-visit', label: 'Site Visit', icon: MapPin, color: '#F59E0B' },
  { value: 'email', label: 'Email', icon: Mail, color: '#8B5CF6' },
  { value: 'meeting', label: 'Meeting', icon: Users, color: '#F97316' },
  { value: 'quotation-send', label: 'Quotation', icon: FileText, color: '#06B6D4' },
  { value: 'sample-send', label: 'Sample', icon: Package, color: '#C9A84C' },
  { value: 'other', label: 'Other', icon: Circle, color: '#9CA3AF' },
];

const TIME_OPTIONS = [
  '08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM',
  '05:00 PM','05:30 PM','06:00 PM','06:30 PM','07:00 PM','07:30 PM',
  '08:00 PM','OTHER',
];

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

const STATUS_CONFIG = {
  pending: { label: 'PENDING', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)', color: '#C9A84C' },
  completed: { label: 'COMPLETED', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10B981' },
  rescheduled: { label: 'RESCHEDULED', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3B82F6' },
  cancelled: { label: 'CANCELLED', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)', color: '#9CA3AF' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDay = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
};
const isToday = (d) => {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
};
const fmtIndianCurrency = (val) => {
  if (!val || val === 0) return null;
  return new Intl.NumberFormat('en-IN').format(val);
};
const getTypeConfig = (type) => FOLLOW_UP_TYPES.find(t => t.value === type) || FOLLOW_UP_TYPES[7];

// ─── Shared Sub-Components ────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      padding: '3px 10px', fontSize: '0.62rem', fontFamily: "'DM Mono', monospace",
      letterSpacing: '0.1em', fontWeight: 600, borderRadius: 4, display: 'inline-block',
    }}>
      {cfg.label}
    </span>
  );
};

const PriorityDot = ({ priority, size = 10 }) => (
  <div title={priority?.toUpperCase()} style={{
    width: size, height: size, borderRadius: '50%',
    background: PRIORITY_COLORS[priority] || '#9CA3AF', flexShrink: 0,
  }} />
);

const TagInput = ({ tags, onChange, placeholder, tagStyle }) => {
  const [input, setInput] = useState('');
  const onKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1));
  };
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '8px 10px',
      minHeight: 44, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
      cursor: 'text', borderRadius: 6,
    }} onClick={() => document.getElementById('ti-' + placeholder)?.focus()}>
      {tags.map((t, i) => (
        <span key={i} style={{
          ...{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontSize: '0.78rem', padding: '4px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 },
          ...(tagStyle || {}),
        }}>
          {t}
          <button onClick={e => { e.stopPropagation(); onChange(tags.filter((_, idx) => idx !== i)); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', lineHeight: 1, opacity: 0.7 }}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input id={'ti-' + placeholder} value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={onKey} placeholder={tags.length === 0 ? placeholder : ''}
        style={{ background: 'none', border: 'none', outline: 'none', color: '#111827', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', minWidth: 120, flex: 1 }} />
    </div>
  );
};

const DeleteDialog = ({ name, onCancel, onConfirm, loading }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(15,23,42,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    onClick={onCancel}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      onClick={e => e.stopPropagation()}
      style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', borderRadius: 8 }}>
      <Trash2 size={32} color="#EF4444" style={{ margin: '0 auto 16px' }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>DELETE FOLLOW-UP</p>
      <p style={{ fontSize: '0.85rem', fontWeight: 300, color: '#6B7280', fontFamily: "'Inter', sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
        This will permanently delete the follow-up for <strong style={{ color: '#111827' }}>{name}</strong>. This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ background: '#FFFFFF', color: '#6B7280', border: '1px solid #D1D5DB', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 6 }}>CANCEL</button>
        <button onClick={onConfirm} disabled={loading} style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', opacity: loading ? 0.6 : 1, borderRadius: 6 }}>
          {loading ? 'DELETING…' : 'DELETE'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Add/Edit Drawer ──────────────────────────────────────────────────────────

const FollowUpDrawer = ({ followUp, prefillData, onClose, onSaved }) => {
  const isEdit = !!followUp?._id;
  const showToast = useToast();
  const [saving, setSaving] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const init = {
    clientName: '', clientPhone: '', clientEmail: '', clientCity: '',
    clientType: 'other', projectName: '', materialsInterested: [],
    estimatedValue: '', followUpDate: '', followUpTime: '10:00 AM',
    followUpType: 'call', priority: 'medium', description: '', tags: [],
    status: 'pending', outcome: '', linkedInquiryId: '',
    scheduleNext: false, nextFollowUpDate: '', nextFollowUpTime: '10:00 AM',
  };

  const [form, setForm] = useState(() => {
    if (followUp) {
      const d = followUp.followUpDate ? new Date(followUp.followUpDate).toISOString().split('T')[0] : '';
      return {
        ...init, ...followUp,
        followUpDate: d,
        estimatedValue: followUp.estimatedValue || '',
        linkedInquiryId: followUp.linkedInquiryId?._id || followUp.linkedInquiryId || '',
        scheduleNext: false, nextFollowUpDate: '', nextFollowUpTime: '10:00 AM',
      };
    }
    if (prefillData) return { ...init, ...prefillData };
    return init;
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const inputSt = {
    background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#111827',
    padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
    width: '100%', boxSizing: 'border-box', outline: 'none', borderRadius: 6,
    transition: 'border-color 0.2s',
  };
  const labelSt = {
    fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em',
    color: '#6B7280', textTransform: 'uppercase', marginBottom: 6, display: 'block',
  };
  const fieldSt = { marginBottom: 20 };
  const focus = e => e.target.style.borderColor = '#C9A84C';
  const blur = e => e.target.style.borderColor = '#D1D5DB';
  const sectionLabel = (text) => (
    <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 16, marginTop: 4, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>{text}</p>
  );

  const handleSave = async (andAnother = false) => {
    if (!form.clientName.trim()) { showToast('warning', 'Client name is required'); return; }
    if (!form.clientPhone.trim()) { showToast('warning', 'Phone number is required'); return; }
    if (!form.followUpDate) { showToast('warning', 'Follow-up date is required'); return; }
    setSaving(true);
    try {
      const payload = {
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientEmail: form.clientEmail || undefined,
        clientCity: form.clientCity || undefined,
        clientType: form.clientType,
        projectName: form.projectName || undefined,
        materialsInterested: form.materialsInterested,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : 0,
        followUpDate: form.followUpDate,
        followUpTime: form.followUpTime,
        followUpType: form.followUpType,
        priority: form.priority,
        description: form.description || undefined,
        status: form.status || 'pending',
        tags: form.tags,
        linkedInquiryId: form.linkedInquiryId || undefined,
      };

      if (isEdit && (form.status === 'completed' || form.status === 'rescheduled')) {
        payload.outcome = form.outcome || undefined;
      }

      let res;
      if (isEdit) {
        if (form.scheduleNext && form.nextFollowUpDate) {
          await adminAxios.patch(`/followups/${followUp._id}/status`, {
            status: form.status,
            outcome: form.outcome || undefined,
            nextFollowUpDate: form.nextFollowUpDate,
          });
        }
        res = await adminAxios.put(`/followups/${followUp._id}`, payload);
      } else {
        res = await adminAxios.post('/followups', payload);
        // Update inquiry followUpCreated if linked
        if (form.linkedInquiryId) {
          try {
            await adminAxios.patch(`/inquiries/${form.linkedInquiryId}/status`, {});
          } catch { /* non-critical */ }
        }
      }

      showToast('success', isEdit ? 'Follow-up updated' : 'Follow-up created');
      if (andAnother) {
        setForm(prev => ({ ...init, followUpDate: prev.followUpDate }));
      } else {
        onSaved(res.data?.data);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const showOutcome = isEdit && (form.status === 'completed' || form.status === 'rescheduled');
  const cleanPhone = form.clientPhone?.replace(/\D/g, '') || '';
  const phonePrefix = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? '' : '91';
  const waUrl = `https://wa.me/${phonePrefix}${cleanPhone}`;

  const copyPhone = () => {
    navigator.clipboard.writeText(form.clientPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 195, background: 'rgba(15,23,42,0.12)' }} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 200, width: 'min(620px, 100vw)', background: '#FFFFFF', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: '#6B7280' }}>
            {isEdit ? 'EDIT FOLLOW-UP' : 'ADD FOLLOW-UP'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 0' }}>
          {/* CLIENT INFORMATION */}
          {sectionLabel('Client Information')}

          <div style={fieldSt}>
            <label style={labelSt}>Client Name *</label>
            <input value={form.clientName} onChange={e => set('clientName', e.target.value)} style={inputSt} placeholder="Full client name" onFocus={focus} onBlur={blur} />
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Phone Number *</label>
            <input value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} style={inputSt} placeholder="e.g. 9876543210" onFocus={focus} onBlur={blur} />
            {form.clientPhone && (
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <a href={`tel:${form.clientPhone}`} style={{ fontSize: '0.72rem', color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> CALL
                </a>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#10B981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MessageCircle size={11} /> WHATSAPP
                </a>
                <button onClick={copyPhone} style={{ fontSize: '0.72rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                  {copiedPhone ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY</>}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, ...fieldSt }}>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Email Address</label>
              <input type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} style={inputSt} placeholder="Optional" onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>City</label>
              <input value={form.clientCity} onChange={e => set('clientCity', e.target.value)} style={inputSt} placeholder="Optional" onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, ...fieldSt }}>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Client Type *</label>
              <select value={form.clientType} onChange={e => set('clientType', e.target.value)} style={{ ...inputSt, padding: '10px 14px' }}>
                {CLIENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Estimated Value (₹)</label>
              <input type="number" value={form.estimatedValue} onChange={e => set('estimatedValue', e.target.value)} style={inputSt} placeholder="0" onFocus={focus} onBlur={blur} />
              {form.estimatedValue > 0 && (
                <p style={{ fontSize: '0.72rem', color: '#10B981', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>₹ {fmtIndianCurrency(form.estimatedValue)}</p>
              )}
            </div>
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Project Name</label>
            <input value={form.projectName} onChange={e => set('projectName', e.target.value)} style={inputSt} placeholder="e.g. 3BHK Bungalow Surat" onFocus={focus} onBlur={blur} />
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Materials Interested</label>
            <TagInput tags={form.materialsInterested} onChange={v => set('materialsInterested', v)} placeholder="Type material, press Enter" />
            <p style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>Press Enter after each item</p>
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Tags</label>
            <TagInput tags={form.tags} onChange={v => set('tags', v)} placeholder="e.g. hot-lead, repeat-client" tagStyle={{ background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#374151' }} />
            <p style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>Add labels like hot-lead, repeat-client</p>
          </div>

          {form.linkedInquiryId && (
            <div style={{ ...fieldSt, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={13} color="#C9A84C" />
              <span style={{ fontSize: '0.78rem', color: '#374151', fontFamily: "'Inter', sans-serif" }}>Linked to Inquiry ID: <strong style={{ color: '#C9A84C' }}>{form.linkedInquiryId}</strong></span>
            </div>
          )}

          {/* FOLLOW-UP DETAILS */}
          {sectionLabel('Follow-Up Details')}

          <div style={{ display: 'flex', gap: 12, ...fieldSt }}>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Follow-Up Date *</label>
              <input type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Follow-Up Time</label>
              <select value={form.followUpTime} onChange={e => set('followUpTime', e.target.value)} style={{ ...inputSt, padding: '10px 14px' }}>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Follow-Up Type *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {FOLLOW_UP_TYPES.map(t => {
                const TypeIcon = t.icon;
                const isSelected = form.followUpType === t.value;
                return (
                  <button key={t.value} onClick={() => set('followUpType', t.value)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 8px', gap: 6, border: isSelected ? `2px solid #C9A84C` : '1px solid #E5E7EB',
                    background: isSelected ? 'rgba(201,168,76,0.08)' : '#F9FAFB', borderRadius: 6,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <TypeIcon size={16} color={isSelected ? '#C9A84C' : t.color} />
                    <span style={{ fontSize: '0.65rem', color: isSelected ? '#C9A84C' : '#374151', fontFamily: "'Inter', sans-serif", fontWeight: isSelected ? 600 : 400 }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Priority *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: 'high', label: 'HIGH', selBg: 'rgba(239,68,68,0.1)', selBorder: '#EF4444', selColor: '#EF4444' },
                { value: 'medium', label: 'MEDIUM', selBg: 'rgba(245,158,11,0.1)', selBorder: '#F59E0B', selColor: '#F59E0B' },
                { value: 'low', label: 'LOW', selBg: 'rgba(16,185,129,0.1)', selBorder: '#10B981', selColor: '#10B981' },
              ].map(p => {
                const isSel = form.priority === p.value;
                return (
                  <button key={p.value} onClick={() => set('priority', p.value)} style={{
                    flex: 1, padding: '10px', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
                    fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer', borderRadius: 6,
                    border: `1px solid ${isSel ? p.selBorder : '#E5E7EB'}`,
                    background: isSel ? p.selBg : '#F9FAFB',
                    color: isSel ? p.selColor : '#9CA3AF',
                    transition: 'all 0.15s',
                  }}>{p.label}</button>
                );
              })}
            </div>
          </div>

          <div style={fieldSt}>
            <label style={labelSt}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              style={{ ...inputSt, minHeight: 120, resize: 'vertical' }}
              placeholder="Notes about the follow-up, client requirements, previous conversation…"
              onFocus={focus} onBlur={blur} />
            <p style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: 4, textAlign: 'right', fontFamily: "'Inter', sans-serif" }}>{form.description?.length || 0} of 2000</p>
          </div>

          {/* OUTCOME (edit mode, completed/rescheduled) */}
          {showOutcome && (
            <>
              {sectionLabel('Outcome & Next Steps')}
              <div style={fieldSt}>
                <label style={labelSt}>Outcome</label>
                <textarea value={form.outcome} onChange={e => set('outcome', e.target.value)}
                  style={{ ...inputSt, minHeight: 100, resize: 'vertical' }}
                  placeholder="What happened during this follow-up…"
                  onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ ...fieldSt, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div onClick={() => set('scheduleNext', !form.scheduleNext)} style={{
                  width: 44, height: 24, borderRadius: 100, background: form.scheduleNext ? '#C9A84C' : '#E5E7EB',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.25s',
                }}>
                  <div style={{ position: 'absolute', top: 3, left: form.scheduleNext ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
                </div>
                <span style={{ fontSize: '0.83rem', color: '#111827', fontFamily: "'Inter', sans-serif" }}>Schedule Next Follow-Up</span>
              </div>
              {form.scheduleNext && (
                <div style={{ display: 'flex', gap: 12, ...fieldSt }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelSt}>Next Follow-Up Date</label>
                    <input type="date" value={form.nextFollowUpDate} onChange={e => set('nextFollowUpDate', e.target.value)} style={inputSt} onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelSt}>Next Follow-Up Time</label>
                    <select value={form.nextFollowUpTime} onChange={e => set('nextFollowUpTime', e.target.value)} style={{ ...inputSt, padding: '10px 14px' }}>
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
          <div style={{ height: 24 }} />
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 28px', background: '#FFFFFF', borderTop: '1px solid #E5E7EB', flexShrink: 0, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '11px 20px', background: 'transparent', border: '1px solid #D1D5DB', color: '#6B7280', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer', borderRadius: 6 }}>CANCEL</button>
          {!isEdit && (
            <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: '11px 16px', background: '#F9FAFB', border: '1px solid #D1D5DB', color: '#374151', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', cursor: 'pointer', borderRadius: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <RefreshCw size={13} className="animate-spin-custom" /> : 'SAVE & ADD ANOTHER'}
            </button>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} style={{ flex: 1, padding: '11px', background: '#C9A84C', color: '#fff', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderRadius: 6, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><RefreshCw size={14} className="animate-spin-custom" /> SAVING…</> : 'SAVE FOLLOW-UP'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDrawer = ({ followUp, onClose, onEdit, onDelete, onStatusChange }) => {
  const showToast = useToast();
  const [currentStatus, setCurrentStatus] = useState(followUp.status);
  const [outcome, setOutcome] = useState(followUp.outcome || '');
  const [nextDate, setNextDate] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const cleanPhone = followUp.clientPhone?.replace(/\D/g, '') || '';
  const phonePrefix = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? '' : '91';
  const waMsg = encodeURIComponent(`Hello ${followUp.clientName}, following up regarding ${followUp.projectName || 'your project'} at Thakkar Traders.`);
  const waUrl = `https://wa.me/${phonePrefix}${cleanPhone}?text=${waMsg}`;

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(true);
    try {
      await adminAxios.patch(`/followups/${followUp._id}/status`, {
        status: newStatus,
        outcome: outcome || undefined,
        nextFollowUpDate: scheduleNext && nextDate ? nextDate : undefined,
      });
      setCurrentStatus(newStatus);
      onStatusChange(followUp._id, newStatus);
      showToast('success', 'Status updated');
    } catch { showToast('error', 'Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const typeConfig = getTypeConfig(followUp.followUpType);
  const TypeIcon = typeConfig.icon;
  const fu = followUp;
  const overdueFlag = fu.isOverdue;
  const todayFlag = isToday(fu.followUpDate);

  const DrawerBtn = ({ href, target, onClick, bg, border, color, icon: Icon, label }) => (
    <a href={href} target={target} rel="noreferrer" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', background: bg, border: `1px solid ${border}`, color, textDecoration: 'none', borderRadius: 6, fontSize: '0.8rem', fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: 'pointer', justifyContent: 'center' }}>
      <Icon size={14} /> {label}
    </a>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 195, background: 'rgba(15,23,42,0.12)' }} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 200, width: 'min(480px, 100vw)', background: '#FFFFFF', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: '#6B7280' }}>FOLLOW-UP DETAILS</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {/* Date/Time prominent display */}
          <div style={{ background: overdueFlag ? 'rgba(239,68,68,0.06)' : todayFlag ? 'rgba(201,168,76,0.06)' : '#F9FAFB', border: `1px solid ${overdueFlag ? 'rgba(239,68,68,0.2)' : todayFlag ? 'rgba(201,168,76,0.2)' : '#E5E7EB'}`, borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CalendarDays size={16} color={overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#9CA3AF'} />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#111827', fontFamily: "'Inter', sans-serif" }}>{fmtDate(fu.followUpDate)}</span>
              {overdueFlag && <span style={{ fontSize: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '2px 8px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>OVERDUE</span>}
              {todayFlag && !overdueFlag && <span style={{ fontSize: '0.6rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '2px 8px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>TODAY</span>}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", margin: 0 }}>{fmtDay(fu.followUpDate)} · {fu.followUpTime}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <StatusBadge status={currentStatus} />
              <PriorityDot priority={fu.priority} />
              <span style={{ fontSize: '0.7rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", textTransform: 'capitalize' }}>{fu.priority} priority</span>
            </div>
          </div>

          {/* Client Info */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase' }}>Client Information</p>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{fu.clientName}</p>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>{fu.clientPhone}</p>
            {fu.clientEmail && <p style={{ fontSize: '0.82rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{fu.clientEmail}</p>}
            {fu.clientCity && <p style={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {fu.clientCity}</p>}
            <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '2px 8px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', marginBottom: 16 }}>
              {CLIENT_TYPES.find(c => c.value === fu.clientType)?.label || fu.clientType}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <DrawerBtn href={`tel:${fu.clientPhone}`} bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.2)" color="#10B981" icon={Phone} label="CALL NOW" />
              <DrawerBtn href={waUrl} target="_blank" bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.2)" color="#25D366" icon={MessageCircle} label="SEND WHATSAPP" />
              {fu.clientEmail && <DrawerBtn href={`mailto:${fu.clientEmail}`} bg="rgba(59,130,246,0.08)" border="rgba(59,130,246,0.2)" color="#3B82F6" icon={Mail} label="SEND EMAIL" />}
            </div>
          </div>

          {/* Follow-Up Info */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase' }}>Follow-Up Info</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <TypeIcon size={15} color={typeConfig.color} />
              <span style={{ fontSize: '0.83rem', fontFamily: "'Inter', sans-serif", color: '#374151', textTransform: 'capitalize' }}>{typeConfig.label}</span>
            </div>
            {fu.projectName && <p style={{ fontSize: '0.83rem', color: '#374151', fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>📁 {fu.projectName}</p>}
            {fu.materialsInterested?.length > 0 && <p style={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{fu.materialsInterested.join(', ')}</p>}
            {fu.estimatedValue > 0 && <p style={{ fontSize: '0.83rem', color: '#10B981', fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 8 }}>₹ {fmtIndianCurrency(fu.estimatedValue)}</p>}
            {fu.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {fu.tags.map((t, i) => <span key={i} style={{ fontSize: '0.65rem', background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#6B7280', padding: '2px 8px', borderRadius: 4, fontFamily: "'Inter', sans-serif" }}>{t}</span>)}
              </div>
            )}
            {fu.description && <p style={{ fontSize: '0.83rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginTop: 8, background: '#F9FAFB', padding: '10px 12px', borderRadius: 6 }}>{fu.description}</p>}
          </div>

          {/* Outcome */}
          {fu.outcome && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: '3px solid #10B981', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
              <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>Outcome</p>
              <p style={{ fontSize: '0.83rem', color: '#374151', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{fu.outcome}</p>
            </div>
          )}

          {/* Status Update */}
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase' }}>Update Status</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {['pending', 'completed', 'rescheduled', 'cancelled'].map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setCurrentStatus(s)} disabled={updatingStatus}
                    style={{ padding: '6px 14px', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', cursor: 'pointer', border: `1px solid ${cfg.border}`, background: currentStatus === s ? cfg.color : 'transparent', color: currentStatus === s ? '#fff' : cfg.color, fontWeight: 600, transition: 'all 0.2s', borderRadius: 4 }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            {(currentStatus === 'completed' || currentStatus === 'rescheduled') && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: 16, marginBottom: 12 }}>
                <label style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#6B7280', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Outcome Notes</label>
                <textarea value={outcome} onChange={e => setOutcome(e.target.value)}
                  style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', borderRadius: 6, minHeight: 80, resize: 'vertical' }}
                  placeholder="What happened during this follow-up…" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <div onClick={() => setScheduleNext(!scheduleNext)} style={{ width: 40, height: 22, borderRadius: 100, background: scheduleNext ? '#C9A84C' : '#E5E7EB', position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: scheduleNext ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#374151', fontFamily: "'Inter', sans-serif" }}>Schedule next follow-up</span>
                </div>
                {scheduleNext && (
                  <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)}
                    style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', borderRadius: 6, marginTop: 10 }} />
                )}
              </div>
            )}
            <button onClick={() => handleStatusUpdate(currentStatus)} disabled={updatingStatus}
              style={{ width: '100%', padding: '11px', background: '#C9A84C', color: '#fff', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderRadius: 6, opacity: updatingStatus ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {updatingStatus ? <><RefreshCw size={14} className="animate-spin-custom" /> UPDATING…</> : 'SAVE STATUS UPDATE'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => onEdit(followUp)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: 'transparent', border: '1px solid #D1D5DB', color: '#374151', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer', borderRadius: 6 }}>
              <Edit3 size={13} /> EDIT THIS FOLLOW-UP
            </button>
            <button onClick={() => onDelete(followUp)} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer', borderRadius: 6 }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ─── Kanban Card ──────────────────────────────────────────────────────────────

const KanbanCard = ({ fu, onEdit, onView, onDelete, onDragStart, onDragEnd }) => {
  const typeConfig = getTypeConfig(fu.followUpType);
  const TypeIcon = typeConfig.icon;
  const overdueFlag = fu.isOverdue;
  const todayFlag = isToday(fu.followUpDate);
  const cleanPhone = fu.clientPhone?.replace(/\D/g, '') || '';
  const phonePrefix = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? '' : '91';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 6, marginBottom: 8, padding: '14px 16px', cursor: 'grab', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PriorityDot priority={fu.priority} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TypeIcon size={11} color={typeConfig.color} />
          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif" }}>{typeConfig.label}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif", marginTop: 8, marginBottom: 4 }}>{fu.clientName}</p>
      <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '2px 8px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block' }}>
        {CLIENT_TYPES.find(c => c.value === fu.clientType)?.label || fu.clientType}
      </span>
      {fu.projectName && <p style={{ fontSize: '0.78rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fu.projectName}</p>}
      <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '10px 0' }} />
      <p style={{ fontSize: '0.78rem', color: overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#374151', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <CalendarDays size={12} color={overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#9CA3AF'} />
        {fmtDate(fu.followUpDate)} · {fu.followUpTime}
      </p>
      {fu.estimatedValue > 0 && <p style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>₹ {fmtIndianCurrency(fu.estimatedValue)}</p>}
      {fu.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {fu.tags.slice(0, 3).map((t, i) => <span key={i} style={{ fontSize: '0.65rem', background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#6B7280', padding: '2px 6px', borderRadius: 3, fontFamily: "'Inter', sans-serif" }}>{t}</span>)}
          {fu.tags.length > 3 && <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif" }}>+{fu.tags.length - 3}</span>}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        {fu.status === 'pending' && (
          <a href={`tel:${fu.clientPhone}`} style={{ fontSize: '0.72rem', color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Phone size={11} /> CALL NOW
          </a>
        )}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button onClick={() => onView(fu)} title="View" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 3, display: 'flex' }}><Eye size={14} /></button>
          <button onClick={() => onEdit(fu)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 3, display: 'flex' }}><Edit3 size={14} /></button>
          <button onClick={() => onDelete(fu)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 3, display: 'flex', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminFollowUpsPage = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Data state
  const [allFollowUps, setAllFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ pendingCount: 0, overdueCount: 0, todayCount: 0, thisWeekCount: 0, highPriorityCount: 0, totalPipelineValue: 0 });

  // View
  const [view, setView] = useState(() => localStorage.getItem('thakkar_crm_view') || 'list');
  const setViewAndSave = (v) => { setView(v); localStorage.setItem('thakkar_crm_view', v); };

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('');
  const [followUpTypeFilter, setFollowUpTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  // Modals/Drawers
  const [drawerFollowUp, setDrawerFollowUp] = useState(undefined); // undefined=closed, null=new
  const [prefillData, setPrefillData] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatusIds, setUpdatingStatusIds] = useState(new Set());

  // Calendar state
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calData, setCalData] = useState({});
  const [calLoading, setCalLoading] = useState(false);

  // Kanban drag
  const [dragId, setDragId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // ── Prefill from URL params (from Inquiries page) ──
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill) {
      try {
        const data = JSON.parse(decodeURIComponent(prefill));
        setPrefillData(data);
        setDrawerFollowUp(null); // open add drawer
      } catch { /* ignore */ }
    }
  }, [searchParams]);

  // ── Fetch ──
  const fetchFollowUps = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAxios.get('/followups');
      setAllFollowUps(res.data?.data || []);
      setSummary({
        pendingCount: res.data?.pendingCount || 0,
        overdueCount: res.data?.overdueCount || 0,
        todayCount: res.data?.todayCount || 0,
        thisWeekCount: res.data?.thisWeekCount || 0,
        highPriorityCount: res.data?.highPriorityCount || 0,
        totalPipelineValue: res.data?.totalPipelineValue || 0,
      });
    } catch { showToast('error', 'Failed to fetch follow-ups'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  // ── Debounce search ──
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + (6 - now.getDay())); endOfWeek.setHours(23, 59, 59, 999);

    let list = [...allFollowUps];

    // Quick filters
    if (quickFilter === 'pending') list = list.filter(f => f.status === 'pending');
    else if (quickFilter === 'completed') list = list.filter(f => f.status === 'completed');
    else if (quickFilter === 'overdue') list = list.filter(f => f.isOverdue);
    else if (quickFilter === 'today') list = list.filter(f => isToday(f.followUpDate));
    else if (quickFilter === 'high') list = list.filter(f => f.priority === 'high' && f.status === 'pending');

    // Dropdown filters
    if (statusFilter) list = list.filter(f => f.status === statusFilter);
    if (priorityFilter) list = list.filter(f => f.priority === priorityFilter);
    if (clientTypeFilter) list = list.filter(f => f.clientType === clientTypeFilter);
    if (followUpTypeFilter) list = list.filter(f => f.followUpType === followUpTypeFilter);
    if (dateFrom) list = list.filter(f => new Date(f.followUpDate) >= new Date(dateFrom + 'T00:00:00'));
    if (dateTo) list = list.filter(f => new Date(f.followUpDate) <= new Date(dateTo + 'T23:59:59'));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(f => f.clientName?.toLowerCase().includes(q) || f.clientPhone?.includes(q) || f.projectName?.toLowerCase().includes(q));
    }
    return list;
  }, [allFollowUps, quickFilter, statusFilter, priorityFilter, clientTypeFilter, followUpTypeFilter, dateFrom, dateTo, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Calendar fetch ──
  useEffect(() => {
    if (view !== 'calendar') return;
    const fetchCal = async () => {
      setCalLoading(true);
      try {
        const res = await adminAxios.get(`/followups/calendar/month?year=${calYear}&month=${calMonth}`);
        setCalData(res.data?.data || {});
      } catch { /* ignore */ }
      finally { setCalLoading(false); }
    };
    fetchCal();
  }, [view, calYear, calMonth]);

  // ── Status update ──
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingStatusIds(prev => { const n = new Set(prev); n.add(id); return n; });
    try {
      await adminAxios.patch(`/followups/${id}/status`, { status: newStatus });
      setAllFollowUps(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
      showToast('success', 'Status updated');
    } catch { showToast('error', 'Failed to update status'); }
    finally { setUpdatingStatusIds(prev => { const n = new Set(prev); n.delete(id); return n; }); }
  };

  // ── Delete ──
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAxios.delete(`/followups/${deleteTarget._id}`);
      setAllFollowUps(prev => prev.filter(f => f._id !== deleteTarget._id));
      if (detailItem?._id === deleteTarget._id) setDetailItem(null);
      showToast('success', 'Follow-up deleted');
    } catch { showToast('error', 'Delete failed'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  // ── Kanban drag ──
  const handleDrop = async (targetStatus) => {
    if (!dragId || !targetStatus || dragId === targetStatus) return;
    const fu = allFollowUps.find(f => f._id === dragId);
    if (!fu || fu.status === targetStatus) return;
    setAllFollowUps(prev => prev.map(f => f._id === dragId ? { ...f, status: targetStatus } : f));
    try {
      await adminAxios.patch(`/followups/${dragId}/status`, { status: targetStatus });
      showToast('success', `Moved to ${targetStatus}`);
    } catch {
      setAllFollowUps(prev => prev.map(f => f._id === dragId ? { ...f, status: fu.status } : f));
      showToast('error', 'Failed to update status');
    }
    setDragId(null);
    setDragOverStatus(null);
  };

  // ── Shared styles ──
  const inputSt = { background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', outline: 'none', borderRadius: 6, transition: 'border-color 0.2s' };
  const selectSt = { ...inputSt, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32 };
  const labelSt = { fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#6B7280', textTransform: 'uppercase', marginBottom: 4, display: 'block' };

  // ─── CALENDAR VIEW ───────────────────────────────────────────────────────────
  const renderCalendar = () => {
    const firstDay = new Date(calYear, calMonth - 1, 1);
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    const startDow = firstDay.getDay();
    const todayDate = new Date();
    const cells = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < startDow; i++) cells.push({ day: null, key: `p${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, events: calData[dateStr] || [], key: dateStr });
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < remaining; i++) cells.push({ day: null, key: `n${i}` });

    const isCurrentDay = (d) => d && todayDate.getFullYear() === calYear && todayDate.getMonth() + 1 === calMonth && todayDate.getDate() === d;

    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
        {/* Calendar header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <button onClick={() => { if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); } else setCalMonth(m => m - 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 6 }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif" }}>{monthNames[calMonth - 1]} {calYear}</span>
          <button onClick={() => { if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); } else setCalMonth(m => m + 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 6 }}><ChevronRight size={16} /></button>
        </div>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB' }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: '0.72rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        {calLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>Loading calendar…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map(cell => (
              <div key={cell.key}
                onClick={() => { if (cell.day) { const dateStr = cell.dateStr; setPrefillData({ followUpDate: dateStr }); setDrawerFollowUp(null); } }}
                style={{ minHeight: 90, borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '6px 4px', background: cell.day ? '#FFFFFF' : '#F9FAFB', cursor: cell.day ? 'pointer' : 'default', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (cell.day) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { if (cell.day) e.currentTarget.style.background = '#FFFFFF'; }}
              >
                {cell.day && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                      <span style={isCurrentDay(cell.day) ? { width: 24, height: 24, borderRadius: '50%', background: '#C9A84C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Inter', sans-serif" } : { fontSize: '0.75rem', color: '#374151', fontFamily: "'Inter', sans-serif" }}>{cell.day}</span>
                    </div>
                    {cell.events?.slice(0, 2).map((ev, i) => (
                      <div key={i} onClick={e => { e.stopPropagation(); setDetailItem(ev); }}
                        style={{ background: ev.priority === 'high' ? 'rgba(239,68,68,0.85)' : ev.priority === 'medium' ? 'rgba(245,158,11,0.85)' : 'rgba(16,185,129,0.85)', borderRadius: 3, padding: '0 6px', height: 20, display: 'flex', alignItems: 'center', marginBottom: 2, cursor: 'pointer' }}>
                        <span style={{ fontSize: '0.68rem', color: '#fff', fontFamily: "'Inter', sans-serif", fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{ev.clientName}</span>
                      </div>
                    ))}
                    {cell.events?.length > 2 && <p style={{ fontSize: '0.68rem', color: '#6B7280', fontFamily: "'Inter', sans-serif", marginTop: 2, paddingLeft: 4 }}>+{cell.events.length - 2} more</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── KANBAN VIEW ─────────────────────────────────────────────────────────────
  const KANBAN_COLUMNS = [
    { status: 'pending', label: 'PENDING', accent: '#C9A84C' },
    { status: 'completed', label: 'COMPLETED', accent: '#10B981' },
    { status: 'rescheduled', label: 'RESCHEDULED', accent: '#3B82F6' },
    { status: 'cancelled', label: 'CANCELLED', accent: '#9CA3AF' },
  ];

  const renderKanban = () => (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {KANBAN_COLUMNS.map(col => {
        const colItems = allFollowUps.filter(f => f.status === col.status);
        const isDragOver = dragOverStatus === col.status;
        return (
          <div key={col.status}
            onDragOver={e => { e.preventDefault(); setDragOverStatus(col.status); }}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={() => handleDrop(col.status)}
            style={{ minWidth: 280, width: 280, flexShrink: 0, background: isDragOver ? 'rgba(201,168,76,0.04)' : '#FFFFFF', border: `1px solid ${isDragOver ? 'rgba(201,168,76,0.3)' : '#E5E7EB'}`, borderTop: `3px solid ${col.accent}`, borderRadius: 8, transition: 'all 0.2s' }}>
            {/* Column header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif" }}>{col.label}</span>
              <span style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.65rem', padding: '2px 7px', borderRadius: 10, fontFamily: "'DM Mono', monospace" }}>{colItems.length}</span>
            </div>
            {/* Cards */}
            <div style={{ padding: '10px 10px 0', maxHeight: 600, overflowY: 'auto' }}>
              {colItems.map(fu => (
                <KanbanCard key={fu._id} fu={fu}
                  onView={setDetailItem} onEdit={f => { setDrawerFollowUp(f); setPrefillData(null); }}
                  onDelete={setDeleteTarget}
                  onDragStart={() => setDragId(fu._id)}
                  onDragEnd={() => { setDragId(null); setDragOverStatus(null); }}
                />
              ))}
            </div>
            {/* Add button */}
            <div style={{ padding: '8px 10px 10px' }}>
              <button onClick={() => { setPrefillData({ status: col.status }); setDrawerFollowUp(null); }}
                style={{ width: '100%', padding: '8px', border: '1px dashed #D1D5DB', background: 'transparent', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#9CA3AF'; }}>
                <Plus size={13} /> ADD FOLLOW-UP
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  const renderList = () => (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
      {loading ? (
        <div style={{ padding: 40 }}>
          {[...Array(5)].map((_, i) => <div key={i} style={{ height: 56, background: '#F3F4F6', marginBottom: 8, borderRadius: 4, opacity: 0.6 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <CalendarDays size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#9CA3AF', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>No follow-ups found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F3F4F6' }}>
                  {['', 'CLIENT', 'PROJECT', 'FOLLOW-UP DATE', 'TYPE', 'VALUE', 'STATUS', 'ACTIONS'].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paged.map(fu => {
                    const overdueFlag = fu.isOverdue;
                    const todayFlag = isToday(fu.followUpDate);
                    const typeConfig = getTypeConfig(fu.followUpType);
                    const TypeIcon = typeConfig.icon;
                    const leftBorder = overdueFlag ? '3px solid #EF4444' : todayFlag ? '3px solid #C9A84C' : '3px solid transparent';
                    return (
                      <motion.tr key={fu._id} layout exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                        style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s', borderLeft: leftBorder, opacity: fu.status === 'completed' ? 0.6 : 1 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px' }}><PriorityDot priority={fu.priority} /></td>
                        <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setDetailItem(fu)}>
                          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, color: '#111827', fontFamily: "'Inter', sans-serif" }}>{fu.clientName}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>{fu.clientPhone}</p>
                          <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '2px 8px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', marginTop: 4 }}>
                            {CLIENT_TYPES.find(c => c.value === fu.clientType)?.label || fu.clientType}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setDetailItem(fu)}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', fontFamily: "'Inter', sans-serif", maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {fu.projectName || <span style={{ color: '#D1D5DB' }}>—</span>}
                          </p>
                          {fu.materialsInterested?.length > 0 && <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fu.materialsInterested.join(', ')}</p>}
                        </td>
                        <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setDetailItem(fu)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#374151', fontFamily: "'Inter', sans-serif" }}>{fmtDate(fu.followUpDate)}</p>
                            {overdueFlag && <span style={{ fontSize: '0.55rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '1px 6px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>OVERDUE</span>}
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#9CA3AF', fontFamily: "'Inter', sans-serif" }}>{fmtDay(fu.followUpDate)} · {fu.followUpTime}</p>
                        </td>
                        <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setDetailItem(fu)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TypeIcon size={13} color={typeConfig.color} />
                            <span style={{ fontSize: '0.72rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>{typeConfig.label.toUpperCase()}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setDetailItem(fu)}>
                          {fu.estimatedValue > 0
                            ? <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10B981', fontFamily: "'Inter', sans-serif" }}>₹{fmtIndianCurrency(fu.estimatedValue)}</span>
                            : <span style={{ color: '#D1D5DB' }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div>
                            <StatusBadge status={fu.status} />
                            <div style={{ position: 'relative', marginTop: 4 }}>
                              <select value={fu.status} onChange={e => handleStatusUpdate(fu._id, e.target.value)} disabled={updatingStatusIds.has(fu._id)}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}>
                                {['pending', 'completed', 'rescheduled', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <span style={{ fontSize: '0.6rem', color: '#9CA3AF', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', userSelect: 'none' }}>▼ CHANGE</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setDetailItem(fu)} title="View" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex' }}><Eye size={15} /></button>
                            <button onClick={() => { setDrawerFollowUp(fu); setPrefillData(null); }} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex' }}><Edit3 size={15} /></button>
                            <button onClick={() => setDeleteTarget(fu)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paged.map(fu => {
              const overdueFlag = fu.isOverdue;
              const todayFlag = isToday(fu.followUpDate);
              return (
                <div key={fu._id} onClick={() => setDetailItem(fu)} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: `3px solid ${overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#E5E7EB'}`, padding: 16, borderRadius: 8, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif" }}>{fu.clientName}</p>
                      <p style={{ margin: '2px 0', fontSize: '0.75rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>{fu.clientPhone}</p>
                    </div>
                    <PriorityDot priority={fu.priority} size={10} />
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: overdueFlag ? '#EF4444' : todayFlag ? '#C9A84C' : '#374151', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{fmtDate(fu.followUpDate)} · {fu.followUpTime}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <StatusBadge status={fu.status} />
                    {fu.estimatedValue > 0 && <span style={{ fontSize: '0.78rem', color: '#10B981', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>₹{fmtIndianCurrency(fu.estimatedValue)}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #E5E7EB', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: '0.65rem', color: '#6B7280', fontFamily: "'DM Mono', monospace" }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: page === 1 ? '#E5E7EB' : '#6B7280', padding: '6px 10px', cursor: page === 1 ? 'default' : 'pointer', borderRadius: 6 }}>
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
                      style={{ background: page === p ? '#C9A84C' : '#FFFFFF', border: '1px solid #E5E7EB', color: page === p ? '#fff' : '#6B7280', padding: '6px 12px', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', fontWeight: page === p ? 700 : 400, borderRadius: 6 }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: page === totalPages ? '#E5E7EB' : '#6B7280', padding: '6px 10px', cursor: page === totalPages ? 'default' : 'pointer', borderRadius: 6 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="CRM Follow-Ups">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', fontFamily: "'Inter', sans-serif", margin: 0 }}>CRM FOLLOW-UPS</h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 300, color: '#6B7280', fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Track client interactions and never miss a follow-up.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #D1D5DB', borderRadius: 6, overflow: 'hidden' }}>
            {[
              { v: 'list', icon: LayoutList, label: 'LIST' },
              { v: 'calendar', icon: CalendarRange, label: 'CALENDAR' },
              { v: 'kanban', icon: Kanban, label: 'KANBAN' },
            ].map(({ v, icon: Icon, label }) => (
              <button key={v} onClick={() => setViewAndSave(v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', background: view === v ? '#C9A84C' : '#FFFFFF', color: view === v ? '#fff' : '#374151', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: view === v ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', borderRight: '1px solid #D1D5DB' }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
          {/* Add button */}
          <button onClick={() => { setPrefillData(null); setDrawerFollowUp(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#C9A84C', color: '#fff', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#B8963C'}
            onMouseLeave={e => e.currentTarget.style.background = '#C9A84C'}>
            <Plus size={14} /> ADD FOLLOW-UP
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { label: 'TODAY', count: summary.todayCount, countColor: '#111827', sub: 'follow-ups due', accentBorder: false },
          { label: 'OVERDUE', count: summary.overdueCount, countColor: '#EF4444', sub: 'need immediate attention', subColor: '#EF4444', accentBorder: summary.overdueCount > 0 },
          { label: 'THIS WEEK', count: summary.thisWeekCount, countColor: '#111827', sub: 'upcoming', accentBorder: false },
          { label: 'HIGH PRIORITY', count: summary.highPriorityCount, countColor: '#F59E0B', sub: 'pending actions', accentBorder: false },
        ].map(tile => (
          <div key={tile.label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: tile.accentBorder ? '3px solid #EF4444' : undefined, borderRadius: 8, padding: '16px 20px', minWidth: 140, flexShrink: 0 }}>
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 6px' }}>{tile.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: tile.countColor, fontFamily: "'Inter', sans-serif", margin: '0 0 4px', lineHeight: 1 }}>{tile.count}</p>
            <p style={{ fontSize: '0.72rem', color: tile.subColor || '#9CA3AF', fontFamily: "'Inter', sans-serif", margin: 0 }}>{tile.sub}</p>
          </div>
        ))}
        {/* Pipeline value tile */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px', minWidth: 160, flexShrink: 0 }}>
          <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 6px' }}>PIPELINE VALUE</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#10B981', fontFamily: "'Inter', sans-serif", margin: '0 0 4px', lineHeight: 1.2 }}>₹{fmtIndianCurrency(summary.totalPipelineValue) || '0'}</p>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: "'Inter', sans-serif", margin: 0 }}>from pending follow-ups</p>
        </div>
      </div>

      {/* Filter Panel (list view only) */}
      {view === 'list' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            {/* Search */}
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <label style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#6B7280', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={13} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="CLIENT NAME, PHONE OR PROJECT"
                  style={{ ...inputSt, paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
              </div>
            </div>
            {/* Status */}
            <div style={{ flex: '0 1 140px' }}>
              <label style={labelSt}>Status</label>
              <div style={{ position: 'relative' }}>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...selectSt, width: '100%' }}>
                  <option value="">ALL STATUS</option>
                  {['pending', 'completed', 'rescheduled', 'cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '0.7rem', pointerEvents: 'none' }}>▼</span>
              </div>
            </div>
            {/* Priority */}
            <div style={{ flex: '0 1 130px' }}>
              <label style={labelSt}>Priority</label>
              <div style={{ position: 'relative' }}>
                <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} style={{ ...selectSt, width: '100%' }}>
                  <option value="">ALL PRIORITY</option>
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                  <option value="low">LOW</option>
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '0.7rem', pointerEvents: 'none' }}>▼</span>
              </div>
            </div>
            {/* Client Type */}
            <div style={{ flex: '0 1 160px' }}>
              <label style={labelSt}>Client Type</label>
              <div style={{ position: 'relative' }}>
                <select value={clientTypeFilter} onChange={e => { setClientTypeFilter(e.target.value); setPage(1); }} style={{ ...selectSt, width: '100%' }}>
                  <option value="">ALL TYPES</option>
                  {CLIENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '0.7rem', pointerEvents: 'none' }}>▼</span>
              </div>
            </div>
            {/* Follow-Up Type */}
            <div style={{ flex: '0 1 150px' }}>
              <label style={labelSt}>Follow-Up Type</label>
              <div style={{ position: 'relative' }}>
                <select value={followUpTypeFilter} onChange={e => { setFollowUpTypeFilter(e.target.value); setPage(1); }} style={{ ...selectSt, width: '100%' }}>
                  <option value="">ALL TYPES</option>
                  {FOLLOW_UP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '0.7rem', pointerEvents: 'none' }}>▼</span>
              </div>
            </div>
            {/* Date From */}
            <div style={{ flex: '0 1 140px' }}>
              <label style={labelSt}>From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputSt, width: '100%', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
            </div>
            {/* Date To */}
            <div style={{ flex: '0 1 140px' }}>
              <label style={labelSt}>To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputSt, width: '100%', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
            </div>
          </div>

          {/* Quick filter pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'ALL', count: allFollowUps.length },
              { key: 'pending', label: 'PENDING', count: summary.pendingCount },
              { key: 'completed', label: 'COMPLETED', count: summary.completedCount },
              { key: 'overdue', label: 'OVERDUE', count: summary.overdueCount, danger: true },
              { key: 'today', label: 'TODAY', count: summary.todayCount },
              { key: 'high', label: 'HIGH PRIORITY', count: summary.highPriorityCount },
            ].map(pill => (
              <button key={pill.key} onClick={() => { setQuickFilter(pill.key); setPage(1); }}
                style={{ padding: '5px 14px', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: 'all 0.2s', borderRadius: 4, fontWeight: 600, background: quickFilter === pill.key ? (pill.danger ? '#EF4444' : '#C9A84C') : '#FFFFFF', color: quickFilter === pill.key ? '#fff' : (pill.danger && pill.count > 0 ? '#EF4444' : '#374151'), boxShadow: quickFilter === pill.key ? 'none' : '0 0 0 1px #D1D5DB inset' }}>
                {pill.label} ({pill.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      {view === 'list' && renderList()}
      {view === 'calendar' && renderCalendar()}
      {view === 'kanban' && renderKanban()}

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {drawerFollowUp !== undefined && (
          <FollowUpDrawer
            key={drawerFollowUp?._id || 'new'}
            followUp={drawerFollowUp}
            prefillData={prefillData}
            onClose={() => { setDrawerFollowUp(undefined); setPrefillData(null); }}
            onSaved={(saved) => {
              fetchFollowUps(true);
              setDrawerFollowUp(undefined);
              setPrefillData(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {detailItem && (
          <DetailDrawer
            key={detailItem._id}
            followUp={detailItem}
            onClose={() => setDetailItem(null)}
            onEdit={(fu) => { setDetailItem(null); setDrawerFollowUp(fu); setPrefillData(null); }}
            onDelete={(fu) => { setDetailItem(null); setDeleteTarget(fu); }}
            onStatusChange={(id, newStatus) => {
              setAllFollowUps(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            name={deleteTarget.clientName}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminFollowUpsPage;
