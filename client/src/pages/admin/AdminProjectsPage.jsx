import { useState, useEffect } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import '../../styles/admin.css';

const PROJECT_CATEGORIES = [
  'Residential',
  'Commercial',
  'Office Spaces',
  'Hospitality',
  'Showrooms',
  'Premium Furniture'
];

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [materialsInput, setMaterialsInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/projects';
      const params = [];
      if (categoryFilter) {
        params.push(`category=${encodeURIComponent(categoryFilter)}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await adminAxios.get(url);
      let list = response.data?.data || [];

      // Filter client-side search query
      if (search.trim()) {
        const query = search.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
      }

      setProjects(list);
    } catch (err) {
      console.error(err);
      setError('Could not fetch portfolio projects. Verify database engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setLocation('');
    setYear(new Date().getFullYear());
    setCategory(PROJECT_CATEGORIES[0]);
    setDescription('');
    setDisplayOrder(0);
    setMaterialsInput('');
    setImageFile(null);
    setImagePreview('');
    setIsActive(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingId(project._id);
    setTitle(project.title);
    setSubtitle(project.subtitle || '');
    setLocation(project.location);
    setYear(project.year || new Date().getFullYear());
    setCategory(project.category);
    setDescription(project.description || '');
    setDisplayOrder(project.displayOrder || 0);
    setMaterialsInput(Array.isArray(project.materialsUsed) ? project.materialsUsed.join(', ') : '');
    setImageFile(null);
    setImagePreview(project.coverImageUrl || '');
    setIsActive(project.isActive ?? true);
    setIsFeatured(project.isFeatured ?? false);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await adminAxios.patch(`/projects/${id}/toggle`);
      if (response.data?.success) {
        setProjects(prev =>
          prev.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p)
        );
      }
    } catch (err) {
      console.error(err);
      alert('Could not toggle active state.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await adminAxios.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete project request failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !year) return;

    setSubmitting(true);
    setError('');

    const materialsArr = materialsInput.split(',').map(s => s.trim()).filter(Boolean);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('location', location);
    formData.append('year', year);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder);
    formData.append('isActive', isActive);
    formData.append('isFeatured', isFeatured);
    formData.append('materialsUsed', JSON.stringify(materialsArr));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let response;
      if (editingId) {
        response = await adminAxios.put(`/projects/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await adminAxios.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data?.success) {
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Form submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Showroom Portfolio Control">
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--admin-danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--admin-text-secondary)]">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] text-sm rounded-lg"
            />
          </div>
          <button type="submit" className="btn-admin-secondary text-sm">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[var(--admin-bg-card)] border border-[var(--admin-border)] text-sm rounded-lg py-2.5 px-3"
          >
            <option value="">All Categories</option>
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="btn-admin-primary flex items-center gap-2 text-sm rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="space-y-4 py-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--admin-bg-card)] border border-[var(--admin-border)] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl">
          <FolderGit2 className="h-12 w-12 mx-auto text-[var(--admin-text-secondary)] opacity-40 mb-4" />
          <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No projects found.</p>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Add items to show in the showcase portfolio grid.</p>
        </div>
      ) : (
        <div className="admin-table-container shadow-xl">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Category</th>
                <th>Location / Year</th>
                <th>Featured</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj._id}>
                  <td className="w-20">
                    {proj.coverImageUrl ? (
                      <img
                        src={proj.coverImageUrl}
                        alt={proj.title}
                        className="w-12 h-12 rounded bg-[var(--admin-bg-deep)] border border-[var(--admin-border)] object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] flex items-center justify-center text-xs text-[var(--admin-text-secondary)]">
                        No image
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="font-semibold text-[var(--admin-text-primary)]">{proj.title}</div>
                    <div className="text-xs text-[var(--admin-text-secondary)] truncate max-w-xs mt-0.5">{proj.subtitle}</div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] text-[var(--admin-accent)]">
                      {proj.category}
                    </span>
                  </td>
                  <td>
                    <div className="text-[var(--admin-text-primary)] text-sm flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[var(--admin-text-secondary)]" />
                      <span>{proj.location}</span>
                    </div>
                    <div className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>{proj.year || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      proj.isFeatured ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text-secondary)]/50'
                    }`}>
                      <Star className={`h-4.5 w-4.5 ${proj.isFeatured ? 'fill-current' : ''}`} />
                      <span>{proj.isFeatured ? 'Featured' : 'Standard'}</span>
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(proj._id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                        proj.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-[var(--admin-danger)] hover:bg-red-500/20'
                      }`}
                    >
                      {proj.isActive ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(proj)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-elevated)] transition"
                        title="Edit project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] hover:bg-red-500/10 text-[var(--admin-danger)] transition"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add Modal Form */}
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
                className="w-full max-w-xl bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-2xl overflow-hidden shadow-2xl relative"
              >
                {/* Header Title */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]/30">
                  <h3 className="font-bold text-[var(--admin-text-primary)] text-lg">
                    {editingId ? 'Edit Project Details' : 'Add New Portfolio Project'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-md text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text-primary)] transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Title field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Surat Luxury Penthouse"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Subtitle field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Subtitle / Brief Line
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Modern minimalist design with custom veneered spaces"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Location field */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Surat, Gujarat"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>

                    {/* Year field */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Project Year *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2024"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>
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
                        {PROJECT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
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

                  {/* Description field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Description / Case Study
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Discuss project requirements, architects, and custom material features used..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Materials list */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase flex items-center justify-between">
                      <span>Materials Used</span>
                      <span className="text-[10px] lowercase italic font-normal">Separate with commas</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BWP Blockboard, Teak Veneer, Blum Hinge hardware"
                      value={materialsInput}
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Image selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Project Cover Image
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[var(--admin-border)] rounded-lg cursor-pointer bg-[var(--admin-bg-primary)] hover:bg-[var(--admin-bg-elevated)]/30 transition text-center gap-1.5">
                          <Upload className="h-5 w-5 text-[var(--admin-text-secondary)]" />
                          <span className="text-xs font-medium text-[var(--admin-text-primary)]">Select cover photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {imagePreview && (
                        <div className="relative w-24 h-24 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-bg-primary)] overflow-hidden shrink-0">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(''); }}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-[var(--admin-text-primary)] rounded-full transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
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
                        Pin to Featured slider
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
                      {submitting ? 'Saving changes...' : 'Save Project'}
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

export default AdminProjectsPage;
