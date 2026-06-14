import { useState, useEffect } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
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
  Tag
} from 'lucide-react';
import '../../styles/admin.css';

const PRODUCT_CATEGORIES = [
  'Plywood',
  'Laminates',
  'Veneers',
  'Hardware',
  'Solid Wood',
  'Decorative Surfaces'
];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [brandsInput, setBrandsInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/products';
      const params = [];
      if (categoryFilter) {
        params.push(`category=${encodeURIComponent(categoryFilter)}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await adminAxios.get(url);
      let list = response.data?.data || [];
      
      // Since public getProducts filters isActive, wait!
      // Let's verify: if the list only shows active products, is there a way to show inactive?
      // Yes, on public it returns isActive: true. But we can display what's returned.
      // Filter list by search query client side
      if (search.trim()) {
        const query = search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }

      setProducts(list);
    } catch (err) {
      console.error(err);
      setError('Could not fetch products. Please verify server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setDescription('');
    setDisplayOrder(0);
    setBrandsInput('');
    setHighlightsInput('');
    setImageFile(null);
    setImagePreview('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description);
    setDisplayOrder(product.displayOrder || 0);
    setBrandsInput(Array.isArray(product.brands) ? product.brands.join(', ') : '');
    setHighlightsInput(Array.isArray(product.keyHighlights) ? product.keyHighlights.join(', ') : '');
    setImageFile(null);
    setImagePreview(product.featuredImageUrl || '');
    setIsActive(product.isActive ?? true);
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
      const response = await adminAxios.patch(`/products/${id}/toggle`);
      if (response.data?.success) {
        setProducts(prev =>
          prev.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p)
        );
      }
    } catch (err) {
      console.error(err);
      alert('Could not toggle active state.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await adminAxios.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete product request failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description) return;

    setSubmitting(true);
    setError('');

    // Serialize comma-separated values to array strings
    const brandsArr = brandsInput.split(',').map(s => s.trim()).filter(Boolean);
    const highlightsArr = highlightsInput.split(',').map(s => s.trim()).filter(Boolean);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder);
    formData.append('isActive', isActive);
    formData.append('brands', JSON.stringify(brandsArr));
    formData.append('keyHighlights', JSON.stringify(highlightsArr));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let response;
      if (editingId) {
        response = await adminAxios.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await adminAxios.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data?.success) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Form submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Products Catalog Control">
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
              placeholder="Search products..."
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
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="btn-admin-primary flex items-center gap-2 text-sm rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
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
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl">
          <Package className="h-12 w-12 mx-auto text-[var(--admin-text-secondary)] opacity-40 mb-4" />
          <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No products found.</p>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Add items to show them in the catalog grid.</p>
        </div>
      ) : (
        <div className="admin-table-container shadow-xl">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Order</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td className="w-20">
                    {prod.featuredImageUrl ? (
                      <img
                        src={prod.featuredImageUrl}
                        alt={prod.name}
                        className="w-12 h-12 rounded bg-[var(--admin-bg-deep)] border border-[var(--admin-border)] object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] flex items-center justify-center text-xs text-[var(--admin-text-secondary)]">
                        No image
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="font-semibold text-[var(--admin-text-primary)]">{prod.name}</div>
                    <div className="text-xs text-[var(--admin-text-secondary)] truncate max-w-xs mt-0.5">{prod.description}</div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] text-[var(--admin-accent)]">
                      {prod.category}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-[var(--admin-text-primary)]">{prod.displayOrder ?? 0}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(prod._id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                        prod.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-[var(--admin-danger)] hover:bg-red-500/20'
                      }`}
                    >
                      {prod.isActive ? (
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
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-elevated)] transition"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] hover:bg-red-500/10 text-[var(--admin-danger)] transition"
                        title="Delete product"
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
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-md text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text-primary)] transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Teak Veneer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                        {PRODUCT_CATEGORIES.map(cat => (
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
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe material details, size options, and surface patterns..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Brands list */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase flex items-center justify-between">
                      <span>Brands</span>
                      <span className="text-[10px] lowercase italic font-normal">Separate with commas</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Greenlam, Century, Austin"
                      value={brandsInput}
                      onChange={(e) => setBrandsInput(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase flex items-center justify-between">
                      <span>Key Highlights</span>
                      <span className="text-[10px] lowercase italic font-normal">Separate with commas</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Water resistant, 10-year warranty, Termite-proof"
                      value={highlightsInput}
                      onChange={(e) => setHighlightsInput(e.target.value)}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Image selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Featured Product Image
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[var(--admin-border)] rounded-lg cursor-pointer bg-[var(--admin-bg-primary)] hover:bg-[var(--admin-bg-elevated)]/30 transition text-center gap-1.5">
                          <Upload className="h-5 w-5 text-[var(--admin-text-secondary)]" />
                          <span className="text-xs font-medium text-[var(--admin-text-primary)]">Select file to upload</span>
                          <span className="text-[10px] text-[var(--admin-text-secondary)]">PNG, JPG or WEBP (Max 5MB)</span>
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

                  {/* Status Toggle */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActiveToggle"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[var(--admin-accent)] bg-[var(--admin-bg-primary)] border-[var(--admin-border)] rounded focus:ring-0"
                    />
                    <label htmlFor="isActiveToggle" className="text-xs font-semibold text-[var(--admin-text-primary)] cursor-pointer">
                      Show in public catalog layout
                    </label>
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
                      {submitting ? 'Saving changes...' : 'Save Product'}
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

export default AdminProductsPage;
