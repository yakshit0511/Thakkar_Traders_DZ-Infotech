import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCountUp } from '../../hooks/useCountUp';
import {
  Package,
  FolderGit2,
  Mail,
  Image,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle,
  Trash2,
  AlertCircle,
  Settings
} from 'lucide-react';
import '../../styles/admin.css';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    projects: 0,
    inquiries: 0,
    unreadInquiries: 0,
    gallery: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [error, setError] = useState('');

  // Count animations
  const productCount = useCountUp(stats.products, 1500, !loading);
  const projectCount = useCountUp(stats.projects, 1500, !loading);
  const inquiryCount = useCountUp(stats.inquiries, 1500, !loading);
  const unreadCount = useCountUp(stats.unreadInquiries, 1500, !loading);
  const galleryCount = useCountUp(stats.gallery, 1500, !loading);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      // Parallel fetches for efficiency
      const [productsRes, projectsRes, inquiriesRes, galleryRes] = await Promise.all([
        adminAxios.get('/products'),
        adminAxios.get('/projects'),
        adminAxios.get('/inquiries'),
        adminAxios.get('/gallery')
      ]);

      const totalProducts = productsRes.data?.data?.length || 0;
      const totalProjects = projectsRes.data?.data?.length || 0;
      const totalInquiries = inquiriesRes.data?.data?.length || 0;
      const unreadInquiries = inquiriesRes.data?.newCount || 0;
      const totalGallery = galleryRes.data?.data?.length || 0;

      setStats({
        products: totalProducts,
        projects: totalProjects,
        inquiries: totalInquiries,
        unreadInquiries: unreadInquiries,
        gallery: totalGallery,
      });

      // Keep only first 5 inquiries for preview
      setRecentInquiries(inquiriesRes.data?.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Dashboard loading failed:', err);
      setError('Could not retrieve database metrics. Please verify backend state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await adminAxios.patch(`/inquiries/${id}/status`, { status: 'read' });
      // Refresh local list
      setRecentInquiries(prev =>
        prev.map(inq => inq._id === id ? { ...inq, status: 'read' } : inq)
      );
      setStats(prev => ({ ...prev, unreadInquiries: Math.max(0, prev.unreadInquiries - 1) }));
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await adminAxios.delete(`/inquiries/${id}`);
      // Remove from state
      const deletedInquiry = recentInquiries.find(inq => inq._id === id);
      setRecentInquiries(prev => prev.filter(inq => inq._id !== id));
      setStats(prev => ({
        ...prev,
        inquiries: Math.max(0, prev.inquiries - 1),
        unreadInquiries: deletedInquiry?.status === 'new' ? Math.max(0, prev.unreadInquiries - 1) : prev.unreadInquiries
      }));
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--admin-danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total products */}
        <div className="p-6 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl relative overflow-hidden group">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 transition duration-300">
            <Package className="w-32 h-32 text-[var(--admin-text-primary)]" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)]">Products Catalog</span>
            <div className="p-2 rounded-lg bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/20 text-[var(--admin-accent)]">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-[var(--admin-text-primary)] tracking-tight">
            {loading ? '...' : productCount}
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-2">Active product profiles</p>
        </div>

        {/* Total projects */}
        <div className="p-6 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl relative overflow-hidden group">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 transition duration-300">
            <FolderGit2 className="w-32 h-32 text-[var(--admin-text-primary)]" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)]">Portfolio Projects</span>
            <div className="p-2 rounded-lg bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/20 text-[var(--admin-accent)]">
              <FolderGit2 className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-[var(--admin-text-primary)] tracking-tight">
            {loading ? '...' : projectCount}
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-2">Showcase projects completed</p>
        </div>

        {/* Unread Inquiries */}
        <div className="p-6 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl relative overflow-hidden group">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 transition duration-300">
            <Mail className="w-32 h-32 text-[var(--admin-text-primary)]" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)]">Unread Inquiries</span>
            <div className={`p-2 rounded-lg text-xs font-bold border ${
              stats.unreadInquiries > 0
                ? 'bg-[var(--admin-accent)]/20 border-[var(--admin-accent)]/30 text-[var(--admin-accent)]'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <h3 className={`text-3xl font-extrabold tracking-tight ${stats.unreadInquiries > 0 ? 'text-[var(--admin-accent)]' : 'text-emerald-400'}`}>
            {loading ? '...' : unreadCount}
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-2">
            Out of {loading ? '...' : inquiryCount} total submissions
          </p>
        </div>

        {/* Gallery Images */}
        <div className="p-6 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl relative overflow-hidden group">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 transition duration-300">
            <Image className="w-32 h-32 text-[var(--admin-text-primary)]" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-secondary)]">Gallery Items</span>
            <div className="p-2 rounded-lg bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/20 text-[var(--admin-accent)]">
              <Image className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-[var(--admin-text-primary)] tracking-tight">
            {loading ? '...' : galleryCount}
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-2">Active showroom photos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-2 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Recent Client Inquiries</h3>
              <p className="text-xs text-[var(--admin-text-secondary)]">The latest incoming submissions from contact forms.</p>
            </div>
            <Link
              to="/admin/inquiries"
              className="flex items-center gap-1 text-xs font-bold text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] transition"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4 py-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-[var(--admin-bg-elevated)] animate-pulse" />
              ))}
            </div>
          ) : recentInquiries.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[var(--admin-border)] rounded-lg">
              <Mail className="h-8 w-8 mx-auto text-[var(--admin-text-secondary)] opacity-50 mb-3" />
              <p className="text-sm text-[var(--admin-text-secondary)] font-medium">No client inquiries found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInquiries.map((inq) => (
                <div
                  key={inq._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--admin-border)] rounded-lg gap-4 transition hover:bg-[var(--admin-bg-elevated)]/30 ${
                    inq.status === 'new' ? 'bg-[var(--admin-bg-elevated)]/15 border-l-2 border-l-[var(--admin-accent)]' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--admin-text-primary)]">
                        {inq.fullName}
                      </span>
                      {inq.status === 'new' && (
                        <span className="admin-badge admin-badge-warning">New</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--admin-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {inq.city && <span>• {inq.city}</span>}
                      {inq.projectType && <span>• {inq.projectType}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inq.status === 'new' && (
                      <button
                        onClick={() => handleMarkAsRead(inq._id)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] hover:bg-[var(--admin-bg-elevated)] text-emerald-400 hover:text-emerald-300 transition"
                        title="Mark as read"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInquiry(inq._id)}
                      className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] hover:bg-red-500/10 text-[var(--admin-danger)] transition"
                      title="Delete inquiry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Operations Sidebar */}
        <div className="space-y-6">
          <div className="bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-4">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/products"
                className="flex flex-col items-center justify-center p-4 bg-[var(--admin-bg-elevated)] hover:bg-[var(--admin-bg-elevated)]/80 border border-[var(--admin-border)] rounded-lg transition text-center gap-2 group"
              >
                <Package className="h-5 w-5 text-[var(--admin-accent)] group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-[var(--admin-text-primary)]">Add Product</span>
              </Link>

              <Link
                to="/admin/projects"
                className="flex flex-col items-center justify-center p-4 bg-[var(--admin-bg-elevated)] hover:bg-[var(--admin-bg-elevated)]/80 border border-[var(--admin-border)] rounded-lg transition text-center gap-2 group"
              >
                <FolderGit2 className="h-5 w-5 text-[var(--admin-accent)] group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-[var(--admin-text-primary)]">Add Project</span>
              </Link>

              <Link
                to="/admin/gallery"
                className="flex flex-col items-center justify-center p-4 bg-[var(--admin-bg-elevated)] hover:bg-[var(--admin-bg-elevated)]/80 border border-[var(--admin-border)] rounded-lg transition text-center gap-2 group"
              >
                <Image className="h-5 w-5 text-[var(--admin-accent)] group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-[var(--admin-text-primary)]">Upload Media</span>
              </Link>

              <Link
                to="/admin/settings"
                className="flex flex-col items-center justify-center p-4 bg-[var(--admin-bg-elevated)] hover:bg-[var(--admin-bg-elevated)]/80 border border-[var(--admin-border)] rounded-lg transition text-center gap-2 group"
              >
                <Settings className="h-5 w-5 text-[var(--admin-accent)] group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-[var(--admin-text-primary)]">Site Settings</span>
              </Link>
            </div>
          </div>

          <div className="bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-4">Operations Console</h3>
            <div className="space-y-4 text-xs text-[var(--admin-text-secondary)]">
              <div className="flex justify-between items-center py-2 border-b border-[var(--admin-border)]">
                <span>Showroom Status</span>
                <span className="font-semibold text-emerald-400">Live & Stable</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--admin-border)]">
                <span>Database Engine</span>
                <span className="font-semibold text-[var(--admin-text-primary)]">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--admin-border)]">
                <span>Storage Provider</span>
                <span className="font-semibold text-[var(--admin-text-primary)]">Cloudinary Media</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Console Session</span>
                <span className="font-semibold text-[var(--admin-accent)]">Authenticated JWT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
