import { useState, useEffect } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Upload,
  AlertCircle,
  X,
  Star,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';
import '../../styles/admin.css';

const GALLERY_CATEGORIES = [
  { value: 'material-closeup', label: 'Material Closeup' },
  { value: 'finished-interior', label: 'Finished Interior' },
  { value: 'showroom-display', label: 'Showroom Display' },
  { value: 'raw-lumber', label: 'Raw Lumber & Woods' }
];

const AdminGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(GALLERY_CATEGORIES[0].value);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/gallery';
      if (categoryFilter) {
        url += `?category=${encodeURIComponent(categoryFilter)}`;
      }

      const response = await adminAxios.get(url);
      setImages(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not fetch showroom gallery images. Please check engine log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [categoryFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setCaption('');
    setCategory(GALLERY_CATEGORIES[0].value);
    setDisplayOrder(0);
    setIsFeatured(false);
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (img) => {
    setEditingId(img._id);
    setCaption(img.caption || '');
    setCategory(img.category);
    setDisplayOrder(img.displayOrder || 0);
    setIsFeatured(img.isFeatured ?? false);
    setIsActive(img.isActive ?? true);
    setImageFile(null);
    setImagePreview(img.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this gallery photo permanently?')) return;
    try {
      await adminAxios.delete(`/gallery/${id}`);
      setImages(prev => prev.filter(img => img._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete photo request failed.');
    }
  };

  const handleToggleActive = async (img) => {
    try {
      const updatedActive = !(img.isActive ?? true);
      const response = await adminAxios.patch(`/gallery/${img._id}`, {
        isActive: updatedActive
      });
      if (response.data?.success) {
        setImages(prev =>
          prev.map(item => item._id === img._id ? { ...item, isActive: updatedActive } : item)
        );
      }
    } catch (err) {
      console.error(err);
      alert('Could not toggle active state.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If adding, image file is required
    if (!editingId && !imageFile) {
      setError('Please select an image file to upload.');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      if (editingId) {
        // Edit updates details, wait: gallery controller patch supports raw JSON object
        response = await adminAxios.patch(`/gallery/${editingId}`, {
          caption,
          category,
          displayOrder,
          isFeatured,
          isActive
        });
      } else {
        // Add requires upload. Use multipart FormData
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('caption', caption);
        formData.append('category', category);
        formData.append('displayOrder', displayOrder);
        formData.append('isFeatured', isFeatured);
        formData.append('isActive', isActive);

        response = await adminAxios.post('/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data?.success) {
        setIsModalOpen(false);
        fetchImages();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Media submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Showroom Gallery Control">
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--admin-danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-[var(--admin-text-secondary)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[var(--admin-bg-card)] border border-[var(--admin-border)] text-sm rounded-lg py-2.5 px-3"
          >
            <option value="">All Categories</option>
            {GALLERY_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Upload Button */}
        <button
          onClick={openAddModal}
          className="btn-admin-primary flex items-center gap-2 text-sm rounded-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[var(--admin-bg-card)] border border-[var(--admin-border)] animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl">
          <ImageIcon className="h-12 w-12 mx-auto text-[var(--admin-text-secondary)] opacity-40 mb-4" />
          <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No images found in catalog.</p>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Upload pictures to showcase inside showroom display tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              className="group relative aspect-square rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-card)] overflow-hidden shadow-lg hover:shadow-black/50 hover:border-[var(--admin-accent)] transition duration-300"
            >
              {/* Photo */}
              <img
                src={img.imageUrl}
                alt={img.caption || 'Gallery photo'}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Status Badges Overlay */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                {img.isFeatured && (
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[var(--admin-accent)] text-[#080C14] px-2 py-0.5 rounded shadow">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    <span>Featured</span>
                  </span>
                )}
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                  img.isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
                }`}>
                  {img.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-4">
                {/* Actions Top */}
                <div className="flex justify-end gap-1.5 self-end">
                  <button
                    onClick={() => handleToggleActive(img)}
                    className="p-1.5 rounded-lg bg-[var(--admin-bg-deep)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)] transition"
                    title={img.isActive ? 'Hide image' : 'Show image'}
                  >
                    {img.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(img)}
                    className="p-1.5 rounded-lg bg-[var(--admin-bg-deep)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)] transition"
                    title="Edit details"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img._id)}
                    className="p-1.5 rounded-lg bg-[var(--admin-bg-deep)] border border-[var(--admin-border)] text-[var(--admin-danger)] hover:bg-red-500/20 transition"
                    title="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Caption / Category display */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--admin-accent)] uppercase font-semibold tracking-wider">
                    {GALLERY_CATEGORIES.find(c => c.value === img.category)?.label || img.category}
                  </span>
                  <p className="text-xs text-[var(--admin-text-primary)] font-medium leading-tight line-clamp-2">
                    {img.caption || 'No caption provided.'}
                  </p>
                  <p className="text-[9px] text-[var(--admin-text-secondary)] font-mono">
                    Order: {img.displayOrder ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-2xl overflow-hidden shadow-2xl relative"
              >
                {/* Header Title */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]/30">
                  <h3 className="font-bold text-[var(--admin-text-primary)] text-lg">
                    {editingId ? 'Edit Photo Details' : 'Upload Gallery Photo'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-md text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text-primary)] transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* File Upload Selector (Only show when adding new image) */}
                  {!editingId && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Select Photo File *
                      </label>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="flex flex-col items-center justify-center p-5 border border-dashed border-[var(--admin-border)] rounded-lg cursor-pointer bg-[var(--admin-bg-primary)] hover:bg-[var(--admin-bg-elevated)]/30 transition text-center gap-1.5">
                            <Upload className="h-5 w-5 text-[var(--admin-text-secondary)]" />
                            <span className="text-xs font-medium text-[var(--admin-text-primary)]">Select showroom image file</span>
                            <input
                              type="file"
                              required={!editingId}
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {imagePreview && (
                          <div className="relative w-24 h-24 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-bg-primary)] overflow-hidden shrink-0">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Caption */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Caption / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oak Lumber close texture details..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Category field */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      >
                        {GALLERY_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Display Order */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Display Order
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Checks togglers */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFeaturedToggle"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-[var(--admin-accent)] bg-[var(--admin-bg-primary)] border-[var(--admin-border)] rounded focus:ring-0"
                      />
                      <label htmlFor="isFeaturedToggle" className="text-xs font-semibold text-[var(--admin-text-primary)] cursor-pointer">
                        Pin as Featured display
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActiveToggle"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-[var(--admin-accent)] bg-[var(--admin-bg-primary)] border-[var(--admin-border)] rounded focus:ring-0"
                      />
                      <label htmlFor="isActiveToggle" className="text-xs font-semibold text-[var(--admin-text-primary)] cursor-pointer">
                        Show on public site
                      </label>
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[var(--admin-border)]">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn-admin-secondary text-sm"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-admin-primary text-sm font-semibold"
                      disabled={submitting}
                    >
                      {submitting ? 'Uploading image...' : 'Save Gallery Photo'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminGalleryPage;
