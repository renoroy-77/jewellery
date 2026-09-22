'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Package,
  MapPin,
  Sparkles,
  CheckCircle2,
  LogOut,
  Clock,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  Share2,
  AlertCircle,
  RefreshCw,
  Gift,
  Coins,
  KeyRound,
  MessageCircle,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';
import {
  devoteeAuthService,
  DevoteeUserProfile,
  DevoteeAddress,
  DevoteeSessionData,
} from '@/services/devoteeAuthService';
import { referralsService, UserReferralSummary } from '@/services/referralsService';
import { ordersService } from '@/services/ordersService';
import { OrderCMS } from '@/data/cmsData';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';

type DashboardTab = 'orders' | 'profile' | 'addresses' | 'rewards';

export default function AccountPage() {
  const { confirm } = useConfirm();
  const { totalItems } = useCart();
  const [session, setSession] = useState<DevoteeSessionData | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Unauthenticated OTP Login State
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Address Book State
  const [addresses, setAddresses] = useState<DevoteeAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home / Puja Room',
    recipientName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    isDefault: false,
  });

  // Orders State
  const [orders, setOrders] = useState<OrderCMS[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Referral Summary State
  const [referralSummary, setReferralSummary] = useState<UserReferralSummary | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleTabClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tabRefs.current[tab]) {
      tabRefs.current[tab]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    // On mobile, smoothly scroll up to the top of the main content area
    if (isMobile) {
      const contentEl = document.querySelector('.account-main-content');
      if (contentEl) {
        const top = contentEl.getBoundingClientRect().top + window.pageYOffset - 110;
        if (window.pageYOffset > top) {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }
  };

  const getOrderStatusInfo = (status: string = 'Processing') => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVER') || s === 'COMPLETED') {
      return {
        label: 'Delivered with Divine Grace',
        stepIndex: 3,
        color: '#34d399',
        bgColor: 'rgba(52, 211, 153, 0.15)',
        borderColor: 'rgba(52, 211, 153, 0.4)',
        badgeClass: 'delivered',
        icon: <CheckCircle2 size={13} />,
      };
    }
    if (s.includes('SHIP') || s.includes('TRANSIT')) {
      return {
        label: 'Dispatched & In-Transit',
        stepIndex: 2,
        color: '#38bdf8',
        bgColor: 'rgba(56, 189, 248, 0.15)',
        borderColor: 'rgba(56, 189, 248, 0.4)',
        badgeClass: 'in-transit',
        icon: <Truck size={13} />,
      };
    }
    if (s.includes('PROCESS') || s.includes('SANCTUM') || s.includes('CRAFT')) {
      return {
        label: 'Sanctum Consecration & Crafting',
        stepIndex: 1,
        color: '#f5d77f',
        bgColor: 'rgba(212, 175, 55, 0.18)',
        borderColor: 'rgba(212, 175, 55, 0.4)',
        badgeClass: 'processing',
        icon: <Sparkles size={13} />,
      };
    }
    if (s.includes('CANCEL')) {
      return {
        label: 'Order Cancelled',
        stepIndex: -1,
        color: '#f87171',
        bgColor: 'rgba(248, 113, 113, 0.15)',
        borderColor: 'rgba(248, 113, 113, 0.4)',
        badgeClass: 'cancelled',
        icon: <AlertCircle size={13} />,
      };
    }
    return {
      label: 'Order Confirmed',
      stepIndex: 0,
      color: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      borderColor: 'rgba(251, 191, 36, 0.4)',
      badgeClass: 'confirmed',
      icon: <Clock size={13} />,
    };
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  // Load session on mount
  useEffect(() => {
    const currentSession = devoteeAuthService.getStoredSession();
    if (currentSession) {
      setSession(currentSession);
      loadUserData(currentSession.user);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

  const loadUserData = async (devotee: DevoteeUserProfile) => {
    // 1. Fetch addresses
    try {
      const addrs = await devoteeAuthService.getAddresses(devotee.email || devotee.id);
      setAddresses(addrs);
    } catch {}

    // 2. Fetch devotee orders
    try {
      setIsLoadingOrders(true);
      const userOrders = await ordersService.getDevoteeOrders(devotee.email || devotee.id);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load devotee orders', err);
    } finally {
      setIsLoadingOrders(false);
    }

    // 3. Fetch referral summary
    if (devotee.email) {
      referralsService
        .getUserReferrals(devotee.email)
        .then(setReferralSummary)
        .catch(() => {});
    }
  };

  // OTP Login Handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsOtpLoading(true);
    try {
      const res = await devoteeAuthService.sendOtp(cleanEmail);
      if (res.success) {
        setOtpStep('otp');
        setOtpCooldown(res.cooldownRemaining || 45);
        setSuccessMessage(`Sacred OTP sent to ${cleanEmail}. Check your email.`);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsOtpLoading(true);
    try {
      const res = await devoteeAuthService.verifyOtp(loginEmail, otpCode);
      if (res.success) {
        const newSession = devoteeAuthService.getStoredSession();
        setSession(newSession);
        if (newSession) {
          loadUserData(newSession.user);
        }
        setSuccessMessage('Welcome back to your Devotee Portal!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleLogout = () => {
    devoteeAuthService.clearSession();
    setSession(null);
    setOtpStep('email');
    setLoginEmail('');
    setOtpCode('');
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home / Puja Room',
      recipientName: session?.user.name || '',
      phone: session?.user.phone || '',
      streetAddress: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: DevoteeAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      if (editingAddressId) {
        await devoteeAuthService.updateAddress(
          session.user.id,
          editingAddressId,
          addressForm,
        );
      } else {
        await devoteeAuthService.addAddress(session.user.id, addressForm);
      }
      const refreshed = await devoteeAuthService.getAddresses(session.user.id);
      setAddresses(refreshed);
      setIsAddressModalOpen(false);
      toast.success('Puja shipping address saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!session) return;
    const ok = await confirm({
      title: 'Remove Puja Address',
      message: 'Are you sure you want to remove this sacred delivery address?',
      description: 'You can add or update your Puja shipping addresses anytime.',
      confirmText: 'Yes, Remove Address',
      cancelText: 'No, Keep It',
      isDanger: true,
      icon: 'trash',
    });
    if (!ok) return;

    try {
      await devoteeAuthService.deleteAddress(session.user.id, addressId);
      const refreshed = await devoteeAuthService.getAddresses(session.user.id);
      setAddresses(refreshed);
      toast.success('Puja shipping address removed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!session) return;
    try {
      await devoteeAuthService.setDefaultAddress(session.user.id, addressId);
      const refreshed = await devoteeAuthService.getAddresses(session.user.id);
      setAddresses(refreshed);
      toast.success('Primary Puja address updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to set default address.');
    }
  };

  /* ==========================================================================
     UNAUTHENTICATED VIEW: PASSWORDLESS SACRED OTP LOGIN
     ========================================================================== */
  if (!session) {
    return (
      <div className="login-hero-wrapper">
        <div className="login-hero-bg" aria-hidden="true">
          <div className="login-hero-overlay" />
        </div>

        <div className="container login-hero-container">
          {/* Left Column: Brand Philosophy & Elder-Friendly Benefits */}
          <div className="login-left-content">
            <div className="login-kicker">
              <span>FAITH</span>
              <span className="kicker-dot">✦</span>
              <span>TRADITION</span>
              <span className="kicker-dot">✦</span>
              <span>DEVOTION</span>
            </div>

            <h1 className="login-hero-headline">
              Enter Your
              <br />
              <span className="login-headline-accent">Sanctum Portal</span>
            </h1>

            <div className="login-lotus-divider" aria-hidden="true">
              <span className="divider-line" />
              <img
                src="/assets/gold_lotus_emblem.png"
                alt="Sacred Lotus"
                width={26}
                height={26}
                className="lotus-divider-img"
              />
              <span className="divider-line" />
            </div>

            <p className="login-hero-subtitle">
              Manage your orders, sacred delivery addresses, and blessing rewards without needing any passwords.
            </p>

            {/* Elder-Friendly Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={18} color="#d4af37" />
                <span style={{ color: '#ded4c3', fontSize: '0.9rem' }}>
                  <strong>Passwordless Login:</strong> 6-digit sacred email code.
                </span>
              </div>
            </div>

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
                  <span className="trust-title">Assay Certified</span>
                  <span className="trust-sub">Purity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: OTP Login Card */}
          <div className="login-right-content">
            <div className="login-glass-card">
              <div className="login-lotus-emblem-wrap">
                <div className="login-lotus-badge">
                  <img
                    src="/assets/gold_lotus_emblem.png"
                    alt="Sacred Lotus"
                    width={46}
                    height={46}
                    className="login-lotus-img"
                  />
                </div>
              </div>

              {errorMessage && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#86efac',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {otpStep === 'email' ? (
                <>
                  <div className="login-card-header">
                    <h2 className="login-card-title">Devotee Login</h2>
                    <p className="login-card-subtitle">
                      Enter your email to receive a sacred OTP. No password needed.
                    </p>
                  </div>

                  <form onSubmit={handleRequestOtp} className="login-card-form">
                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="acc-email">
                        Email Address
                      </label>
                      <div className="login-input-box">
                        <Mail size={18} className="login-input-icon" />
                        <input
                          id="acc-email"
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="devotee@example.com"
                          className="login-input-field"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isOtpLoading}
                      className="login-submit-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isOtpLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isOtpLoading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Dispatching Sacred Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Sacred OTP</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="login-card-header">
                    <h2 className="login-card-title">Verify Code</h2>
                    <p className="login-card-subtitle">
                      Enter the 6-digit code sent to:
                      <br />
                      <strong style={{ color: '#d4af37' }}>{loginEmail}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="login-card-form">
                    <div className="login-form-group">
                      <label className="login-input-label" htmlFor="acc-otp" style={{ textAlign: 'center', display: 'block' }}>
                        6-Digit Verification Code
                      </label>
                      <div className="login-input-box" style={{ justifyContent: 'center' }}>
                        <input
                          id="acc-otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="login-input-field"
                          style={{
                            textAlign: 'center',
                            fontSize: '1.6rem',
                            letterSpacing: '8px',
                            fontWeight: 700,
                          }}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isOtpLoading || otpCode.length !== 6}
                      className="login-submit-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isOtpLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isOtpLoading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Enter Sanctum</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '0.84rem' }}>
                      <button
                        type="button"
                        onClick={() => setOtpStep('email')}
                        style={{ background: 'none', border: 'none', color: '#9db3a8', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        ← Edit Email
                      </button>
                      <button
                        type="button"
                        disabled={otpCooldown > 0 || isOtpLoading}
                        onClick={handleRequestOtp}
                        style={{ background: 'none', border: 'none', color: otpCooldown > 0 ? '#6a7d74' : '#d4af37', fontWeight: 600, cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer' }}
                      >
                        {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: '#7f8f87',
                }}
              >
                Zero passwords. Kept signed in on this device for <strong>29 days</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     AUTHENTICATED DASHBOARD VIEW
     ========================================================================== */
  const user = session.user;

  return (
    <div className="account-page-wrapper">
      <div className="container">
        <div className="account-top-back-wrap">
          <BackButton label="Back to Store" />
        </div>

        {/* TOP HERO PROFILE BANNER (FLIPKART STYLE & LUXURY EMBLEM) */}
        <div className="account-hero-card">
          <div className="account-hero-brand-strip">
            <div className="account-brand-identity">
              <img
                src="/assets/brand_logo_gold.png"
                alt="Aamadappetti Panchaloham Jewellery"
                className="account-brand-logo-img"
              />
            </div>
            <div className="account-devotee-badge">
              <Sparkles size={12} className="text-gold" />
              <span>SANCTUM DEVOTEE</span>
            </div>
          </div>

          <div className="account-hero-main-row">
            <div className="account-hero-left">
              <div className="account-avatar-circle">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="account-user-details-wrap">
                <h1 className="account-user-name">Namaste, {user.name}</h1>
                <div className="account-user-meta">
                  <span className="account-email-chip">{user.email}</span>
                  {user.phone && (
                    <>
                      <span className="meta-dot">•</span>
                      <span>{user.phone}</span>
                    </>
                  )}
                  <span className="meta-dot meta-hide-mobile">•</span>
                  <span className="meta-highlight meta-hide-mobile">Member Since {user.memberSince || '2026'}</span>
                </div>
              </div>
            </div>

            <div className="account-hero-right">
              {/* Sanctum Wallet Store Credit Badge */}
              <div
                className="account-wallet-badge"
                onClick={() => handleTabClick('rewards')}
                role="button"
                tabIndex={0}
                title="Click to view rewards & wallet details"
              >
                <div className="wallet-label">Sanctum Wallet</div>
                <div className="wallet-amount">
                  {(referralSummary?.walletBalance || 0) < 0
                    ? `-₹${Math.abs(referralSummary?.walletBalance || 0).toLocaleString('en-IN')}`
                    : `₹${(referralSummary?.walletBalance || 0).toLocaleString('en-IN')}`}
                </div>
                <div className="wallet-sub">
                  {(referralSummary?.walletBalance || 0) < 0 ? 'Clawback Adj.' : 'Store Credit'}
                </div>
              </div>

              <button onClick={handleLogout} className="account-logout-btn" title="Sign out from this device">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="account-success-banner">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MAIN DASHBOARD CONTENT */}
        <div className="account-dashboard-grid">
          {/* SIDEBAR TABS (LUXURY MOBILE SLIDE PILLS & DESKTOP SIDEBAR) */}
          <div className="account-sidebar">
            <nav className="dashboard-nav" aria-label="Account Tabs">
              <button
                type="button"
                ref={(el) => { tabRefs.current['orders'] = el; }}
                onClick={() => handleTabClick('orders')}
                className={`dashboard-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Package size={17} />
                <span>Consecrated Orders</span>
                {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
              </button>

              <button
                type="button"
                ref={(el) => { tabRefs.current['rewards'] = el; }}
                onClick={() => handleTabClick('rewards')}
                className={`dashboard-tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
              >
                <Gift size={17} />
                <span>Refer &amp; Earn</span>
                <span className="tab-badge tab-badge-gold">₹100</span>
              </button>

              <button
                type="button"
                ref={(el) => { tabRefs.current['addresses'] = el; }}
                onClick={() => handleTabClick('addresses')}
                className={`dashboard-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              >
                <MapPin size={17} />
                <span>Puja Addresses</span>
                {addresses.length > 0 && <span className="tab-badge">{addresses.length}</span>}
              </button>

              <button
                type="button"
                ref={(el) => { tabRefs.current['profile'] = el; }}
                onClick={() => handleTabClick('profile')}
                className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={17} />
                <span>Devotee Profile</span>
              </button>
            </nav>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="account-main-content">
            {/* SECTION 1: CONSECRATED ORDERS */}
            {activeTab === 'orders' && (
              <div id="section-orders" className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h3 className="dashboard-section-title">Your Consecrated Orders</h3>
                    <p className="dashboard-section-subtitle">
                      Track the temple crafting, sanctum consecration, and doorstep journey of your sacred Panchaloham pieces.
                    </p>
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#d4af37' }}>
                    <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                    <p>Retrieving sanctum orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="dashboard-empty-card">
                    <Package size={48} className="empty-icon" />
                    <h4>No Orders Placed Yet</h4>
                    <p>Explore our handcrafted temple jewellery and consecrated Panchaloham idols.</p>
                    <Link href="/collections" className="btn-gold" style={{ display: 'inline-flex', padding: '10px 24px', marginTop: '14px' }}>
                      Explore Sacred Collections
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => {
                      const statusInfo = getOrderStatusInfo(order.status);
                      const isCopied = copiedOrderId === order.id;
                      const orderShortId = order.id.startsWith('ORD-') ? order.id : `ORD-${order.id.slice(0, 8).toUpperCase()}`;

                      return (
                        <div key={order.id} className="order-card active-order">
                          {/* Top Row: Status Pill + Date */}
                          <div className="order-header-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span
                                className={`order-status-badge ${statusInfo.badgeClass}`}
                                style={{
                                  background: statusInfo.bgColor,
                                  color: statusInfo.color,
                                  borderColor: statusInfo.borderColor,
                                }}
                              >
                                {statusInfo.icon}
                                <span>{statusInfo.label}</span>
                              </span>
                            </div>
                            <div className="order-date-text">
                              {order.date || 'Recent Order'}
                            </div>
                          </div>

                          {/* Middle Row: Order ID & Amount */}
                          <div className="order-meta-summary-row">
                            <div className="order-id-copy-wrap">
                              <span className="order-id-label">Order Number</span>
                              <div className="order-id-val-row">
                                <span className="order-id-code">#{orderShortId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyOrderId(order.id)}
                                  className="order-copy-btn"
                                  title="Copy Order ID"
                                >
                                  {isCopied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>

                            <div className="order-amount-wrap">
                              <span className="order-amount-label">Grand Total</span>
                              <div className="order-total-amount">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</div>
                            </div>
                          </div>

                          {/* 4-Step Sacred Journey Stepper */}
                          {statusInfo.stepIndex >= 0 && (
                            <div className="order-tracking-box">
                              <div className="tracking-steps">
                                {[
                                  { title: 'Confirmed', desc: 'Order Placed' },
                                  { title: 'Consecration', desc: 'Puja Sanctum' },
                                  { title: 'Dispatched', desc: 'In-Transit' },
                                  { title: 'Delivered', desc: 'Puja Altar' },
                                ].map((step, idx) => {
                                  const isDone = idx <= statusInfo.stepIndex;
                                  const isCurrent = idx === statusInfo.stepIndex;
                                  return (
                                    <div
                                      key={idx}
                                      className={`tracking-step ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                                    >
                                      <div className="step-dot">
                                        {isDone && !isCurrent ? <Check size={11} /> : idx + 1}
                                      </div>
                                      <div className="step-name">
                                        <strong>{step.title}</strong>
                                        <span className="step-desc-text">{step.desc}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Order Items List */}
                          <div className="order-items-list">
                            {Array.isArray(order.items) &&
                              order.items.map((item: any, i: number) => (
                                <div key={i} className="order-item-row">
                                  <img
                                    src={item.image || '/assets/prod_lakshmi_hq.webp'}
                                    alt={item.name}
                                    className="order-item-img"
                                  />
                                  <div className="order-item-details">
                                    <div className="order-item-name">{item.name}</div>
                                    <div className="order-item-metal-tag">Authentic 5-Metal Panchaloham</div>
                                    <div className="order-item-qty">
                                      Qty: {item.quantity} · ₹{(item.price || 0).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Delivery Address */}
                          {order.shippingAddress && (
                            <div className="order-delivery-address-box">
                              <div className="delivery-box-title">
                                <MapPin size={13} className="text-gold" />
                                <span>Puja Delivery Address</span>
                              </div>
                              <div className="delivery-box-text">{order.shippingAddress}</div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="order-actions-row">
                            <a
                              href={`https://api.whatsapp.com/send?phone=919840000000&text=${encodeURIComponent(
                                `Namaste Aamadappetti, I need assistance regarding my Order #${order.id}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="order-whatsapp-btn"
                            >
                              <MessageCircle size={16} />
                              <span>WhatsApp Order Support</span>
                            </a>
                            <Link href="/collections" className="order-reorder-btn">
                              <Sparkles size={15} />
                              <span>Explore More Pieces</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: REFER & EARN (SANCTUM WALLET & REWARDS) */}
            {activeTab === 'rewards' && (
              <div id="section-rewards" className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h3 className="dashboard-section-title">Refer Devotees &amp; Earn Sanctum Store Credit</h3>
                    <p className="dashboard-section-subtitle">
                      Share divine craftsmanship. Your friends receive ₹50 discount on their first order, and you earn ₹100 Sanctum Wallet store credit once their order is successfully delivered!
                    </p>
                  </div>
                </div>

                {/* 3-Card Metrics Summary */}
                <div className="referral-metrics-grid">
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(4, 20, 13, 0.8) 100%)',
                      border: '1.5px solid #d4af37',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#d4af37', marginBottom: '8px' }}>
                      <Coins size={20} />
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                        Sanctum Wallet Balance
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: 800, 
                      color: (referralSummary?.walletBalance || 0) < 0 ? '#f87171' : '#f5d77f' 
                    }}>
                      {(referralSummary?.walletBalance || 0) < 0
                        ? `-₹${Math.abs(referralSummary?.walletBalance || 0).toLocaleString('en-IN')}`
                        : `₹${(referralSummary?.walletBalance || 0).toLocaleString('en-IN')}`}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: (referralSummary?.walletBalance || 0) < 0 ? '#f87171' : '#4ade80', 
                      marginTop: '4px', 
                      fontWeight: 600 
                    }}>
                      {(referralSummary?.walletBalance || 0) < 0
                        ? 'Clawback adjustment from returned order pending (₹0 available)'
                        : 'Available for your next purchase'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(4, 20, 13, 0.7)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9db3a8', marginBottom: '8px' }}>
                      <User size={18} />
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Friends Referred
                      </span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fcf9f2' }}>
                      {referralSummary?.friendsReferred || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9db3a8', marginTop: '4px' }}>
                      Devotees introduced
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(4, 20, 13, 0.7)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9db3a8', marginBottom: '8px' }}>
                      <Gift size={18} />
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Total Rewards Earned
                      </span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
                      ₹{(referralSummary?.rewardsEarned || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9db3a8', marginTop: '4px' }}>
                      Delivered order credits
                    </div>
                  </div>
                </div>

                {/* Referral Code & Share Link Card */}
                {referralSummary?.referralCode && (
                  <div className="referral-share-card">
                    <div style={{ fontSize: '0.82rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                      Your Unique Referral Code
                    </div>
                    <div className="referral-code-big">
                      {referralSummary.referralCode}
                    </div>

                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        display: 'inline-block',
                        fontSize: '0.85rem',
                        color: '#d8e5df',
                        marginBottom: '16px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralSummary.referralCode}` : `/?ref=${referralSummary.referralCode}`}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(referralSummary.referralCode || '');
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="btn-gold"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.88rem' }}
                      >
                        {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Namaste! Join me at Aamadappetti Panchaloham Jewellery. Use my sacred referral code *${referralSummary.referralCode}* to get an instant ₹50 discount on your first order! ${typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralSummary.referralCode}` : ''}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#25D366',
                          color: '#05160f',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '0.88rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <Share2 size={16} />
                        <span>Share on WhatsApp</span>
                      </a>

                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/?ref=${referralSummary.referralCode}`;
                          navigator.clipboard.writeText(link);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        style={{
                          background: 'rgba(212,175,55,0.15)',
                          border: '1px solid rgba(212,175,55,0.6)',
                          color: '#f5d77f',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '0.88rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4-Step How It Works Card */}
                <div
                  style={{
                    background: 'rgba(4, 20, 13, 0.75)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '14px',
                    padding: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fcf9f2', margin: '0 0 16px 0' }}>
                    How the Sanctum Referral System Works
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ padding: '14px', background: 'rgba(2, 12, 8, 0.6)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                      <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        1. Share Link
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#c8dcd2', lineHeight: 1.4 }}>
                        Share your unique link <code style={{ color: '#f5d77f' }}>?ref={referralSummary?.referralCode || 'DIVINE123'}</code> with friends &amp; family.
                      </div>
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(2, 12, 8, 0.6)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                      <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        2. Locked to You
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#c8dcd2', lineHeight: 1.4 }}>
                        When your friend registers or checks out, their referral is locked permanently to you as their first referrer.
                      </div>
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(2, 12, 8, 0.6)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                      <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        3. Friend Gets ₹50 Off
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#c8dcd2', lineHeight: 1.4 }}>
                        Your friend enjoys an instant ₹50 welcome discount on their first sacred jewellery order.
                      </div>
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(2, 12, 8, 0.6)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                      <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        4. ₹100 on Delivery
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#c8dcd2', lineHeight: 1.4 }}>
                        Once your friend&apos;s order is safely <strong>Delivered</strong>, you receive ₹100 in your Sanctum Wallet!
                      </div>
                    </div>
                  </div>

                  {/* Reward Conditions Disclaimer */}
                  <div
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      borderLeft: '3px solid #d4af37',
                      borderRadius: '0 8px 8px 0',
                      padding: '12px 16px',
                      fontSize: '0.78rem',
                      color: '#b0c4b8',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: '#f5d77f' }}>Reward Conditions:</strong> Order must be successfully delivered. Cancelled/refunded orders don&apos;t qualify. One customer can be referred and rewarded only once. Referrer cannot refer themselves. No cash payout — wallet credit is automatically used for your next purchase.
                  </div>
                </div>

                {/* Referral History Table */}
                <div
                  style={{
                    background: 'rgba(4, 20, 13, 0.75)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '14px',
                    padding: '24px',
                  }}
                >
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fcf9f2', margin: '0 0 16px 0' }}>
                    Your Referral History
                  </h4>

                  {!referralSummary?.referrals || referralSummary.referrals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#8ea69b', fontSize: '0.88rem' }}>
                      No friends referred yet. Share your code <strong style={{ color: '#f5d77f' }}>{referralSummary?.referralCode}</strong> to start earning store credit!
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Friend (Devotee)</th>
                            <th style={{ padding: '10px' }}>Order ID</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Wallet Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralSummary.referrals.map((ref) => (
                            <tr key={ref.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#d8e5df' }}>
                              <td style={{ padding: '12px 10px' }}>{ref.refereeEmail}</td>
                              <td style={{ padding: '12px 10px' }}>#{ref.orderId}</td>
                              <td style={{ padding: '12px 10px' }}>
                                {ref.status === 'DELIVERED' ? (
                                  <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    ✓ Delivered &amp; Rewarded
                                  </span>
                                ) : ref.status === 'CANCELLED' ? (
                                  <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Cancelled
                                  </span>
                                ) : (
                                  <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#f5d77f', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    ⏳ Awaiting Delivery
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 10px', fontWeight: 700, color: ref.walletCredited ? '#4ade80' : '#8ea69b' }}>
                                {ref.walletCredited ? `+₹${ref.rewardAmount} Credited` : `₹${ref.rewardAmount} Pending`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Wallet Activity Ledger */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(212, 175, 55, 0.15)',
                    borderRadius: '16px',
                    padding: '28px',
                    marginTop: '28px',
                  }}
                >
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fcf9f2', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Sanctum Wallet Ledger (Audit Trail)</span>
                    <span style={{ fontSize: '0.8rem', color: '#8ea69b', fontWeight: 400 }}>Append-only ledger</span>
                  </h4>

                  {!referralSummary?.ledger || referralSummary.ledger.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#8ea69b', fontSize: '0.88rem' }}>
                      No wallet transactions recorded yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Date</th>
                            <th style={{ padding: '10px' }}>Type / Reference</th>
                            <th style={{ padding: '10px' }}>Amount</th>
                            <th style={{ padding: '10px' }}>Balance After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralSummary.ledger.map((tx) => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#d8e5df' }}>
                              <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                                {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td style={{ padding: '12px 10px' }}>
                                <div style={{ fontWeight: 600, color: tx.amount > 0 ? '#4ade80' : '#f87171' }}>
                                  {tx.type.replace(/_/g, ' ')}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#8ea69b' }}>
                                  {tx.description || (tx.referenceId ? `Ref #${tx.referenceId}` : '')}
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: '12px 10px',
                                  fontWeight: 700,
                                  color: tx.amount > 0 ? '#4ade80' : '#f87171',
                                }}
                              >
                                {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                              </td>
                              <td style={{ padding: '12px 10px', color: '#f5d77f', fontWeight: 600 }}>
                                ₹{tx.balanceAfter.toLocaleString('en-IN')}
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

            {/* SECTION 3: SAVED ADDRESSES (E-COMMERCE ADDRESS BOOK) */}
            {activeTab === 'addresses' && (
              <div id="section-addresses" className="dashboard-section">
                <div className="dashboard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 className="dashboard-section-title">Saved Puja &amp; Delivery Addresses</h3>
                    <p className="dashboard-section-subtitle">
                      Saved addresses automatically pre-fill at checkout for a frictionless, elder-friendly experience.
                    </p>
                  </div>
                  <button onClick={handleOpenAddAddress} className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.88rem' }}>
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="dashboard-empty-card">
                    <MapPin size={44} className="empty-icon" />
                    <h4>No Delivery Addresses Saved</h4>
                    <p>Add your home or puja sanctum address once, and it will be remembered for all future purchases.</p>
                    <button onClick={handleOpenAddAddress} className="btn-gold" style={{ marginTop: '12px' }}>
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="addresses-grid">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`address-card ${addr.isDefault ? 'default-address' : ''}`}
                        style={{ position: 'relative' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: addr.isDefault ? '#d4af37' : '#9db3a8',
                              background: addr.isDefault ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              border: addr.isDefault ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            {addr.isDefault ? '★ Primary Sanctum' : addr.label}
                          </span>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              style={{ background: 'none', border: 'none', color: '#9db3a8', cursor: 'pointer', padding: '4px' }}
                              title="Edit Address"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                              title="Delete Address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="address-name" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fcf9f2' }}>
                          {addr.recipientName}
                        </div>

                        <div className="address-body" style={{ color: '#c9bfaf', fontSize: '0.9rem', lineHeight: 1.6, margin: '8px 0' }}>
                          {addr.streetAddress}
                          <br />
                          {addr.city}, {addr.state} — {addr.pincode}
                          <br />
                          <span style={{ color: '#d4af37', fontSize: '0.85rem' }}>📞 Phone: {addr.phone}</span>
                        </div>

                        <div className="address-actions" style={{ marginTop: '12px', borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '10px' }}>
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="addr-action-btn"
                              style={{ color: '#d4af37', fontWeight: 600 }}
                            >
                              Set as Primary Address
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Default for Puja Deliveries
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* MODAL: ADD / EDIT ADDRESS */}
                {isAddressModalOpen && (
                  <div className="address-modal-backdrop">
                    <div className="address-modal-card">
                      <h3 style={{ color: '#f5eedb', margin: '0 0 4px 0', fontSize: '1.3rem' }}>
                        {editingAddressId ? 'Edit Puja Shipping Address' : 'Add New Puja Shipping Address'}
                      </h3>
                      <p style={{ color: '#9db3a8', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                        This address will be remembered and automatically populated at checkout.
                      </p>

                      <form onSubmit={handleSaveAddress}>
                        <div className="address-modal-grid-2">
                          <div>
                            <label className="login-input-label">Address Label</label>
                            <input
                              type="text"
                              required
                              value={addressForm.label}
                              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                              placeholder="e.g. Home / Puja Room"
                              className="login-input-field"
                            />
                          </div>
                          <div>
                            <label className="login-input-label">Recipient Name</label>
                            <input
                              type="text"
                              required
                              value={addressForm.recipientName}
                              onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                              placeholder="Full Name"
                              className="login-input-field"
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label className="login-input-label">Contact Phone (10 Digits)</label>
                          <input
                            type="tel"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="+91 98450 12345"
                            className="login-input-field"
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label className="login-input-label">Street Address &amp; Door No.</label>
                          <textarea
                            required
                            rows={2}
                            value={addressForm.streetAddress}
                            onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                            placeholder="Flat / House No., Sannadhi Street, Landmark"
                            className="login-input-field"
                            style={{ resize: 'none' }}
                          />
                        </div>

                        <div className="address-modal-grid-3">
                          <div>
                            <label className="login-input-label">City</label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              placeholder="Chennai"
                              className="login-input-field"
                            />
                          </div>
                          <div>
                            <label className="login-input-label">State</label>
                            <input
                              type="text"
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              placeholder="Tamil Nadu"
                              className="login-input-field"
                            />
                          </div>
                          <div>
                            <label className="login-input-label">Pincode</label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                              placeholder="600004"
                              className="login-input-field"
                            />
                          </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          />
                          <span style={{ fontSize: '0.88rem', color: '#ded4c3' }}>
                            Make this my primary address for future deliveries
                          </span>
                        </label>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(false)}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#b0a391',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: DEVOTEE PROFILE */}
            {activeTab === 'profile' && (
              <div id="section-profile" className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h3 className="dashboard-section-title">Devotee Profile Details</h3>
                    <p className="dashboard-section-subtitle">
                      Your identity in the sacred register. Logged in with passwordless OTP verification.
                    </p>
                  </div>
                </div>

                <div className="auth-form-row">
                  <div className="auth-input-group">
                    <label className="auth-label">Full Devotee Name</label>
                    <div className="auth-input-wrap">
                      <User size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="auth-input"
                        style={{ opacity: 0.9 }}
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label className="auth-label">Registered Email</label>
                    <div className="auth-input-wrap">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="auth-input"
                        style={{ opacity: 0.9 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-form-row">
                  <div className="auth-input-group">
                    <label className="auth-label">Contact Phone</label>
                    <div className="auth-input-wrap">
                      <Phone size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        value={user.phone || 'Not provided'}
                        readOnly
                        className="auth-input"
                        style={{ opacity: 0.9 }}
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label className="auth-label">Device Session Status</label>
                    <div className="auth-input-wrap">
                      <ShieldCheck size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        value={`Active for 29 Days (Expires in ${session.daysRemaining} days)`}
                        readOnly
                        className="auth-input"
                        style={{ color: '#d4af37', fontWeight: 600 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', background: 'rgba(212,175,55,0.06)', border: '1px dashed rgba(212,175,55,0.25)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', marginBottom: '6px' }}>
                    <ShieldCheck size={18} />
                    <strong style={{ fontSize: '0.92rem' }}>Seamless Security</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#9db3a8', lineHeight: 1.5 }}>
                    Your session is authorized without passwords. Every time you return to Aamadappetti, your session and saved addresses are immediately ready.
                  </p>
                </div>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}
