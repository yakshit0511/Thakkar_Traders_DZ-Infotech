import { useState, useEffect } from 'react';
import adminAxios from '../../utils/adminAxios';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Globe,
  Phone,
  BarChart,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Share2
} from 'lucide-react';
import '../../styles/admin.css';

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('hero');

  // Form settings state matching DB schema
  const [settings, setSettings] = useState({
    heroHeadline: '',
    heroSubtext: '',
    aboutParagraph1: '',
    aboutParagraph2: '',
    showroomAddress: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    workingHours: '',
    instagramUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    totalSheetsDelivered: 10000,
    totalProjectsServed: 500,
    yearsLegacy: 15,
    totalBrands: 20,
    metaTitle: '',
    metaDescription: '',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAxios.get('/settings');
      if (response.data?.success && response.data?.data) {
        setSettings(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve site settings from backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? (parseInt(value, 10) || 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await adminAxios.put('/settings', settings);
      if (response.data?.success) {
        setSuccessMsg('Showroom configurations saved and published successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save configuration settings.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero & Showcase', icon: BookOpen },
    { id: 'contact', label: 'Contact & Showroom', icon: Phone },
    { id: 'stats', label: 'Legacy Statistics', icon: BarChart },
    { id: 'seo', label: 'SEO Metadata', icon: Globe },
  ];

  return (
    <AdminLayout title="Showroom Settings Console">
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--admin-danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="h-12 w-full bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl animate-pulse" />
          <div className="h-64 w-full bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl animate-pulse" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Settings Tab Selector */}
          <div className="flex flex-wrap gap-2 border-b border-[var(--admin-border)] pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-[var(--admin-bg-elevated)] border border-[var(--admin-accent)] text-[var(--admin-accent)] shadow-md'
                      : 'border border-transparent text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-elevated)]/40 hover:text-[var(--admin-text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Cards */}
          <div className="bg-[var(--admin-bg-card)] border border-[var(--admin-border)] rounded-xl p-6 md:p-8 shadow-xl">
            {/* HERO & SHOWCASE TAB */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--admin-text-primary)]">Hero & Brand Showcase</h3>
                  <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">Customize default text and headings shown above fold.</p>
                </div>

                <div className="space-y-4">
                  {/* Hero Headline */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Hero Slider Title / Headline
                    </label>
                    <input
                      type="text"
                      name="heroHeadline"
                      value={settings.heroHeadline}
                      onChange={handleChange}
                      placeholder="Building Spaces With Premium Wood"
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Hero Subtext */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Hero Slider Subtext
                    </label>
                    <textarea
                      name="heroSubtext"
                      rows={2}
                      value={settings.heroSubtext}
                      onChange={handleChange}
                      placeholder="Authorized distributors of India's leading wood and interior material brands."
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* About paragraph 1 */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Showroom About Column 1
                    </label>
                    <textarea
                      name="aboutParagraph1"
                      rows={3}
                      value={settings.aboutParagraph1}
                      onChange={handleChange}
                      placeholder="Primary summary text describing business focus..."
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* About paragraph 2 */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Showroom About Column 2
                    </label>
                    <textarea
                      name="aboutParagraph2"
                      rows={3}
                      value={settings.aboutParagraph2}
                      onChange={handleChange}
                      placeholder="Secondary summary text discussing delivery or pricing..."
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT & SHOWROOM TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--admin-text-primary)]">Contact Details & Showroom Location</h3>
                  <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">Customize client inquiry email channels, socials, and contact cards.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={settings.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        WhatsApp Number (Digits Only, with Country Code)
                      </label>
                      <input
                        type="text"
                        name="whatsappNumber"
                        value={settings.whatsappNumber}
                        onChange={handleChange}
                        placeholder="919876543210"
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Inquiry Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                        placeholder="info@thakkartraders.com"
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>

                    {/* Working Hours */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                        Working Showroom Hours
                      </label>
                      <input
                        type="text"
                        name="workingHours"
                        value={settings.workingHours}
                        onChange={handleChange}
                        placeholder="Mon — Sat, 09:30 — 19:00 IST"
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Showroom Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Showroom Physical Address
                    </label>
                    <input
                      type="text"
                      name="showroomAddress"
                      value={settings.showroomAddress}
                      onChange={handleChange}
                      placeholder="Plot 12, Industrial Hub, Surat, Gujarat 395004, India"
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  <hr className="border-[var(--admin-border)] my-6" />

                  {/* Social Handles */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--admin-text-primary)] uppercase tracking-wider">
                      <Share2 className="h-4 w-4 text-[var(--admin-accent)]" />
                      <span>Social Profile URLs</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Instagram */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          name="instagramUrl"
                          value={settings.instagramUrl}
                          onChange={handleChange}
                          placeholder="https://instagram.com/thakkartraders"
                          className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                        />
                      </div>

                      {/* LinkedIn */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={settings.linkedinUrl}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/company/thakkartraders"
                          className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                        />
                      </div>

                      {/* Facebook */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          name="facebookUrl"
                          value={settings.facebookUrl}
                          onChange={handleChange}
                          placeholder="https://facebook.com/thakkartraders"
                          className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LEGACY STATISTICS TAB */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--admin-text-primary)]">Legacy Statistics Counters</h3>
                  <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">Customize statistics counters shown on homepage and about sections.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Sheets Delivered */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Sheets Delivered
                    </label>
                    <input
                      type="number"
                      name="totalSheetsDelivered"
                      value={settings.totalSheetsDelivered}
                      onChange={handleChange}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Projects Served */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Projects Served
                    </label>
                    <input
                      type="number"
                      name="totalProjectsServed"
                      value={settings.totalProjectsServed}
                      onChange={handleChange}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Years Legacy */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Years Legacy
                    </label>
                    <input
                      type="number"
                      name="yearsLegacy"
                      value={settings.yearsLegacy}
                      onChange={handleChange}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Total Brands */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      Total Partner Brands
                    </label>
                    <input
                      type="number"
                      name="totalBrands"
                      value={settings.totalBrands}
                      onChange={handleChange}
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO METADATA TAB */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--admin-text-primary)]">Search Engine Optimization (SEO)</h3>
                  <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">Configure page meta tags for improved Google search indices ranking.</p>
                </div>

                <div className="space-y-4">
                  {/* Meta Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      SEO Meta Title Tag
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={settings.metaTitle}
                      onChange={handleChange}
                      placeholder="Thakkar Traders — Premium Plywood, Laminates and Interior Materials, Surat"
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--admin-text-secondary)] tracking-wide uppercase">
                      SEO Meta Description Tag
                    </label>
                    <textarea
                      name="metaDescription"
                      rows={3}
                      value={settings.metaDescription}
                      onChange={handleChange}
                      placeholder="Provide business summaries to show on Google search listings pages..."
                      className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Save Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              className="btn-admin-secondary text-sm"
              disabled={saving}
            >
              Discard Changes
            </button>

            <button
              type="submit"
              className="btn-admin-primary text-sm flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#080C14] border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  <span>Save configurations</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
};

export default AdminSettingsPage;
