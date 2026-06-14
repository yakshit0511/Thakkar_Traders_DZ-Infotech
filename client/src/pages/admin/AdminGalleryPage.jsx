import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, X, Star, Edit3, Image as ImageIcon, RefreshCw
} from 'lucide-react';
import { useToast } from '../../components/admin/ToastNotification';
import '../../styles/admin.css';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'living-room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'office', label: 'Office' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'material-closeup', label: 'Material Closeup' },
  { value: 'featured', label: 'Featured' }
];

const UPLOAD_CATEGORIES = CATEGORIES.filter(c => c.value && c.value !== 'featured');

/* ── Toggle Switch ─────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 100, background: checked ? '#C9A84C' : '#1C2640', position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
  </div>
);

/* ── Delete Dialog ─────────────────────────────────────────────────────── */
const DeleteDialog = ({ img, onCancel, onConfirm, loading }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    onClick={onCancel}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      onClick={e => e.stopPropagation()}
      style={{ background: '#151D2E', border: '1px solid #1F2D45', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', borderRadius: 0 }}>
      {img?.imageUrl && <img src={img.imageUrl} alt="" style={{ width: 80, height: 80, objectFit: 'cover', margin: '0 auto 16px', display: 'block', borderRadius: 0 }} />}
      <Trash2 size={32} color="#E74C3C" style={{ margin: '0 auto 12px' }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#E8EDF5', fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>DELETE IMAGE</p>
      <p style={{ fontSize: '0.85rem', fontWeight: 300, color: '#7A8BA8', fontFamily: "'Inter', sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
        This will permanently delete this image from the gallery and Cloudinary. This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ background: '#1C2640', color: '#7A8BA8', border: '1px solid #2A3D5C', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0 }}>CANCEL</button>
        <button onClick={onConfirm} disabled={loading} style={{ background: '#E74C3C', color: '#fff', border: 'none', padding: '12px 24px', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', opacity: loading ? 0.6 : 1, borderRadius: 0 }}>
          {loading ? 'DELETING…' : 'DELETE'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Edit Modal ────────────────────────────────────────────────────────── */
const EditModal = ({ img, onClose, onSave }) => {
  const [caption, setCaption] = useState(img.caption || '');
  const [category, setCategory] = useState(img.category || 'material-closeup');
  const [isFeatured, setIsFeatured] = useState(img.isFeatured ?? false);
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminAxios.patch(`/gallery/${img._id}`, { caption, category, isFeatured });
      if (res.data?.success) { onSave(img._id, { caption, category, isFeatured }); showToast('success', 'Image updated'); }
    } catch { showToast('error', 'Update failed'); }
    finally { setSaving(false); }
  };

  const inputSt = { background: '#0F1520', border: '1px solid #1F2D45', color: '#E8EDF5', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', borderRadius: 0 };
  const labelSt = { fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#7A8BA8', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(8,12,20,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#0F1520', border: '1px solid #1F2D45', maxWidth: 480, width: '100%', overflow: 'hidden', borderRadius: 0 }}>
        <img src={img.imageUrl} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: '#7A8BA8' }}>EDIT IMAGE</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8' }}><X size={16} /></button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Caption</label>
            <input value={caption} onChange={e => setCaption(e.target.value)} style={inputSt} placeholder="Image caption…" onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#1F2D45'} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputSt}>
              {UPLOAD_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Toggle checked={isFeatured} onChange={setIsFeatured} />
            <span style={{ fontSize: '0.83rem', color: '#E8EDF5', fontFamily: "'Inter', sans-serif" }}>Featured Image</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#1C2640', color: '#7A8BA8', border: '1px solid #2A3D5C', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0 }}>CANCEL</button>
            <button onClick={save} disabled={saving} style={{ flex: 1, padding: '12px', background: '#C9A84C', color: '#0A0F1E', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1, borderRadius: 0 }}>
              {saving ? 'SAVING…' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Upload Modal ──────────────────────────────────────────────────────── */
const UploadModal = ({ onClose, onUploaded }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('material-closeup');
  const [isDragging, setIsDragging] = useState(false);
  const [progresses, setProgresses] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const showToast = useToast();

  const addFiles = (newFiles) => {
    const arr = [...newFiles].filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, { name: f.name, url }]);
    });
  };

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('image', files[i]);
      fd.append('caption', caption);
      fd.append('category', category);
      fd.append('isFeatured', false);
      fd.append('displayOrder', 0);
      try {
        await adminAxios.post('/gallery', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setProgresses(p => ({ ...p, [i]: pct }));
          },
        });
        successCount++;
      } catch { showToast('error', `Failed to upload ${files[i].name}`); }
    }
    if (successCount > 0) { showToast('success', `${successCount} image${successCount > 1 ? 's' : ''} uploaded`); onUploaded(); }
    setUploading(false);
    onClose();
  };

  const inputSt = { background: '#0F1520', border: '1px solid #1F2D45', color: '#E8EDF5', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', borderRadius: 0 };
  const labelSt = { fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#7A8BA8', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(8,12,20,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#0F1520', border: '1px solid #1F2D45', maxWidth: 680, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 40, borderRadius: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: '#7A8BA8' }}>UPLOAD GALLERY IMAGES</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8' }}><X size={18} /></button>
        </div>

        {/* Drop Zone */}
        <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#C9A84C' : '#2A3D5C'}`, background: isDragging ? 'rgba(201,168,76,0.05)' : '#151D2E',
            padding: 48, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 24, borderRadius: 0
          }}>
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          <Upload size={40} color={isDragging ? '#C9A84C' : '#4A5A72'} style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#7A8BA8', fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '1rem', margin: '0 0 6px' }}>Drag and drop images here</p>
          <p style={{ color: '#4A5A72', fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '0.85rem', margin: '0 0 8px' }}>or click to browse</p>
          <p style={{ color: '#4A5A72', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em' }}>Supports JPG, PNG, WEBP</p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {previews.map((p, i) => (
              <div key={i} style={{ position: 'relative', textAlign: 'center' }}>
                <img src={p.url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                <p style={{ margin: '4px 0 0', fontSize: '0.6rem', color: '#7A8BA8', fontFamily: "'DM Mono', monospace", maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <button onClick={() => removeFile(i)} style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={labelSt}>Caption (applied to all)</label>
            <input value={caption} onChange={e => setCaption(e.target.value)} style={inputSt} placeholder="e.g. Premium Oak Veneer Closeup" onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#1F2D45'} />
          </div>
          <div>
            <label style={labelSt}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputSt}>
              {UPLOAD_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Progress bars */}
        {uploading && previews.map((p, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.65rem', color: '#7A8BA8', fontFamily: "'DM Mono', monospace" }}>{p.name}</span>
              <span style={{ fontSize: '0.65rem', color: '#C9A84C', fontFamily: "'DM Mono', monospace" }}>{progresses[i] || 0}%</span>
            </div>
            <div style={{ height: 3, background: '#1C2640' }}>
              <div style={{ height: '100%', background: '#C9A84C', width: `${progresses[i] || 0}%`, transition: 'width 0.1s' }} />
            </div>
          </div>
        ))}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#1C2640', color: '#7A8BA8', border: '1px solid #2A3D5C', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0 }}>CANCEL</button>
          <button onClick={handleUpload} disabled={!files.length || uploading}
            style={{ padding: '12px 24px', background: '#C9A84C', color: '#0A0F1E', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: files.length ? 'pointer' : 'not-allowed', opacity: !files.length ? 0.5 : 1, borderRadius: 0 }}>
            {uploading ? 'UPLOADING…' : `UPLOAD ${files.length || 0} IMAGE${files.length !== 1 ? 'S' : ''}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────── */
const AdminGalleryPage = () => {
  const showToast = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editImg, setEditImg] = useState(null);
  const [deleteImg, setDeleteImg] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAxios.get('/gallery');
      setImages(res.data?.data || []);
    } catch { showToast('error', 'Failed to load gallery'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = useMemo(() => {
    if (activeCategory === 'featured') return images.filter(i => i.isFeatured);
    return activeCategory ? images.filter(i => i.category === activeCategory) : images;
  }, [images, activeCategory]);

  const counts = useMemo(() => {
    const obj = {
      '': images.length,
      featured: images.filter(i => i.isFeatured).length
    };
    UPLOAD_CATEGORIES.forEach(c => { obj[c.value] = images.filter(i => i.category === c.value).length; });
    return obj;
  }, [images]);

  /* toggle featured */
  const toggleFeatured = async (img) => {
    setTogglingId(img._id);
    try {
      const next = !img.isFeatured;
      await adminAxios.patch(`/gallery/${img._id}`, { isFeatured: next });
      setImages(prev => prev.map(i => i._id === img._id ? { ...i, isFeatured: next } : i));
    } catch { showToast('error', 'Failed to update'); }
    finally { setTogglingId(null); }
  };

  /* delete */
  const handleDelete = async () => {
    if (!deleteImg) return;
    setDeleting(true);
    try {
      await adminAxios.delete(`/gallery/${deleteImg._id}`);
      setImages(prev => prev.filter(i => i._id !== deleteImg._id));
      showToast('success', 'Image deleted');
    } catch { showToast('error', 'Delete failed'); }
    finally { setDeleting(false); setDeleteImg(null); }
  };

  /* edit save */
  const onEditSave = (id, updates) => {
    setImages(prev => prev.map(i => i._id === id ? { ...i, ...updates } : i));
    setEditImg(null);
  };

  return (
    <AdminLayout title="Gallery">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E8EDF5', fontFamily: "'Inter', sans-serif", margin: 0 }}>GALLERY MANAGEMENT</h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 300, color: '#7A8BA8', fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{images.length} images uploaded</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => fetch()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'transparent', border: '1px solid #2A3D5C', color: '#7A8BA8', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A3D5C'; e.currentTarget.style.color = '#7A8BA8'; }}>
            <RefreshCw size={13} /> REFRESH
          </button>
          <button onClick={() => setShowUpload(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#C9A84C', color: '#0A0F1E', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s', borderRadius: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = '#D4B866'}
            onMouseLeave={e => e.currentTarget.style.background = '#C9A84C'}>
            <Upload size={14} /> UPLOAD IMAGES
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 24, borderBottom: '1px solid #1F2D45' }}>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setActiveCategory(c.value)}
            style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeCategory === c.value ? '2px solid #C9A84C' : '2px solid transparent',
              color: activeCategory === c.value ? '#C9A84C' : '#7A8BA8',
              fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', whiteSpace: 'nowrap',
              transition: 'all 0.2s', borderRadius: 0
            }}>
            {c.label.toUpperCase()} {typeof counts[c.value] !== 'undefined' ? `(${counts[c.value]})` : ''}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} style={{ height: 220, background: '#151D2E', animation: 'pulse 1.5s infinite', borderRadius: 0 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: '#151D2E', border: '1px solid #1F2D45', borderRadius: 0 }}>
          <ImageIcon size={48} color="#4A5A72" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#7A8BA8', fontFamily: "'Inter', sans-serif", fontWeight: 300, marginBottom: 8 }}>No images found</p>
          <p style={{ color: '#4A5A72', fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '0.82rem', marginBottom: 16 }}>
            {activeCategory ? 'No images in this category.' : 'Upload your first image using the button above.'}
          </p>
          {activeCategory && (
            <button onClick={() => setActiveCategory('')} style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', borderRadius: 0 }}>CLEAR FILTER</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map(img => (
              <motion.div key={img._id} layout exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.25 }}
                style={{ background: '#151D2E', border: '1px solid #1F2D45', overflow: 'hidden', position: 'relative', cursor: 'default', borderRadius: 0 }}
                className="gallery-card-hover">

                {/* Image Area */}
                <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
                  <img src={img.imageUrl} alt={img.caption || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s', borderRadius: 0 }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />

                  {/* Hover overlay with actions */}
                  <div className="gallery-overlay" style={{
                    position: 'absolute', inset: 0, background: 'rgba(8,12,20,0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    opacity: 0, transition: 'opacity 0.25s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <button onClick={() => setEditImg(img)}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(15,21,32,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8EDF5' }}>
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => setDeleteImg(img)}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(15,21,32,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <style>{`.gallery-card-hover:hover .gallery-overlay { opacity: 1 !important; }`}</style>
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#E8EDF5', fontFamily: "'Inter', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.caption || 'No caption'}
                  </p>
                  <span style={{ marginTop: 6, display: 'inline-block', background: '#1C2640', color: '#7A8BA8', fontSize: '0.58rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 0 }}>
                    {CATEGORIES.find(c => c.value === img.category)?.label || img.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <button onClick={() => toggleFeatured(img)} disabled={togglingId === img._id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', transition: 'transform 0.2s', borderRadius: 0 }}
                      title={img.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      {togglingId === img._id ? (
                        <RefreshCw size={14} className="animate-spin-custom" color="#C9A84C" />
                      ) : (
                        <Star size={16} color={img.isFeatured ? '#C9A84C' : '#4A5A72'} fill={img.isFeatured ? '#C9A84C' : 'none'} />
                      )}
                    </button>
                    <span style={{ fontSize: '0.6rem', color: '#4A5A72', fontFamily: "'DM Mono', monospace" }}>
                      {img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showUpload && <UploadModal key="upload" onClose={() => setShowUpload(false)} onUploaded={fetch} />}
        {editImg && <EditModal key="edit" img={editImg} onClose={() => setEditImg(null)} onSave={onEditSave} />}
        {deleteImg && <DeleteDialog key="del" img={deleteImg} onCancel={() => setDeleteImg(null)} onConfirm={handleDelete} loading={deleting} />}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminGalleryPage;
