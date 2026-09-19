'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Sparkles,
  User as UserIcon,
  Phone,
  CheckCircle2,
} from 'lucide-react';

type LoginView = 'login' | 'register' | 'forgot';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  deity: string;
  nakshatra: string;
  memberSince: string;
  punyamPoints: number;
}

const DEMO_USER: UserProfile = {
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@example.com',
  phone: '+91 98450 12345',
  deity: 'Goddess Lakshmi',
  nakshatra: 'Rohini',
  memberSince: 'January 2025',
  punyamPoints: 750,
};

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<LoginView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDeity, setRegDeity] = useState('Goddess Lakshmi');
  const [forgotInput, setForgotInput] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aamadappetti_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = emailOrPhone.includes('@')
      ? emailOrPhone.split('@')[0].replace(/[._]/g, ' ')
      : 'Devotee';
    const capitalizedName =
      displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const loggedUser: UserProfile = {
      ...DEMO_USER,
      name: capitalizedName || 'Rajesh Sharma',
      email: emailOrPhone.includes('@') ? emailOrPhone : 'devotee@aamadappetti.in',
      phone: !emailOrPhone.includes('@') && emailOrPhone ? emailOrPhone : '+91 98450 12345',
    };

    localStorage.setItem('aamadappetti_user', JSON.stringify(loggedUser));
    router.push('/account');
  };

  const handleDemoLogin = () => {
    localStorage.setItem('aamadappetti_user', JSON.stringify(DEMO_USER));
    router.push('/account');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      name: regName || 'Devotee',
      email: regEmail || 'devotee@aamadappetti.in',
      phone: regPhone || '+91 99000 00000',
      deity: regDeity,
      nakshatra: 'Anuradha',
      memberSince: 'September 2026',
      punyamPoints: 250,
    };
    localStorage.setItem('aamadappetti_user', JSON.stringify(newUser));
    router.push('/account');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    setTimeout(() => {
      setRecoverySent(false);
      setView('login');
    }, 4000);
  };

  return (
    <div className="login-hero-wrapper">
      {/* Background Image & Atmospheric Layers */}
      <div className="login-hero-bg" aria-hidden="true">
        <div className="login-hero-overlay" />
      </div>

      <div className="container login-hero-container">
        {/* LEFT COLUMN: Brand Philosophy & Heritage */}
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

          {/* Already logged in quick banner if session exists */}
          {currentUser && (
            <div className="login-existing-session-banner">
              <Sparkles size={16} className="text-gold" />
              <span>
                Currently signed in as <strong>{currentUser.name}</strong>.
              </span>
              <Link href="/account" className="existing-session-link">
                Go to Dashboard →
              </Link>
            </div>
          )}

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

        {/* RIGHT COLUMN: Glassmorphism Login Card */}
        <div className="login-right-content">
          <div className="login-glass-card">
            {/* Top Sacred Lotus Circular Emblem */}
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

            {/* VIEW 1: SIGN IN */}
            {view === 'login' && (
              <>
                <div className="login-card-header">
                  <h2 className="login-card-title">Welcome Back</h2>
                  <p className="login-card-subtitle">
                    Sign in to your Aamadappetti account and continue your journey of devotion.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="login-card-form">
                  {/* Field: Email or Mobile Number */}
                  <div className="login-form-group">
                    <label className="login-input-label" htmlFor="login-identifier">
                      Email or Mobile Number
                    </label>
                    <div className="login-input-box">
                      <Mail size={18} className="login-input-icon" />
                      <input
                        id="login-identifier"
                        type="text"
                        required
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="e.g. rajesh@example.com or 9845012345"
                        className="login-input-field"
                      />
                    </div>
                  </div>

                  {/* Field: Password */}
                  <div className="login-form-group">
                    <div className="login-label-row">
                      <label className="login-input-label" htmlFor="login-password">
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
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  {/* Checkbox: Keep me signed in */}
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

                  {/* Submit Button */}
                  <button type="submit" className="login-primary-btn">
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </button>

                  {/* Instant Demo Access Button */}
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="login-demo-pill"
                  >
                    <Sparkles size={14} className="text-gold" />
                    <span>Instant Demo Login (Rajesh Sharma)</span>
                  </button>

                  {/* Divider */}
                  <div className="login-divider">
                    <span className="login-divider-text">New to Aamadappetti?</span>
                  </div>

                  {/* Secondary CTA */}
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

            {/* VIEW 2: REGISTER */}
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
                    <label className="login-input-label" htmlFor="reg-name">
                      Full Devotee Name
                    </label>
                    <div className="login-input-box">
                      <UserIcon size={18} className="login-input-icon" />
                      <input
                        id="reg-name"
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
                    <label className="login-input-label" htmlFor="reg-email">
                      Email Address
                    </label>
                    <div className="login-input-box">
                      <Mail size={18} className="login-input-icon" />
                      <input
                        id="reg-email"
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
                    <label className="login-input-label" htmlFor="reg-phone">
                      Mobile Number (Puja dispatch updates)
                    </label>
                    <div className="login-input-box">
                      <Phone size={18} className="login-input-icon" />
                      <input
                        id="reg-phone"
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
                    <label className="login-input-label" htmlFor="reg-deity">
                      Ishta Devata (Guardian Deity)
                    </label>
                    <select
                      id="reg-deity"
                      value={regDeity}
                      onChange={(e) => setRegDeity(e.target.value)}
                      className="login-select-field"
                    >
                      <option value="Goddess Lakshmi">Goddess Lakshmi (Prosperity & Grace)</option>
                      <option value="Lord Ganesha">Lord Ganesha (Remover of Obstacles)</option>
                      <option value="Lord Murugan">Lord Murugan (Courage & Agamic Purity)</option>
                      <option value="Lord Shiva">Lord Shiva (Cosmic Consciousness)</option>
                      <option value="Lord Venkateswara">Lord Venkateswara (Tirupati Balaji)</option>
                      <option value="Goddess Saraswati">Goddess Saraswati (Wisdom & Knowledge)</option>
                    </select>
                  </div>

                  <div className="login-form-group">
                    <label className="login-input-label" htmlFor="reg-password">
                      Create Sacred Passcode
                    </label>
                    <div className="login-input-box">
                      <Lock size={18} className="login-input-icon" />
                      <input
                        id="reg-password"
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

            {/* VIEW 3: FORGOT PASSWORD */}
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
                      <label className="login-input-label" htmlFor="forgot-id">
                        Registered Email or Mobile
                      </label>
                      <div className="login-input-box">
                        <Mail size={18} className="login-input-icon" />
                        <input
                          id="forgot-id"
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

            {/* Card Security Footer */}
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
