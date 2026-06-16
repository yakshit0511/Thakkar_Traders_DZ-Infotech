import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, X, FolderOpen, MapPin, Star, AlertTriangle, LayoutGrid, List, Edit3, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/admin/ToastNotification';
import '../../styles/admin.css';

const PROJECT_CATEGORIES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'institutional', label: 'Institutional' },
];

/* ── Toggle Switch ─────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, green }) => (
  <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 100, background: checked ? (green ? 'var(--admin-success)' : '#C9A84C') : 'var(--admin-bg-card)', position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
  </div>
);

const TagInput = ({ tags, onChange, placeholder, maxTags = 15 }) => {
  const [input, setInput] = useState('');
  const uid = useRef(Math.random().toString(36).slice(2));
  const onKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim() && tags.length < maxTags) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1));
  };
  return (
    <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)', padding: '8px 10px', minHeight: 44, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', cursor: 'text', borderRadius: 0 }}
      onClick={() => document.getElementById('ti-' + uid.current)?.focus()}>
      {tags.map((t, i) => (
        <span key={i} style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-light)', color: 'var(--admin-text-primary)', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 0 }}>
          {t} <button onClick={e => { e.stopPropagation(); onChange(tags.filter((_, idx) => idx !== i)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', padding: 0, display: 'flex', lineHeight: 1 }}><X size={10} /></button>
        </span>
      ))}
      <input id={'ti-' + uid.current} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', minWidth: 120, flex: 1, borderRadius: 0 }} />
    </div>
  );
};

/* Delete Dialog */
const DeleteDialog = ({ name, onCancel, onConfirm, loading }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(15,23,42,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    onClick={onCancel}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      onClick={e => e.stopPropagation()}
      style={{ background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', borderRadius: 0 }}>
      <Trash2 size={32} color="var(--admin-danger)" style={{ margin: '0 auto 16px' }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>DELETE PROJECT</p>
      <p style={{ fontSize: '0.85rem', fontWeight: 300, color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
        This will permanently delete <strong style={{ color: 'var(--admin-text-primary)' }}>{name}</strong>. This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ background: 'var(--admin-bg-card)', color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border-light)', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0 }}>CANCEL</button>
        <button onClick={onConfirm} disabled={loading} style={{ background: 'var(--admin-danger)', color: '#fff', border: 'none', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', opacity: loading ? 0.6 : 1, borderRadius: 0 }}>
          {loading ? 'DELETING…' : 'DELETE'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Add / Edit Drawer ─────────────────────────────────────────────────── */
const ProjectDrawer = ({ project, onClose, onSaved }) => {
  const isEdit = !!project?._id;
  const showToast = useToast();
  const fileRef = useRef();
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const curYear = new Date().getFullYear();

  const [form, setForm] = useState({
    title: project?.title || '',
    subtitle: project?.subtitle || '',
    location: project?.location || '',
    year: project?.year || curYear,
    category: project?.category || 'residential',
    description: project?.description || '',
    materialsUsed: project?.materialsUsed || [],
    isActive: project?.isActive ?? true,
    isFeatured: project?.isFeatured ?? false,
    displayOrder: project?.displayOrder ?? 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(project?.coverImageUrl || '');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type.startsWith('image/')) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) {
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('warning', 'Project title is required'); return; }
    if (!form.location.trim()) { showToast('warning', 'Location is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k + '[]', item));
        else fd.append(k, v);
      });
      if (imageFile) fd.append('image', imageFile);

      const res = isEdit
        ? await adminAxios.put(`/projects/${project._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await adminAxios.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.data?.success || res.data?.data) {
        showToast('success', isEdit ? 'Project updated successfully' : 'Project created successfully');
        onSaved();
      }
    } catch (err) { showToast('error', err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const inputSt = { background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-primary)', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', borderRadius: 0 };
  const labelSt = { fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', marginBottom: 6, display: 'block' };
  const fieldSt = { marginBottom: 20 };
  const fo = e => e.target.style.borderColor = '#C9A84C';
  const bl = e => e.target.style.borderColor = 'var(--admin-border)';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 195, background: 'rgba(15,23,42,0.12)' }} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 200, width: 'min(580px, 100vw)', background: 'var(--admin-bg-card)', borderLeft: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--admin-border)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: 'var(--admin-text-secondary)' }}>{isEdit ? 'EDIT PROJECT' : 'ADD PROJECT'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)' }}><X size={18} /></button>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 0' }}>
          <div style={fieldSt}>
            <label style={labelSt}>Project Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} style={inputSt} placeholder="e.g. Luxury Villa Interior" onFocus={fo} onBlur={bl} />
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Subtitle</label>
            <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} style={inputSt} placeholder="A short descriptive line shown below the title" onFocus={fo} onBlur={bl} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelSt}>Location *</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} style={inputSt} placeholder="Surat, Gujarat" onFocus={fo} onBlur={bl} />
            </div>
            <div>
              <label style={labelSt}>Year *</label>
              <input type="number" value={form.year} onChange={e => set('year', +e.target.value)} style={inputSt} min={2000} max={2099} onFocus={fo} onBlur={bl} />
            </div>
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputSt}>
              {PROJECT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              style={{ ...inputSt, minHeight: 120, resize: 'vertical' }} placeholder="Project description…" onFocus={fo} onBlur={bl} />
            <p style={{ fontSize: '0.62rem', fontFamily: "'DM Mono', monospace", color: 'var(--admin-text-tertiary)', marginTop: 4 }}>{form.description.length} of 1000 characters</p>
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Materials Used (press Enter to add)</label>
            <TagInput tags={form.materialsUsed} onChange={v => set('materialsUsed', v)} placeholder="e.g. Century BWP Plywood…" maxTags={15} />
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Display Order</label>
            <input type="number" value={form.displayOrder} onChange={e => set('displayOrder', +e.target.value)} style={{ ...inputSt, width: 120 }} onFocus={fo} onBlur={bl} />
          </div>

          {/* Cover Image */}
          <div style={fieldSt}>
            <label style={labelSt}>Cover Image</label>
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: 0 }}>
                <img src={imagePreview} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                <button onClick={() => fileRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'rgba(15,23,42,0.12)', border: 'none', color: 'var(--admin-text-primary)', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 0 }}>
                  <Upload size={12} /> CHANGE IMAGE
                </button>
              </div>
            ) : (
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? '#C9A84C' : 'var(--admin-border-light)'}`, background: isDragging ? 'rgba(201,168,76,0.08)' : 'var(--admin-bg-elevated)', padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 0 }}>
                <Upload size={24} color={isDragging ? '#C9A84C' : 'var(--admin-text-tertiary)'} style={{ margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>Drag and drop or click to select cover image</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", color: 'var(--admin-text-tertiary)', marginTop: 6 }}>Recommended: 1200×800px, JPG or PNG</p>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Toggle checked={form.isActive} onChange={v => set('isActive', v)} green />
              <div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>Visible on Public Site</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: 300, color: 'var(--admin-text-tertiary)', fontFamily: "'Inter', sans-serif" }}>Inactive projects are hidden from visitors</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Toggle checked={form.isFeatured} onChange={v => set('isFeatured', v)} />
              <div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>Featured on Homepage</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: 300, color: 'var(--admin-text-tertiary)', fontFamily: "'Inter', sans-serif" }}>Featured projects appear in the homepage portfolio section</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: '20px 28px', background: 'var(--admin-bg-card)', borderTop: '1px solid var(--admin-border)', flexShrink: 0, display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--admin-border-light)', color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0 }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', background: '#C9A84C', color: 'var(--admin-text-primary)', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1, borderRadius: 0 }}>
            {saving ? 'SAVING…' : 'SAVE PROJECT'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────── */
const AdminProjectsPage = () => {
  const showToast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [drawerProject, setDrawerProject] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [warningDismissed, setWarningDismissed] = useState(() => !!sessionStorage.getItem('proj-warning-dismissed'));

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAxios.get('/projects');
      setProjects(res.data?.data || []);
    } catch { showToast('error', 'Failed to load projects'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetch(); }, [fetch]);

  const activeCount = useMemo(() => projects.filter(p => p.isActive).length, [projects]);
  const showWarning = activeCount < 3 && !warningDismissed;

  const dismissWarning = () => {
    sessionStorage.setItem('proj-warning-dismissed', '1');
    setWarningDismissed(true);
  };

  /* toggle */
  const handleToggle = async (proj, field) => {
    setTogglingId(proj._id + field);
    try {
      if (field === 'isActive') {
        const res = await adminAxios.patch(`/projects/${proj._id}/toggle`);
        setProjects(prev => prev.map(p => p._id === proj._id ? (res.data?.data || { ...p, isActive: !p.isActive }) : p));
        showToast('success', `Project ${proj.isActive ? 'deactivated' : 'activated'}`);
      } else {
        await adminAxios.put(`/projects/${proj._id}`, { ...proj, isFeatured: !proj.isFeatured });
        setProjects(prev => prev.map(p => p._id === proj._id ? { ...p, isFeatured: !p.isFeatured } : p));
        showToast('success', `Featured ${!proj.isFeatured ? 'enabled' : 'disabled'}`);
      }
    } catch { showToast('error', 'Update failed'); }
    finally { setTogglingId(null); }
  };

  /* delete */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAxios.delete(`/projects/${deleteTarget._id}`);
      setProjects(prev => prev.filter(p => p._id !== deleteTarget._id));
      showToast('success', 'Project deleted');
    } catch { showToast('error', 'Delete failed'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <AdminLayout title="Projects">
      {/* Warning Banner */}
      <AnimatePresence>
        {showWarning && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.16)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderRadius: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <AlertTriangle size={16} color="#F39C12" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#F39C12', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                You have fewer than 3 active projects. The homepage portfolio section recommends at least 3 projects for the best appearance.
              </p>
            </div>
            <button onClick={dismissWarning} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.08em', flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 0 }}>DISMISS</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif", margin: 0 }}>PROJECT PORTFOLIO</h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{activeCount} active projects</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--admin-border-light)', overflow: 'hidden', borderRadius: 0 }}>
            {[{ m: 'grid', Icon: LayoutGrid }, { m: 'list', Icon: List }].map(({ m, Icon }) => (
              <button key={m} onClick={() => setViewMode(m)}
                style={{ padding: '8px 12px', background: viewMode === m ? 'var(--admin-bg-card)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === m ? '#C9A84C' : 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', borderRadius: 0 }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button onClick={() => setDrawerProject(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#C9A84C', color: 'var(--admin-text-primary)', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--admin-accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = '#C9A84C'}>
            <PlusCircle size={14} /> ADD PROJECT
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: 320, background: 'var(--admin-bg-elevated)', animation: 'pulse 1.5s infinite', borderRadius: 0 }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', borderRadius: 0 }}>
          <FolderOpen size={48} color="var(--admin-text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif", fontWeight: 300, marginBottom: 8 }}>No projects yet</p>
          <p style={{ color: 'var(--admin-text-tertiary)', fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '0.82rem' }}>Add your first project using the button above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {projects.map(proj => (
              <motion.div key={proj._id} layout exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.25 }}
                style={{ background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', overflow: 'hidden', borderRadius: 0 }}
                className="proj-card-container">
                {/* Image */}
                <div style={{ height: 200, position: 'relative', background: 'var(--admin-bg-card)', overflow: 'hidden' }}>
                  {proj.coverImageUrl
                    ? <img src={proj.coverImageUrl} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FolderOpen size={36} color="var(--admin-text-tertiary)" /></div>
                  }
                  {/* Overlay on hover */}
                  <div className="proj-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: 0, transition: 'opacity 0.25s' }}>
                    <button onClick={() => setDrawerProject(proj)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(15,23,42,0.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-primary)' }}><Edit3 size={20} /></button>
                    <button onClick={() => setDeleteTarget(proj)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(15,23,42,0.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-danger)' }}><Trash2 size={20} /></button>
                  </div>
                  <style>{`.proj-card-container:hover .proj-overlay { opacity: 1 !important; }`}</style>
                </div>

                {/* Body */}
                <div style={{ padding: '18px 20px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>{proj.title}</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '6px 0 10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace", display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} />{proj.location}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{proj.year}</span>
                  </div>
                  <span style={{ background: 'var(--admin-bg-card)', color: '#C9A84C', fontSize: '0.58rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', display: 'inline-block', marginBottom: 14, borderRadius: 0 }}>
                    {PROJECT_CATEGORIES.find(c => c.value === proj.category)?.label || proj.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {togglingId === proj._id + 'isActive' ? (
                        <RefreshCw size={12} className="animate-spin-custom" color="var(--admin-success)" />
                      ) : (
                        <Toggle checked={proj.isActive} onChange={() => handleToggle(proj, 'isActive')} green />
                      )}
                      <span style={{ fontSize: '0.65rem', color: proj.isActive ? 'var(--admin-success)' : 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{proj.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                    {togglingId === proj._id + 'isFeatured' ? (
                      <RefreshCw size={14} className="animate-spin-custom" color="#C9A84C" />
                    ) : (
                      <button onClick={() => handleToggle(proj, 'isFeatured')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.2s', borderRadius: 0 }}
                        title={proj.isFeatured ? 'Remove featured' : 'Mark featured'}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <Star size={16} color={proj.isFeatured ? '#C9A84C' : 'var(--admin-text-tertiary)'} fill={proj.isFeatured ? '#C9A84C' : 'none'} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── List View ── */
        <div style={{ background: 'var(--admin-bg-elevated)', border: '1px solid var(--admin-border)', overflow: 'hidden', borderRadius: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-bg-card)' }}>
                  {['IMAGE', 'TITLE', 'LOCATION', 'YEAR', 'CATEGORY', 'ACTIVE', 'FEATURED', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: 'var(--admin-text-tertiary)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {projects.map(proj => (
                    <motion.tr key={proj._id} layout exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--admin-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--admin-bg-card)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        {proj.coverImageUrl
                          ? <img src={proj.coverImageUrl} alt="" style={{ width: 56, height: 56, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                          : <div style={{ width: 56, height: 56, background: 'var(--admin-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}><FolderOpen size={20} color="var(--admin-text-tertiary)" /></div>
                        }
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, color: 'var(--admin-text-primary)', fontFamily: "'Inter', sans-serif" }}>{proj.title}</p>
                        {proj.subtitle && <p style={{ margin: '3px 0 0', fontSize: '0.75rem', fontWeight: 300, color: 'var(--admin-text-secondary)', fontFamily: "'Inter', sans-serif" }}>{proj.subtitle}</p>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{proj.location}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--admin-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{proj.year}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'var(--admin-bg-card)', color: '#C9A84C', fontSize: '0.58rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 0 }}>
                          {PROJECT_CATEGORIES.find(c => c.value === proj.category)?.label || proj.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {togglingId === proj._id + 'isActive' ? (
                          <RefreshCw size={12} className="animate-spin-custom" color="var(--admin-success)" />
                        ) : (
                          <Toggle checked={proj.isActive} onChange={() => handleToggle(proj, 'isActive')} green />
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {togglingId === proj._id + 'isFeatured' ? (
                          <RefreshCw size={14} className="animate-spin-custom" color="#C9A84C" />
                        ) : (
                          <button onClick={() => handleToggle(proj, 'isFeatured')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 0 }}>
                            <Star size={16} color={proj.isFeatured ? '#C9A84C' : 'var(--admin-text-tertiary)'} fill={proj.isFeatured ? '#C9A84C' : 'none'} />
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setDrawerProject(proj)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', display: 'flex', padding: 4, borderRadius: 0 }}><Edit3 size={16} /></button>
                          <button onClick={() => setDeleteTarget(proj)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', display: 'flex', padding: 4, transition: 'color 0.2s', borderRadius: 0 }}
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
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {drawerProject !== undefined && (
          <ProjectDrawer
            key={drawerProject?._id || 'new'}
            project={drawerProject}
            onClose={() => setDrawerProject(undefined)}
            onSaved={() => { fetch(); setDrawerProject(undefined); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog name={deleteTarget.title} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProjectsPage;
