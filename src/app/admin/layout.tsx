'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Languages,
  Package,
  Layers,
  Palette,
  ShoppingBag,
  BookOpen,
  ExternalLink,
  Menu,
  X,
  Lock,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Loader2,
  KeyRound,
  User,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { adminAuthService, AdminUser } from '@/services/adminAuthService';
import './admin.css';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Products Catalog',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Collections & Deities',
    href: '/admin/categories',
    icon: Layers,
  },
  {
    label: 'CMS & Banners',
    href: '/admin/cms',
    icon: Palette,
  },
  {
    label: 'Orders Tracker',
    href: '/admin/orders',
    icon: ShoppingBag,
    badge: '4 New',
  },
  {
    label: 'Devotees & Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Referrals & Rewards',
    href: '/admin/referrals',
    icon: Sparkles,
  },
  {
    label: 'Blog & Articles',
    href: '/admin/blog',
    icon: BookOpen,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authentication States
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Login Form States
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);

  // Initialize and verify session on load
  useEffect(() => {
    const checkSession = async () => {
      const authed = adminAuthService.isAuthenticated();
      if (authed) {
        const user = adminAuthService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Verify with backend asynchronously
        adminAuthService.verifySession().then((valid) => {
          if (!valid) {
            handleLogout();
          }
        });
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    };

    checkSession();
  }, []);

  // Auto-close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    setLogoutNotice(false);

    try {
      const res = await adminAuthService.login(usernameInput.trim(), passwordInput.trim());
      if (res.success) {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        setPasswordInput('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials. Default passcode is admin123');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickUnlock = async () => {
    setUsernameInput('admin');
    setPasswordInput('admin123');
    setAuthError('');
    setIsSubmitting(true);
    try {
      const res = await adminAuthService.login('admin', 'admin123');
      if (res.success) {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Quick unlock failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    adminAuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPasswordInput('');
    setLogoutNotice(true);
    setTimeout(() => setLogoutNotice(false), 4000);
  };

  // Initial session loader
  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a1d13',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f5d77f',
          gap: '16px',
        }}
      >
        <Loader2 size={36} className="animate-spin" color="#d4af37" />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', letterSpacing: '0.1em' }}>
          Verifying Sacred Admin Sanctum Access...
        </span>
      </div>
    );
  }

  // Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at top, #0f2c1f 0%, #05160f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #d4af37',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.2)',
            textAlign: 'center',
          }}
        >
          <img
            src="/assets/brand_logo_gold.png"
            alt="Aamadappetti Logo"
            style={{ height: '46px', margin: '0 auto 20px', display: 'block' }}
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d5438',
              }}
            >
              <Lock size={26} />
            </div>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              color: '#0f172a',
              fontSize: '1.45rem',
              marginBottom: '6px',
              fontWeight: 700,
            }}
          >
            Admin Sanctum Access
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Authenticate with your administrator credentials or master PIN to enter the temple management console.
          </p>

          {logoutNotice && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                color: '#166534',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" />
              <span>Admin session successfully locked &amp; logged out.</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} color="#b45309" />
                <span>Admin Username / Email</span>
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="admin-form-input"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={13} color="#b45309" />
                <span>Password / PIN</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter password (e.g. admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="admin-form-input"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            {authError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-btn admin-btn-gold"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.98rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
              <span>{isSubmitting ? 'Authenticating...' : 'Unlock Management Console'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div
            style={{
              marginTop: '22px',
              padding: '12px',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#64748b',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              Default credentials: <strong>admin</strong> / <strong>admin123</strong>
            </div>
            <button
              type="button"
              onClick={handleQuickUnlock}
              disabled={isSubmitting}
              style={{
                background: '#0d5438',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={12} color="#f5d77f" />
              <span>Auto-Fill &amp; Quick Unlock</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Console Layout
  return (
    <div className="admin-wrapper">
      {/* Sidebar Overlay on mobile */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 45,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-brand-header">
          <Link href="/admin" onClick={() => setMobileOpen(false)}>
            <img
              src="/assets/brand_logo_gold.png"
              alt="Aamadappetti"
              className="admin-brand-logo"
            />
          </Link>
          <span className="admin-badge">ADMIN</span>
        </div>

        {/* User profile tag in sidebar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(5, 22, 15, 0.6)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#0d5438',
              border: '1px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5d77f',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {currentUser?.name?.charAt(0) || 'C'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fcf9f2', fontSize: '0.82rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Chief Sthapati'}
            </div>
            <div style={{ color: '#d4af37', fontSize: '0.72rem' }}>
              {currentUser?.role || 'SUPERADMIN'}
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section-title">Store Management</div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" target="_blank" className="admin-view-store-btn" title="Open storefront in new tab">
            <span>View Live Store</span>
            <ExternalLink size={15} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            id="admin-sidebar-logout-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '10px',
              borderRadius: '8px',
              width: '100%',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={14} />
            <span>Lock Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="admin-topbar-title">
              Aamadappetti Management Console
            </div>
          </div>

          <div className="admin-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="admin-lang-pill">
              <Languages size={15} />
              <span>Store Locale: {locale === 'en' ? 'English (en)' : 'தமிழ் (ta)'}</span>
            </div>

            <div className="admin-user-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#d4af37" />
              <span>{currentUser?.name || 'Chief Sthapati (SuperAdmin)'}</span>
            </div>

            {/* Topbar Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              id="admin-topbar-logout-btn"
              title="Lock Console & Log Out"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="admin-body">
          {children}
        </main>
      </div>
    </div>
  );
}
