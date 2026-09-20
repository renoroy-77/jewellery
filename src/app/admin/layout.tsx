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
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { adminAuthService, AdminUser } from '@/services/adminAuthService';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';
import './admin.css';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  exact?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
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
  const { confirm } = useConfirm();
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (en)');

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

  // Auto-close mobile drawer on navigation or resize to desktop
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        toast.success(`Welcome back, ${res.user.name}!`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials. Default passcode is admin123');
      toast.error('Invalid admin credentials. Please try again.');
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
        toast.success('Admin portal unlocked!');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Quick unlock failed');
      toast.error('Quick unlock failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Lock Admin Session',
      message: 'Are you sure you want to end your administrator session?',
      description: 'You will need to enter your superadmin passcode to access the management portal again.',
      confirmText: 'Yes, Lock Session',
      cancelText: 'Cancel',
      isDanger: false,
      icon: 'alert',
    });
    if (!ok) return;

    adminAuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPasswordInput('');
    toast.info('Admin session safely locked.');
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

  // Unauthenticated Split-Screen Login
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#061a12',
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(13, 84, 56, 0.4) 0%, transparent 60%)
          `,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        }}
      >
        {/* Subtle Decorative Mandala Watermark on background */}
        <div
          style={{
            position: 'absolute',
            right: '-10%',
            top: '-10%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 55, 0.08)',
            boxShadow: 'inset 0 0 100px rgba(212, 175, 55, 0.03)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-5%',
            bottom: '-15%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 55, 0.06)',
            pointerEvents: 'none',
          }}
        />

        {/* Outer Split Container */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            minHeight: '100vh',
            maxWidth: '1600px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
          className="admin-split-layout-container"
        >
          {/* Left Column: Traditional Temple Sanctum Visual & Branding */}
          <div
            style={{
              flex: '1.15',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '48px 56px',
              color: '#ffffff',
              backgroundImage: 'linear-gradient(to right, rgba(5, 22, 15, 0.45) 0%, rgba(5, 22, 15, 0.78) 100%), url("/assets/admin_sanctum_bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center left',
              boxShadow: 'inset -20px 0 40px -10px rgba(5, 20, 14, 0.9)',
            }}
            className="admin-login-left-pane"
          >
            {/* Top Brand Logo */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="/assets/brand_logo_gold.png"
                  alt="Aamadappetti Panchaloha Jewellery"
                  style={{ height: '48px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                />
              </div>
            </div>

            {/* Middle Big Title & Philosophy */}
            <div style={{ margin: 'auto 0', maxWidth: '480px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif, "Cinzel", "Playfair Display", serif)',
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
                  lineHeight: 1.18,
                  fontWeight: 600,
                  color: '#ffffff',
                  textShadow: '0 4px 20px rgba(0,0,0,0.7)',
                  margin: '0 0 20px 0',
                  letterSpacing: '0.02em',
                }}
              >
                Preserving<br />
                Tradition<br />
                <span style={{ color: '#fcd34d' }}>Digitally</span>
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#f5d77f',
                  fontSize: '0.82rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                }}
              >
                <span>Divine Heritage</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d4af37' }} />
                <span>Timeless Beauty</span>
              </div>
            </div>

            {/* Bottom 3 Feature Pills & Tagline */}
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '24px',
                  maxWidth: '520px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: 'rgba(5, 22, 15, 0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                >
                  <Sparkles size={20} color="#fcd34d" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>
                    Manage Products
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: 'rgba(5, 22, 15, 0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                >
                  <Layers size={20} color="#fcd34d" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>
                    Curate Collections
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    background: 'rgba(5, 22, 15, 0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                >
                  <Users size={20} color="#fcd34d" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>
                    Serve Devotees
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  color: 'rgba(252, 211, 77, 0.75)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  maxWidth: '520px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.25)' }} />
                <span>A More Divine Tomorrow</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.25)' }} />
              </div>
            </div>
          </div>

          {/* Right Column: Premium Elevated White Card Login Panel */}
          <div
            style={{
              flex: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 28px',
              position: 'relative',
            }}
            className="admin-login-right-pane"
          >
            <div
              style={{
                width: '100%',
                maxWidth: '490px',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '40px 36px',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                position: 'relative',
              }}
            >
              {/* Card Header with Logo and Language Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '28px',
                }}
              >
                <img
                  src="/assets/brand_logo_gold.png"
                  alt="Aamadappetti Logo"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    color: '#475569',
                    fontWeight: 500,
                    background: '#f8fafc',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedLanguage(selectedLanguage === 'English (en)' ? 'Malayalam (ml)' : 'English (en)')}
                  title="Switch Language"
                >
                  <Languages size={14} color="#64748b" />
                  <span>{selectedLanguage}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif, "Cinzel", "Playfair Display", serif)',
                    color: '#0f172a',
                    fontSize: '1.65rem',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Admin Sanctum Access
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  Authenticate with your administrator credentials to enter the temple management console.
                </p>
              </div>

              {/* Logout Notice Banner */}
              {logoutNotice && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px 16px',
                    background: '#ecfdf5',
                    border: '1px solid #86efac',
                    borderRadius: '10px',
                    color: '#065f46',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>Admin session successfully locked &amp; logged out.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoutNotice(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', padding: 0 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Admin Username / Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    style={{
                      fontSize: '0.83rem',
                      fontWeight: 600,
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <User size={14} color="#b45309" />
                    <span>Admin Username / Email</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="admin"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.94rem',
                        color: '#0f172a',
                        backgroundColor: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#0d5438')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                </div>

                {/* Password / PIN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    style={{
                      fontSize: '0.83rem',
                      fontWeight: 600,
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Lock size={14} color="#b45309" />
                    <span>Password / PIN</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password (e.g. admin123)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.94rem',
                        color: '#0f172a',
                        backgroundColor: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#0d5438')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.83rem',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#0d5438', cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span>Remember this device</span>
                  </label>
                  <span
                    onClick={() => toast.info('Default admin credentials: Username "admin" / Passcode "admin123"')}
                    style={{ color: '#0d5438', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot password?
                  </span>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      fontSize: '0.84rem',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: 500,
                    }}
                  >
                    {authError}
                  </div>
                )}

                {/* Submit Unlock Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #072e1e 0%, #0d5438 100%)',
                    color: '#ffffff',
                    border: '1px solid #10b981',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(13, 84, 56, 0.35)',
                    transition: 'all 0.2s',
                    marginTop: '4px',
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Lock size={17} color="#fcd34d" />
                  )}
                  <span>{isSubmitting ? 'Authenticating Access...' : 'Unlock Management Console'}</span>
                  {!isSubmitting && <ArrowRight size={17} style={{ marginLeft: '4px' }} />}
                </button>
              </form>

              {/* Demo Credentials Box */}
              <div
                style={{
                  marginTop: '22px',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  Default credentials: <strong style={{ color: '#0f172a' }}>admin</strong> / <strong style={{ color: '#0f172a' }}>admin123</strong>
                </div>
                <button
                  type="button"
                  onClick={handleQuickUnlock}
                  disabled={isSubmitting}
                  style={{
                    background: '#f1f5f9',
                    color: '#0d5438',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <Sparkles size={14} color="#b45309" />
                  <span>Auto-Fill &amp; Quick Unlock</span>
                </button>
              </div>

              {/* Bottom Security Assurance Tag */}
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                }}
              >
                <ShieldCheck size={15} color="#059669" />
                <span>Secure • Private • Authorized Access Only</span>
              </div>
            </div>
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
          className="admin-sidebar-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-brand-header">
          <Link href="/admin" prefetch={true} onClick={() => setMobileOpen(false)}>
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
                prefetch={true}
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
