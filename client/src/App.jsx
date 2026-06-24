import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/shared/PrivateRoute';
import PublicLayout from './layouts/PublicLayout';
import ToastProvider from './components/admin/ToastNotification';
import Loader from './components/shared/Loader';

// ─── Public pages (code-split) ────────────────────────────────────────────────
const HomePage        = lazy(() => import('./pages/public/HomePage'));
const ProductsPage    = lazy(() => import('./pages/public/ProductsPage'));
const BrandsPage      = lazy(() => import('./pages/public/BrandsPage'));
const ProjectsPage    = lazy(() => import('./pages/public/ProjectsPage'));
const GalleryPage     = lazy(() => import('./pages/public/GalleryPage'));
const ContactPage     = lazy(() => import('./pages/public/ContactPage'));
const NotFoundPage    = lazy(() => import('./pages/public/NotFoundPage'));

// ─── Admin pages (code-split) ─────────────────────────────────────────────────
const AdminLoginPage      = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage  = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminInquiriesPage  = lazy(() => import('./pages/admin/AdminInquiriesPage'));
const AdminGalleryPage    = lazy(() => import('./pages/admin/AdminGalleryPage'));
const AdminProductsPage   = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProjectsPage   = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminSettingsPage   = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminFollowUpsPage  = lazy(() => import('./pages/admin/AdminFollowUpsPage'));

// Minimal full-page loader while chunks are fetched
const PageSuspense = ({ children }) => (
  <Suspense
    fallback={
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F0EBE1',
        }}
      >
        <Loader />
      </div>
    }
  >
    {children}
  </Suspense>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route
            element={
              <PageSuspense>
                <PublicLayout />
              </PageSuspense>
            }
          >
            <Route path="/"          element={<HomePage />} />
            <Route path="/products"  element={<ProductsPage />} />
            <Route path="/brands"    element={<BrandsPage />} />
            <Route path="/projects"  element={<ProjectsPage />} />
            <Route path="/gallery"   element={<GalleryPage />} />
            <Route path="/contact"   element={<ContactPage />} />
          </Route>

          {/* ── Admin Routes — wrapped in ToastProvider ── */}
          <Route
            path="/admin/login"
            element={
              <PageSuspense>
                <AdminLoginPage />
              </PageSuspense>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route
            path="/admin/dashboard"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminDashboardPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminInquiriesPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminGalleryPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminProductsPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminProjectsPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminSettingsPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />
          <Route
            path="/admin/followups"
            element={
              <PageSuspense>
                <ToastProvider>
                  <PrivateRoute><AdminFollowUpsPage /></PrivateRoute>
                </ToastProvider>
              </PageSuspense>
            }
          />

          {/* ── 404 ── */}
          <Route
            path="*"
            element={
              <PageSuspense>
                <NotFoundPage />
              </PageSuspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
