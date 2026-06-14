import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, X, Package, Search, Edit3, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/admin/ToastNotification';
import '../../styles/admin.css';

const PRODUCT_CATEGORIES = [
  { value: 'veneers', label: 'Veneers' },
  { value: 'plywood', label: 'Plywood' },
  { value: 'laminates', label: 'Laminates' },
  { value: 'mdf-hdhmr', label: 'MDF / HDHMR' },
  { value: 'flush-doors', label: 'Flush Doors' },
  { value: 'hardware', label: 'Hardware' },
];

/* ── Toggle Switch ─────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 100, background: checked ? '#2ECC71' : '#1C2640', position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
  </div>
);

/* Tag Input */
const TagInput = ({ tags, onChange, placeholder, maxTags = 10 }) => {
  const [input, setInput] = useState('');
  const onKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim() && tags.length < maxTags) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1));
  };
  return (
    <div style={{ background: '#0F1520', border: '1px solid #1F2D45', padding: '8px 10px', minHeight: 44, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', cursor: 'text', borderRadius: 0 }}
      onClick={() => document.getElementById('tag-input-' + placeholder)?.focus()}>
      {tags.map((t, i) => (
        <span key={i} style={{ background: '#1C2640', border: '1px solid #2A3D5C', color: '#E8EDF5', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 0 }}>
          {t}
          <button onClick={e => { e.stopPropagation(); onChange(tags.filter((_, idx) => idx !== i)); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8', padding: 0, display: 'flex', lineHeight: 1 }}><X size={10} /></button>
        </span>
      ))}
      <input id={'tag-input-' + placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ background: 'none', border: 'none', outline: 'none', color: '#E8EDF5', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', minWidth: 120, flex: 1, borderRadius: 0 }} />
    </div>
  );
};

/* Delete Dialog */
const DeleteDialog = ({ name, onCancel, onConfirm, loading }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    onClick={onCancel}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      onClick={e => e.stopPropagation()}
      style={{ background: '#151D2E', border: '1px solid #1F2D45', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', borderRadius: 0 }}>
      <Trash2 size={32} color="#E74C3C" style={{ margin: '0 auto 16px' }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#E8EDF5', fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>DELETE PRODUCT</p>
      <p style={{ fontSize: '0.85rem', fontWeight: 300, color: '#7A8BA8', fontFamily: "'Inter', sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
        This will permanently delete <strong style={{ color: '#E8EDF5' }}>{name}</strong>. This action cannot be undone.
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

/* ── Add/Edit Drawer ─────────────────────────────────────────────────────── */
const ProductDrawer = ({ product, onClose, onSaved }) => {
  const isEdit = !!product?._id;
  const showToast = useToast();
  const fileRef = useRef();
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'plywood',
    description: product?.description || '',
    brands: product?.brands || [],
    keyHighlights: product?.keyHighlights || [],
    displayOrder: product?.displayOrder ?? 0,
    isActive: product?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.featuredImageUrl || '');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

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
    if (!form.name.trim()) { showToast('warning', 'Product name is required'); return; }
    if (!form.description.trim()) { showToast('warning', 'Description is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k + '[]', item));
        else fd.append(k, v);
      });
      if (imageFile) fd.append('image', imageFile);

      const res = isEdit
        ? await adminAxios.put(`/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await adminAxios.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.data?.success || res.data?.data) {
        showToast('success', isEdit ? 'Product updated successfully' : 'Product created successfully');
        onSaved();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const inputSt = { background: '#0F1520', border: '1px solid #1F2D45', color: '#E8EDF5', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', borderRadius: 0 };
  const labelSt = { fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#7A8BA8', textTransform: 'uppercase', marginBottom: 6, display: 'block' };
  const fieldSt = { marginBottom: 20 };
  const focus = e => e.target.style.borderColor = '#C9A84C';
  const blur  = e => e.target.style.borderColor = '#1F2D45';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 195, background: 'rgba(0,0,0,0.6)' }} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 200, width: 'min(580px, 100vw)', background: '#0F1520', borderLeft: '1px solid #1F2D45', display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #1F2D45', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em', color: '#7A8BA8' }}>{isEdit ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8' }}><X size={18} /></button>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 0' }}>
          <div style={fieldSt}>
            <label style={labelSt}>Product Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inputSt} placeholder="e.g. Century BWP Marine Plywood" onFocus={focus} onBlur={blur} />
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputSt}>
              {PRODUCT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              style={{ ...inputSt, minHeight: 100, resize: 'vertical' }} placeholder="Product description…" onFocus={focus} onBlur={blur} />
            <p style={{ fontSize: '0.62rem', fontFamily: "'DM Mono', monospace", color: '#4A5A72', marginTop: 4 }}>{form.description.length} of 500 characters</p>
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Brands (press Enter to add, max 10)</label>
            <TagInput tags={form.brands} onChange={v => set('brands', v)} placeholder="Type brand name…" maxTags={10} />
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Key Highlights (press Enter to add, max 6)</label>
            <TagInput tags={form.keyHighlights} onChange={v => set('keyHighlights', v)} placeholder="Type highlight…" maxTags={6} />
          </div>
          <div style={fieldSt}>
            <label style={labelSt}>Display Order</label>
            <input type="number" value={form.displayOrder} onChange={e => set('displayOrder', +e.target.value)} style={{ ...inputSt, width: 120 }} onFocus={focus} onBlur={blur} />
            <p style={{ fontSize: '0.75rem', fontWeight: 300, color: '#4A5A72', fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Lower numbers appear first</p>
          </div>

          {/* Image */}
          <div style={fieldSt}>
            <label style={labelSt}>Featured Image</label>
            {imagePreview ? (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <img src={imagePreview} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                <button onClick={() => fileRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#E8EDF5', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 0 }}>
                  <Upload size={12} /> CHANGE IMAGE
                </button>
              </div>
            ) : (
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? '#C9A84C' : '#2A3D5C'}`, background: isDragging ? 'rgba(201,168,76,0.05)' : '#151D2E', padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 0 }}>
                <Upload size={24} color={isDragging ? '#C9A84C' : '#4A5A72'} style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#7A8BA8', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>Drag and drop or click to select image</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
            <p style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", color: '#4A5A72', marginTop: 6 }}>Recommended size 800 by 600 pixels, JPG or PNG</p>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Toggle checked={form.isActive} onChange={v => set('isActive', v)} />
            <div>
              <p style={{ margin: 0, fontSize: '0.83rem', color: '#E8EDF5', fontFamily: "'Inter', sans-serif" }}>VISIBLE ON PUBLIC SITE</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: 300, color: '#4A5A72', fontFamily: "'Inter', sans-serif" }}>Inactive products are hidden from visitors</p>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: '20px 28px', background: '#0F1520', borderTop: '1px solid #1F2D45', flexShrink: 0, display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #2A3D5C', color: '#7A8BA8', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer', borderRadius: 0 }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', background: '#C9A84C', color: '#0A0F1E', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1, borderRadius: 0 }}>
            {saving ? 'SAVING…' : 'SAVE PRODUCT'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────── */
const AdminProductsPage = () => {
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [drawerProduct, setDrawerProduct] = useState(undefined); // undefined = closed, null = new
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAxios.get('/products');
      setProducts(res.data?.data || []);
    } catch { showToast('error', 'Failed to load products'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)); }
    if (catFilter) list = list.filter(p => p.category === catFilter);
    if (activeFilter === 'active') list = list.filter(p => p.isActive);
    if (activeFilter === 'inactive') list = list.filter(p => !p.isActive);
    return list;
  }, [products, search, catFilter, activeFilter]);

  /* toggle active */
  const handleToggle = async (product) => {
    setTogglingId(product._id);
    try {
      await adminAxios.patch(`/products/${product._id}/toggle`);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p));
      showToast('success', 'Status updated successfully');
    } catch { showToast('error', 'Toggle failed'); }
    finally { setTogglingId(null); }
  };

  /* delete */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAxios.delete(`/products/${deleteTarget._id}`);
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
      showToast('success', 'Product deleted');
    } catch { showToast('error', 'Delete failed'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const inputSt = { background: '#0F1520', border: '1px solid #1F2D45', color: '#E8EDF5', padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', outline: 'none', borderRadius: 0 };

  return (
    <AdminLayout title="Products">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E8EDF5', fontFamily: "'Inter', sans-serif", margin: 0 }}>PRODUCT CATALOGUE</h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 300, color: '#7A8BA8', fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{products.length} products in catalogue</p>
        </div>
        <button onClick={() => setDrawerProduct(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#C9A84C', color: '#0A0F1E', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = '#D4B866'}
          onMouseLeave={e => e.currentTarget.style.background = '#C9A84C'}>
          <PlusCircle size={14} /> ADD PRODUCT
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={13} color="#4A5A72" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ ...inputSt, paddingLeft: 34, width: '100%', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#1F2D45'} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={inputSt}>
          <option value="">ALL CATEGORIES</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)} style={inputSt}>
          <option value="">ALL STATUS</option>
          <option value="active">ACTIVE</option>
          <option value="inactive">INACTIVE</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#151D2E', border: '1px solid #1F2D45', overflow: 'hidden', borderRadius: 0 }}>
        {loading ? (
          <div style={{ padding: 40 }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ height: 60, background: '#1C2640', marginBottom: 8, opacity: 0.6, borderRadius: 0 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Package size={40} color="#4A5A72" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#7A8BA8', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>No products found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1F2D45', background: '#0F1520' }}>
                    {['IMAGE', 'PRODUCT', 'BRANDS', 'STATUS', 'ORDER', 'ACTIONS'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', color: '#4A5A72', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map(p => (
                      <motion.tr key={p._id} layout exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                        style={{ borderBottom: '1px solid #1F2D45', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1C2640'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          {p.featuredImageUrl
                            ? <img src={p.featuredImageUrl} alt="" style={{ width: 56, height: 56, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                            : <div style={{ width: 56, height: 56, background: '#1C2640', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}><Package size={20} color="#4A5A72" /></div>
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, color: '#E8EDF5', fontFamily: "'Inter', sans-serif" }}>{p.name}</p>
                          <p style={{ margin: '3px 0 0', fontSize: '0.62rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C' }}>{PRODUCT_CATEGORIES.find(c => c.value === p.category)?.label || p.category}</p>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 300, color: '#7A8BA8', fontFamily: "'Inter', sans-serif" }}>
                          {p.brands?.length ? (p.brands.length > 3 ? p.brands.slice(0, 3).join(', ') + ` and ${p.brands.length - 3} more` : p.brands.join(', ')) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {togglingId === p._id ? (
                              <div style={{ width: 44, height: 24, background: '#1C2640', borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw size={12} className="animate-spin-custom" color="#C9A84C" />
                              </div>
                            ) : (
                              <Toggle checked={p.isActive} onChange={() => handleToggle(p)} />
                            )}
                            <span style={{ fontSize: '0.7rem', color: p.isActive ? '#2ECC71' : '#7A8BA8', fontFamily: "'DM Mono', monospace" }}>{p.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="number"
                            defaultValue={p.displayOrder}
                            onBlur={async (e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val === p.displayOrder) return;
                              try {
                                await adminAxios.put(`/products/${p._id}`, { ...p, displayOrder: val });
                                setProducts(prev => prev.map(item => item._id === p._id ? { ...item, displayOrder: val } : item));
                                showToast('success', 'Display order updated');
                              } catch {
                                showToast('error', 'Failed to update display order');
                                e.target.value = p.displayOrder;
                              }
                            }}
                            style={{
                              width: 60, background: '#0F1520', border: '1px solid #1F2D45',
                              color: '#E8EDF5', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem',
                              padding: '4px 8px', outline: 'none', borderRadius: 0, textAlign: 'center'
                            }}
                            onFocus={e => e.target.style.borderColor = '#C9A84C'}
                          />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setDrawerProduct(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8', display: 'flex', padding: 4, borderRadius: 0 }} title="Edit">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => setDeleteTarget(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8', display: 'flex', padding: 4, transition: 'color 0.2s', borderRadius: 0 }}
                              onMouseEnter={e => e.currentTarget.style.color = '#E74C3C'}
                              onMouseLeave={e => e.currentTarget.style.color = '#7A8BA8'}
                              title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(p => (
                <div key={p._id} style={{ background: '#0F1520', border: '1px solid #1F2D45', padding: 16, display: 'flex', gap: 12, borderRadius: 0 }}>
                  {p.featuredImageUrl
                    ? <img src={p.featuredImageUrl} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0, borderRadius: 0 }} />
                    : <div style={{ width: 56, height: 56, background: '#1C2640', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}><Package size={20} color="#4A5A72" /></div>
                  }
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 500, color: '#E8EDF5', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem' }}>{p.name}</p>
                    <p style={{ margin: '3px 0 8px', fontSize: '0.62rem', fontFamily: "'DM Mono', monospace", color: '#C9A84C', textTransform: 'uppercase' }}>{p.category}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Toggle checked={p.isActive} onChange={() => handleToggle(p)} />
                      <button onClick={() => setDrawerProduct(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8BA8', display: 'flex', borderRadius: 0 }}><Edit3 size={15} /></button>
                      <button onClick={() => setDeleteTarget(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', display: 'flex', borderRadius: 0 }}><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerProduct !== undefined && (
          <ProductDrawer
            key={drawerProduct?._id || 'new'}
            product={drawerProduct}
            onClose={() => setDrawerProduct(undefined)}
            onSaved={() => { fetch(); setDrawerProduct(undefined); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog name={deleteTarget.name} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProductsPage;
