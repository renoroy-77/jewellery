'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Package,
  Heart,
  MapPin,
  Sparkles,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Clock,
  Truck,
  Eye,
  EyeOff,
  Coins,
  Compass,
  Leaf,
  ExternalLink,
  Gift,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';

import { referralsService, UserReferralSummary } from '@/services/referralsService';

type AuthView = 'login' | 'register' | 'forgot' | 'dashboard';
type DashboardTab = 'orders' | 'profile' | 'addresses' | 'rewards';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  deity: string;
  nakshatra: string;
  memberSince: string;
  referralCode?: string;
}

const DEFAULT_USER: UserProfile = {
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@example.com',
  phone: '+91 98450 12345',
  deity: 'Goddess Lakshmi',
  nakshatra: 'Rohini',
  memberSince: 'January 2025',
  referralCode: 'RAJESH-B335',
};

export default function AccountPage() {
  const { wishlist, totalItems } = useCart();
  const [view, setView] = useState<AuthView>('login');
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotInput, setForgotInput] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDeity, setRegDeity] = useState('Lord Ganesha');

  // Check persisted session & load bookings
  useEffect(() => {
    const saved = localStorage.getItem('aamadappetti_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setView('dashboard');
      } catch {
        // Fall back to login
      }
    }
  }, []);

  const [referralSummary, setReferralSummary] = useState<UserReferralSummary | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (user?.email) {
      referralsService
        .getUserReferrals(user.email)
        .then((summary) => {
          setReferralSummary(summary);
          if (summary.referralCode && !user.referralCode) {
            setUser((prev) => ({ ...prev, referralCode: summary.referralCode }));
          }
        })
        .catch(() => {});
    }
  }, [user?.email]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser: UserProfile = {
      ...DEFAULT_USER,
      name: loginEmail.split('@')[0] ? loginEmail.split('@')[0].toUpperCase() : 'Devotee',
      email: loginEmail || 'devotee@aamadappetti.in',
    };
    setUser(loggedInUser);
    localStorage.setItem('aamadappetti_user', JSON.stringify(loggedInUser));
    setView('dashboard');
  };

  const handleDemoLogin = () => {
    setUser(DEFAULT_USER);
    localStorage.setItem('aamadappetti_user', JSON.stringify(DEFAULT_USER));
    setView('dashboard');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      name: regName || 'Devotee',
      email: regEmail,
      phone: regPhone || '+91 99000 00000',
      deity: regDeity,
      nakshatra: 'Anuradha',
      memberSince: 'September 2026',
    };
    setUser(newUser);
    localStorage.setItem('aamadappetti_user', JSON.stringify(newUser));
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('aamadappetti_user');
    setView('login');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('aamadappetti_user', JSON.stringify(user));
    setSuccessMessage('Profile details updated with blessings!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    setTimeout(() => {
      setRecoverySent(false);
      setView('login');
    }, 4000);
  };

  /* --------------------------------------------------------------------------
     UNAUTHENTICATED VIEW: SANCTUM LOGIN HERO (MATCHING USER'S DESIGN)
     -------------------------------------------------------------------------- */
  if (view !== 'dashboard') {
    return (
      <div className="login-hero-wrapper">
        <div className="login-hero-bg" aria-hidden="true">
          <div className="login-hero-overlay" />
        </div>

        <div className="container login-hero-container">
          {/* Left Column: Brand Philosophy & Heritage */}
          <div className="login-left-content">
            <div className="login-kicker">
              <span>FAITH</span>
              <span className="kicker-dot">✦</span>
              <span>TRADITION</span>
              <span className="kicker-dot">✦</span>
              <span>CRAFTSMANSHIP</span>
            </div>

            <h1 className="login-hero-headline">
              More than<br />
              Jewellery,<br />
              a Part of Your<br />
              Devotion
            </h1>

            {/* Sacred Lotus Divider */}
            <div className="login-lotus-divider" aria-hidden="true">
              <span className="divider-line" />
              <img
                src="/assets/gold_lotus_emblem.png"
                alt="Sacred Lotus Divider"
                width={26}
                height={26}
                className="lotus-divider-img"
              />
              <span className="divider-line" />
            </div>

            <p className="login-hero-subtitle">
              Timeless pieces for your sacred moments.
            </p>

            {/* Bottom Trust Indicators */}
            <div className="login-trust-strip">
              <div className="trust-item">
                <div className="trust-icon-box">
                  <img
                    src="/assets/gold_lotus_emblem.png"
                    alt="Authentic Panchaloha"
                    width={22}
                    height={22}
                    className="trust-lotus-img"
                  />
                </div>
                <div className="trust-text">
                  <span className="trust-title">Authentic</span>
                  <span className="trust-sub">Panchaloha</span>
                </div>
              </div>

              <div className="trust-divider" />

              <div className="trust-item">
                <div className="trust-icon-box">
                  <ShieldCheck size={20} className="trust-icon" />
                </div>
                <div className="trust-text">
                  <span className="trust-title">Trusted</span>
                  <span className="trust-sub">Quality</span>
                </div>
              </div>

              <div className="trust-divider" />

              <div className="trust-item">
                <div className="trust-icon-box">
                  <Leaf size={20} className="trust-icon" />
                </div>
                <div className="trust-text">
                  <span className="trust-title">Delivered</span>
                  <span className="trust-sub">with Care</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphism Card */}
          <div className="login-right-content">
            <div className="login-glass-card">
              {/* Top Lotus Emblem */}
              <div className="login-lotus-emblem-wrap">
                <div className="login-lotus-badge">
                  <img
                    src="/assets/gold_lotus_emblem.png"
                    alt="Sacred Golden Lotus"
                    width={46}
                    height={46}
                    className="login-lotus-img"
                  />
                </div>
              </div>

              {/* VIEW: LOGIN */}
              {view === 'login' && (
                <>
                  <div className="login-card-header">
                    <h2 className="login-card-title">Welcome Back</h2>
                    <p className="login-card-subtitle">
                      Sign in to your Aamadappetti account and continue your journey of devotion.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="login-card-form">
                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="dash-login-email">
                        Email or Mobile Number
                      </label>
                      <div className="login-input-box">
                        <Mail size={18} className="login-input-icon" />
                        <input
                          id="dash-login-email"
                          type="text"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. rajesh@example.com or 9845012345"
                          className="login-input-field"
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <div className="login-label-row">
                        <label className="login-input-label" htmlFor="dash-login-pwd">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setView('forgot')}
                          className="login-forgot-link"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="login-input-box">
                        <Lock size={18} className="login-input-icon" />
                        <input
                          id="dash-login-pwd"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="login-input-field"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="login-password-toggle"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="login-checkbox-row">
                      <label className="login-custom-checkbox-label">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="login-checkbox-native"
                        />
                        <span className="login-checkbox-custom" />
                        <span className="login-checkbox-text">Keep me signed in</span>
                      </label>
                    </div>

                    <button type="submit" className="login-primary-btn">
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="login-demo-pill"
                    >
                      <Sparkles size={14} className="text-gold" />
                      <span>Instant Demo Login (Rajesh Sharma)</span>
                    </button>

                    <div className="login-divider">
                      <span className="login-divider-text">New to Aamadappetti?</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setView('register')}
                      className="login-secondary-btn"
                    >
                      Create Devotee Account
                    </button>
                  </form>
                </>
              )}

              {/* VIEW: REGISTER */}
              {view === 'register' && (
                <>
                  <div className="login-card-header">
                    <h2 className="login-card-title">Join the Sacred Circle</h2>
                    <p className="login-card-subtitle">
                      Create your Aamadappetti devotee account for consecrated jewellery and temple blessings.
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="login-card-form">
                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="reg-dash-name">
                        Full Devotee Name
                      </label>
                      <div className="login-input-box">
                        <User size={18} className="login-input-icon" />
                        <input
                          id="reg-dash-name"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Smt. Ananya Krishnan"
                          className="login-input-field"
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="reg-dash-email">
                        Email Address
                      </label>
                      <div className="login-input-box">
                        <Mail size={18} className="login-input-icon" />
                        <input
                          id="reg-dash-email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ananya@example.com"
                          className="login-input-field"
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="reg-dash-phone">
                        Mobile Number
                      </label>
                      <div className="login-input-box">
                        <Phone size={18} className="login-input-icon" />
                        <input
                          id="reg-dash-phone"
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98450 12345"
                          className="login-input-field"
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="reg-dash-deity">
                        Ishta Devata (Guardian Deity)
                      </label>
                      <select
                        id="reg-dash-deity"
                        value={regDeity}
                        onChange={(e) => setRegDeity(e.target.value)}
                        className="login-select-field"
                      >
                        <option value="Goddess Lakshmi">Goddess Lakshmi (Prosperity & Grace)</option>
                        <option value="Lord Ganesha">Lord Ganesha (Remover of Obstacles)</option>
                        <option value="Lord Murugan">Lord Murugan (Agamic Purity)</option>
                        <option value="Lord Shiva">Lord Shiva (Cosmic Consciousness)</option>
                        <option value="Lord Venkateswara">Lord Venkateswara (Tirupati Balaji)</option>
                        <option value="Goddess Saraswati">Goddess Saraswati (Wisdom)</option>
                      </select>
                    </div>

                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="reg-dash-pwd">
                        Create Passcode
                      </label>
                      <div className="login-input-box">
                        <Lock size={18} className="login-input-icon" />
                        <input
                          id="reg-dash-pwd"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="login-input-field"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="login-password-toggle"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="login-primary-btn">
                      <span>Create Devotee Account</span>
                      <ArrowRight size={18} />
                    </button>

                    <div className="login-divider">
                      <span className="login-divider-text">Already registered?</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="login-secondary-btn"
                    >
                      Sign In to Existing Account
                    </button>
                  </form>
                </>
              )}

              {/* VIEW: FORGOT */}
              {view === 'forgot' && (
                <>
                  <div className="login-card-header">
                    <h2 className="login-card-title">Reset Sacred Passcode</h2>
                    <p className="login-card-subtitle">
                      Enter your registered email or phone to receive a sanctified verification link.
                    </p>
                  </div>

                  {recoverySent ? (
                    <div className="login-success-state">
                      <CheckCircle2 size={44} className="text-gold" />
                      <h3>Verification Dispatched</h3>
                      <p>
                        A sanctified reset link has been dispatched to <strong>{forgotInput}</strong>.
                        Redirecting to sign-in...
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleForgot} className="login-card-form">
                      <div className="login-form-group">
                        <label className="login-input-label" htmlFor="dash-forgot-input">
                          Registered Email or Mobile
                        </label>
                        <div className="login-input-box">
                          <Mail size={18} className="login-input-icon" />
                          <input
                            id="dash-forgot-input"
                            type="text"
                            required
                            value={forgotInput}
                            onChange={(e) => setForgotInput(e.target.value)}
                            placeholder="e.g. rajesh@example.com"
                            className="login-input-field"
                          />
                        </div>
                      </div>

                      <button type="submit" className="login-primary-btn">
                        <span>Send Recovery Link</span>
                        <ArrowRight size={18} />
                      </button>

                      <div className="login-divider">
                        <span className="login-divider-text">Remember your password?</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setView('login')}
                        className="login-secondary-btn"
                      >
                        Back to Sign In
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Security Footer */}
              <div className="login-card-security-footer">
                <span className="security-item">
                  <Lock size={13} />
                  <span>Secure Login</span>
                </span>
                <span className="security-divider">|</span>
                <span className="security-item">
                  <ShieldCheck size={13} />
                  <span>Your Data is Safe</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     AUTHENTICATED VIEW: DEVOTEE PROFILE DASHBOARD
     -------------------------------------------------------------------------- */
  return (
    <div className="account-page-root">
      <div className="container">
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="pdp-top-bar" style={{ marginBottom: '32px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />

          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold-light)' }}>Devotee Portal</span>
          </nav>
        </div>

        <div className="account-dashboard-grid">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar">
              <div className="devotee-profile-badge">
                <div className="devotee-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="devotee-info">
                  <h2 className="devotee-name">{user.name}</h2>
                  <div className="devotee-sub">Devotee ID #AAP-8492</div>
                  <div className="devotee-deity-pill">
                    <Sparkles size={12} />
                    <span>Blessed by {user.deity}</span>
                  </div>
                </div>
              </div>

              {/* Refer & Earn Sidebar Summary */}
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(2, 12, 8, 0.8) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(212, 175, 55, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Gift size={18} color="#d4af37" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa59b', textTransform: 'uppercase' }}>
                      Your Referral Code
                    </div>
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#f5d77f',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {user.referralCode || referralSummary?.referralCode || 'BHAKTI-7K9'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#b0c4b8', lineHeight: 1.4 }}>
                  Give friends ₹{referralSummary?.refereeDiscount || 100} off &amp; earn ₹{referralSummary?.referrerReward || 200} gift coupons!
                </div>
              </div>

              {/* Tab Navigation Menu */}
              <nav className="dashboard-tabs-nav" aria-label="Account Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`dashboard-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                >
                  <Package size={17} />
                  <span>Consecrated Orders</span>
                  <span className="tab-count-badge">2</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                >
                  <User size={17} />
                  <span>Personal Sanctum Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className={`dashboard-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                >
                  <MapPin size={17} />
                  <span>Puja Shipping Addresses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rewards')}
                  className={`dashboard-tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
                >
                  <Gift size={17} />
                  <span>Refer &amp; Earn Rewards</span>
                  {referralSummary?.friendsReferred ? (
                    <span className="tab-count-badge">{referralSummary.friendsReferred}</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="dashboard-tab-btn logout-btn"
                >
                  <LogOut size={17} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main-content">
              {successMessage && (
                <div className="dashboard-success-alert">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* TAB 1: CONSECRATED ORDERS */}
              {activeTab === 'orders' && (
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h3 className="dashboard-section-title">Consecrated Orders &amp; Dispatch</h3>
                      <p className="dashboard-section-subtitle">
                        Track sacred jewellery cast, sanctified in sanctums, and delivered to your doorstep.
                      </p>
                    </div>
                  </div>

                  {/* ACTIVE ORDER CARD */}
                  <div className="order-card active-order">
                    <div className="order-header-row">
                      <div>
                        <span className="order-status-badge in-transit">
                          <Truck size={13} />
                          Out for Delivery
                        </span>
                        <div className="order-id">Order #AAP-9824</div>
                      </div>
                      <div className="order-date-total">
                        <div className="order-total">₹3,499</div>
                        <div className="order-date">Dispatched Sep 16, 2026</div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-items-list">
                      <div className="order-item-row">
                        <img
                          src="/assets/prod_lakshmi_hq.webp"
                          alt="Goddess Lakshmi Pendant"
                          className="order-item-img"
                        />
                        <div className="order-item-details">
                          <div className="order-item-name">Goddess Lakshmi Consecrated Pendant</div>
                          <div className="order-item-meta">Pure Panchaloham · Lost-Wax Cast · 22kt Gold Finish</div>
                          <div className="order-item-qty">Qty: 1 · ₹3,499</div>
                        </div>
                      </div>
                    </div>

                    {/* Live Sanctum Delivery Progress Bar */}
                    <div className="order-tracking-box">
                      <div className="tracking-steps">
                        <div className="tracking-step completed">
                          <div className="step-dot">✓</div>
                          <div className="step-name">Cast at Crucible</div>
                        </div>
                        <div className="tracking-step completed">
                          <div className="step-dot">✓</div>
                          <div className="step-name">Temple Consecration</div>
                        </div>
                        <div className="tracking-step completed">
                          <div className="step-dot">✓</div>
                          <div className="step-name">Aamadappetti Sealed</div>
                        </div>
                        <div className="tracking-step active">
                          <div className="step-dot">●</div>
                          <div className="step-name">Out for Delivery</div>
                        </div>
                      </div>
                      <div className="tracking-note">
                        <Clock size={13} />
                        <span>Expected Arrival: <strong>Today by 4:00 PM</strong> (Via BlueDart Sacred Express)</span>
                      </div>
                    </div>
                  </div>

                  {/* COMPLETED PAST ORDER */}
                  <div className="order-card past-order">
                    <div className="order-header-row">
                      <div>
                        <span className="order-status-badge delivered">
                          <CheckCircle2 size={13} />
                          Delivered with Prasadam
                        </span>
                        <div className="order-id">Order #AAP-9102</div>
                      </div>
                      <div className="order-date-total">
                        <div className="order-total">₹2,899</div>
                        <div className="order-date">Delivered Aug 12, 2026</div>
                      </div>
                    </div>

                    <div className="order-items-list">
                      <div className="order-item-row">
                        <img
                          src="/assets/prod_ganesha_hq.webp"
                          alt="Lord Ganesha Pendant"
                          className="order-item-img"
                        />
                        <div className="order-item-details">
                          <div className="order-item-name">Lord Ganesha Panchaloham Pendant</div>
                          <div className="order-item-meta">Prana Pratishtha Blessed · With Sacred Thread</div>
                          <div className="order-item-qty">Qty: 1 · ₹2,899</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE DETAILS */}
              {activeTab === 'profile' && (
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h3 className="dashboard-section-title">Personal Sanctum Profile</h3>
                      <p className="dashboard-section-subtitle">
                        Manage your contact details, astrological Nakshatram, and guardian deity preferences.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="dashboard-profile-form">
                    <div className="form-grid-2">
                      <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="auth-input"
                          required
                        />
                      </div>

                      <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          className="auth-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="auth-field">
                        <label className="auth-label">Phone Number</label>
                        <input
                          type="tel"
                          value={user.phone}
                          onChange={(e) => setUser({ ...user, phone: e.target.value })}
                          className="auth-input"
                          required
                        />
                      </div>

                      <div className="auth-field">
                        <label className="auth-label">Ishta Devata (Guardian Deity)</label>
                        <select
                          value={user.deity}
                          onChange={(e) => setUser({ ...user, deity: e.target.value })}
                          className="auth-input auth-select"
                        >
                          <option value="Lord Ganesha">Lord Ganesha</option>
                          <option value="Lord Murugan">Lord Murugan</option>
                          <option value="Lord Shiva">Lord Shiva</option>
                          <option value="Goddess Lakshmi">Goddess Lakshmi</option>
                          <option value="Goddess Devi">Goddess Devi</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="auth-field">
                        <label className="auth-label">Janma Nakshatram (Birth Star)</label>
                        <input
                          type="text"
                          value={user.nakshatra}
                          onChange={(e) => setUser({ ...user, nakshatra: e.target.value })}
                          className="auth-input"
                          placeholder="e.g. Rohini, Anuradha, Ashwini"
                        />
                      </div>

                      <div className="auth-field">
                        <label className="auth-label">Devotee Membership</label>
                        <input
                          type="text"
                          value={`Member since ${user.memberSince}`}
                          disabled
                          className="auth-input"
                          style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-gold" style={{ padding: '12px 28px' }}>
                      <span>Update Sanctum Details</span>
                      <CheckCircle2 size={16} />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h3 className="dashboard-section-title">Saved Puja &amp; Home Delivery Addresses</h3>
                      <p className="dashboard-section-subtitle">
                        Ensure all consecrated shipments are delivered directly to pure, designated sanctum areas.
                      </p>
                    </div>
                  </div>

                  <div className="addresses-grid">
                    {/* Address 1 */}
                    <div className="address-card default-address">
                      <div className="address-badge">
                        <span>Default Home Sanctum</span>
                      </div>
                      <div className="address-name">{user.name}</div>
                      <div className="address-body">
                        #42, Temple View Enclave, 4th Main Road<br />
                        Indiranagar, Bangalore, Karnataka — 560038<br />
                        Phone: {user.phone}
                      </div>
                      <div className="address-actions">
                        <button type="button" className="addr-action-btn">Edit</button>
                        <span className="addr-pipe">|</span>
                        <span style={{ fontSize: '0.8rem', color: '#34d399' }}>✓ Verified for Puja Delivery</span>
                      </div>
                    </div>

                    {/* Address 2 */}
                    <div className="address-card">
                      <div className="address-badge secondary">
                        <span>Ancestral Family Home</span>
                      </div>
                      <div className="address-name">Sharma Ancestral Illam</div>
                      <div className="address-body">
                        12, Sannidhi Street, Near Meenakshi Temple<br />
                        Madurai, Tamil Nadu — 625001<br />
                        Phone: +91 94430 54321
                      </div>
                      <div className="address-actions">
                        <button type="button" className="addr-action-btn">Edit</button>
                        <span className="addr-pipe">|</span>
                        <button type="button" className="addr-action-btn">Set as Primary</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REFER & EARN REWARDS */}
              {activeTab === 'rewards' && (
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h3 className="dashboard-section-title">Refer Friends &amp; Earn Sacred Blessings</h3>
                      <p className="dashboard-section-subtitle">
                        Gift your friends ₹{referralSummary?.refereeDiscount || 100} off their first consecrated jewellery purchase, and receive a ₹{referralSummary?.referrerReward || 200} single-use reward coupon on every successful order.
                      </p>
                    </div>
                  </div>

                  {/* Referral Code & Share Link Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(3, 20, 13, 0.9) 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '12px',
                      padding: '24px',
                      marginBottom: '24px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        alignItems: 'center',
                      }}
                    >
                      {/* Left: Code Display & Copy */}
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#8fa59b', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Your Unique Devotee Code
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '1.6rem',
                              fontWeight: 700,
                              color: '#f5d77f',
                              letterSpacing: '0.08em',
                              background: 'rgba(2, 12, 8, 0.8)',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                            }}
                          >
                            {user.referralCode || referralSummary?.referralCode || 'BHAKTI-7K9'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const c = user.referralCode || referralSummary?.referralCode || 'BHAKTI-7K9';
                              navigator.clipboard?.writeText(c);
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '10px 16px',
                              background: copiedCode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 175, 55, 0.15)',
                              border: copiedCode ? '1px solid #4ade80' : '1px solid rgba(212, 175, 55, 0.4)',
                              color: copiedCode ? '#4ade80' : '#f5d77f',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const c = user.referralCode || referralSummary?.referralCode || 'BHAKTI-7K9';
                            const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout?ref=${c}` : `https://aamadappetti.in/checkout?ref=${c}`;
                            navigator.clipboard?.writeText(shareUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 18px',
                            background: 'rgba(2, 12, 8, 0.7)',
                            border: copiedLink ? '1px solid #4ade80' : '1px solid rgba(212, 175, 55, 0.3)',
                            color: copiedLink ? '#4ade80' : '#fcf9f2',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedLink ? <Check size={16} /> : <Share2 size={16} color="#d4af37" />}
                          <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Checkout Share Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const c = user.referralCode || referralSummary?.referralCode || 'BHAKTI-7K9';
                            const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout?ref=${c}` : `https://aamadappetti.in/checkout?ref=${c}`;
                            const msg = `🙏 Vanakkam! I invite you to explore authentic consecrated Panchaloham temple jewellery at Aamadappetti. Use my referral code ${c} at checkout to get ₹${referralSummary?.refereeDiscount || 100} off your order!\n\n${shareUrl}`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 18px',
                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <span>Share on WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '16px',
                      marginBottom: '24px',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(4, 20, 13, 0.7)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '10px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#8fa59b', textTransform: 'uppercase' }}>
                        Friends Invited
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fcf9f2', marginTop: '4px' }}>
                        {referralSummary?.friendsReferred || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(4, 20, 13, 0.7)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '10px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#8fa59b', textTransform: 'uppercase' }}>
                        Reward Coupons Granted
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4ade80', marginTop: '4px' }}>
                        ₹{referralSummary?.rewardsEarned || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(4, 20, 13, 0.7)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '10px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#8fa59b', textTransform: 'uppercase' }}>
                        Active Unused Coupons
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f5d77f', marginTop: '4px' }}>
                        {referralSummary?.activeRewardCoupons?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Active Referrer Reward Coupons */}
                  {referralSummary?.activeRewardCoupons && referralSummary.activeRewardCoupons.length > 0 && (
                    <div
                      style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '10px',
                        padding: '18px 20px',
                        marginBottom: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Sparkles size={18} color="#d4af37" />
                        <span style={{ fontWeight: 600, color: '#fcf9f2' }}>
                          Your Available Reward Coupons (Redeem at Checkout)
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {referralSummary.activeRewardCoupons.map((c) => (
                          <div
                            key={c.coupon}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(2, 12, 8, 0.8)',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              border: '1px solid rgba(212, 175, 55, 0.25)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <code style={{ fontSize: '1rem', color: '#f5d77f', fontWeight: 700 }}>
                                {c.coupon}
                              </code>
                              <span style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 600 }}>
                                ₹{c.amount} OFF
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(c.coupon);
                                setSuccessMessage(`Copied coupon ${c.coupon}! Apply it at checkout.`);
                                setTimeout(() => setSuccessMessage(''), 3000);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#d4af37',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Copy size={14} />
                              <span>Copy</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* List of Referrals */}
                  <div
                    style={{
                      background: 'rgba(4, 20, 13, 0.7)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                        fontWeight: 600,
                        color: '#fcf9f2',
                        fontSize: '0.95rem',
                      }}
                    >
                      Invited Devotees &amp; Reward Status
                    </div>

                    {!referralSummary?.referrals || referralSummary.referrals.length === 0 ? (
                      <div style={{ padding: '32px 18px', textAlign: 'center', color: '#8fa59b', fontSize: '0.88rem' }}>
                        You haven&apos;t referred any friends yet. Share your code above to start earning rewards!
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: 'rgba(2, 12, 8, 0.6)', borderBottom: '1px solid rgba(212, 175, 55, 0.12)' }}>
                              <th style={{ padding: '12px 16px', color: '#d4af37' }}>Date</th>
                              <th style={{ padding: '12px 16px', color: '#d4af37' }}>Invited Friend</th>
                              <th style={{ padding: '12px 16px', color: '#d4af37' }}>Status</th>
                              <th style={{ padding: '12px 16px', color: '#d4af37' }}>Reward Coupon</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referralSummary.referrals.map((r) => (
                              <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '12px 16px', color: '#8fa59b' }}>
                                  {new Date(r.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </td>
                                <td style={{ padding: '12px 16px', color: '#fcf9f2' }}>
                                  {r.refereeEmail}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      fontWeight: 600,
                                      background:
                                        r.status === 'REWARDED'
                                          ? 'rgba(34, 197, 94, 0.15)'
                                          : r.status === 'PENDING'
                                          ? 'rgba(212, 175, 55, 0.15)'
                                          : 'rgba(239, 68, 68, 0.15)',
                                      color:
                                        r.status === 'REWARDED'
                                          ? '#4ade80'
                                          : r.status === 'PENDING'
                                          ? '#f5d77f'
                                          : '#f87171',
                                    }}
                                  >
                                    {r.status}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  {r.rewardCoupon ? (
                                    <code style={{ color: '#f5d77f', fontWeight: 600 }}>{r.rewardCoupon}</code>
                                  ) : (
                                    <span style={{ color: '#8fa59b', fontSize: '0.78rem' }}>Awaiting order confirmation</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
      </div>
    </div>
  );
}
