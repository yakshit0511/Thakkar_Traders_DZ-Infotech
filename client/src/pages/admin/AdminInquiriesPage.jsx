import { useState, useEffect } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  AlertCircle,
  Eye,
  X,
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  Filter
} from 'lucide-react';
import '../../styles/admin.css';

const AdminInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // empty string means "all"
  const [exporting, setExporting] = useState(false);

  // Modal Detail State
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/inquiries';
      const params = [];
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (statusFilter) params.push(`status=${statusFilter}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await adminAxios.get(url);
      setInquiries(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve incoming client inquiries. Verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    if (currentStatus === 'read') return;
    try {
      await adminAxios.patch(`/inquiries/${id}/status`, { status: 'read' });
      // Update local state
      setInquiries(prev =>
        prev.map(inq => inq._id === id ? { ...inq, status: 'read' } : inq)
      );
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: 'read' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    try {
      await adminAxios.delete(`/inquiries/${id}`);
      setInquiries(prev => prev.filter(inq => inq._id !== id));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      // Fetch as text since CSV is plain text
      const response = await adminAxios.get('/inquiries/export', { responseType: 'blob' });
      
      // Create download trigger
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `thakkar-inquiries-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Inquiry list CSV export failed.');
    } finally {
      setExporting(false);
    }
  };

  const openInquiryModal = (inq) => {
    setSelectedInquiry(inq);
    // Mark as read automatically when opened
    if (inq.status === 'new') {
      handleMarkAsRead(inq._id, inq.status);
    }
  };

  return (
    <AdminLayout title="Client Inquiries Management">
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--admin-danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--admin-text-secondary)]">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by client name or contact number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] text-sm rounded-lg"
            />
          </div>
          <button type="submit" className="btn-admin-secondary text-sm">
            Search
          </button>
        </form>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh */}
          <button
            onClick={fetchInquiries}
            className="btn-admin-secondary flex items-center gap-1.5 p-2.5 rounded-lg"
            title="Refresh inquiry list"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn-admin-primary flex items-center gap-2 text-sm rounded-lg"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export List (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--admin-border)] pb-4">
        {[
          { label: 'All Messages', value: '' },
          { label: 'New/Unread', value: 'new' },
          { label: 'Read Messages', value: 'read' },
          { label: 'Followed Up', value: 'replied' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              statusFilter === tab.value
                ? 'bg-[var(--admin-bg-elevated)] border border-[var(--admin-accent)] text-[var(--admin-accent)]'
                : 'border border-transparent text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)]/40 hover:text-[var(--admin-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table view */}
      {loading ? (
        <div className="space-y-4 py-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--admin-bg-card)] border border-[var(--admin-border)] animate-pulse" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-20 bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl">
          <Mail className="h-12 w-12 mx-auto text-[var(--admin-text-secondary)] opacity-40 mb-4 animate-bounce" />
          <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No messages match selected query.</p>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Incoming client contact details populate here.</p>
        </div>
      ) : (
        <div className="admin-table-container shadow-xl">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Client Name</th>
                <th>Required Material</th>
                <th>Project Type</th>
                <th>Date Submitted</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr
                  key={inq._id}
                  className="cursor-pointer group/row"
                  onClick={() => openInquiryModal(inq)}
                >
                  <td>
                    <span className={`admin-badge ${
                      inq.status === 'new'
                        ? 'admin-badge-warning'
                        : inq.status === 'read'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'admin-badge-success'
                    }`}>
                      {inq.status === 'new' ? 'New' : inq.status === 'read' ? 'Read' : 'Followed Up'}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold text-[var(--admin-text-primary)]">{inq.fullName}</div>
                    <div className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{inq.phoneNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] text-[var(--admin-text-primary)]">
                      {inq.materialRequired || 'Not specified'}
                    </span>
                  </td>
                  <td>
                    <div className="text-[var(--admin-text-primary)]">{inq.projectType || 'Not specified'}</div>
                    {inq.city && (
                      <div className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{inq.city}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[var(--admin-text-secondary)] shrink-0" />
                      <span>
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openInquiryModal(inq)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-elevated)] transition"
                        title="View Full details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(inq._id)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-card)] hover:bg-red-500/10 text-[var(--admin-danger)] transition"
                        title="Delete Inquiry"
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

      {/* Inquiry Detail Modal View */}
      <AnimatePresence>
        {selectedInquiry && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInquiry(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-2xl overflow-hidden shadow-2xl relative"
              >
                {/* Header Title */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]/30">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[var(--admin-text-primary)] text-lg">Inquiry Detail</h3>
                    <span className={`admin-badge ${
                      selectedInquiry.status === 'new' ? 'admin-badge-warning' : 'admin-badge-success'
                    }`}>
                      {selectedInquiry.status === 'new' ? 'New' : 'Read'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="p-1 rounded-md text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text-primary)] transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Grid Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">Client Name</span>
                      <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{selectedInquiry.fullName}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">Phone Number</span>
                      <p className="text-sm font-semibold text-[var(--admin-text-primary)] flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[var(--admin-accent)]" />
                        <a href={`tel:${selectedInquiry.phoneNumber}`} className="hover:underline text-[var(--admin-text-primary)]">
                          {selectedInquiry.phoneNumber}
                        </a>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">Email Address</span>
                      <p className="text-sm font-semibold text-[var(--admin-text-primary)]">
                        {selectedInquiry.emailAddress ? (
                          <a href={`mailto:${selectedInquiry.emailAddress}`} className="hover:underline text-[var(--admin-text-primary)]">
                            {selectedInquiry.emailAddress}
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--admin-text-secondary)] italic">Not provided</span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">City / Region</span>
                      <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{selectedInquiry.city || 'Not provided'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">Project Category</span>
                      <p className="text-sm font-semibold text-[var(--admin-accent)]">{selectedInquiry.projectType || 'General Inquiry'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">Required Material</span>
                      <p className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] inline-block">
                        {selectedInquiry.materialRequired || 'General info'}
                      </p>
                    </div>
                  </div>

                  <hr className="border-[var(--admin-border)]" />

                  {/* Message details */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-secondary)]">Client Message Details</span>
                    <div className="p-4 rounded-lg bg-[var(--admin-bg-deep)] border border-[var(--admin-border)]">
                      <p className="text-sm text-[var(--admin-text-primary)] whitespace-pre-wrap leading-relaxed">
                        {selectedInquiry.message || 'No additional text message submitted.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-[var(--admin-text-secondary)] flex items-center gap-1.5 pt-2 justify-between">
                    <span>IP Origin: {selectedInquiry.ipAddress || 'Unknown'}</span>
                    <span>Submitted: {new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]/20">
                  <button
                    onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                    className="btn-admin-danger flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete inquiry</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="btn-admin-secondary text-sm"
                    >
                      Close Detail
                    </button>
                    {selectedInquiry.emailAddress && (
                      <a
                        href={`mailto:${selectedInquiry.emailAddress}?subject=Reply%20from%20Thakkar%20Traders`}
                        className="btn-admin-primary text-sm flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Send Email Reply</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;
