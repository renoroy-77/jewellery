'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  UserCheck,
} from 'lucide-react';
import {
  devoteeAuthService,
  DevoteeSessionData,
} from '@/services/devoteeAuthService';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  // Step state: 'enter-email' | 'enter-otp'
  const [step, setStep] = useState<'enter-email' | 'enter-otp'>('enter-email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Active 29-day device session
  const [existingSession, setExistingSession] = useState<DevoteeSessionData | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check stored 29-day session on mount
  useEffect(() => {
    const session = devoteeAuthService.getStoredSession();
    if (session) {
      setExistingSession(session);
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await devoteeAuthService.sendOtp(cleanEmail);
      if (res.success) {
        setStep('enter-otp');
        setStatusMessage({
          type: 'success',
          text: `Sacred verification code sent to ${cleanEmail}. Check your inbox.`,
        });
        setCooldown(res.cooldownRemaining || 45);
        // Auto-focus first OTP digit
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to send OTP.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error dispatching OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];
    if (cleaned.length > 1) {
      // Handle paste of whole 6-digit code
      const pasted = cleaned.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleaned ? cleaned.slice(-1) : '';
    setOtp(newOtp);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
      setActiveOtpIndex(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      setActiveOtpIndex(index - 1);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setStatusMessage({ type: 'error', text: 'Please enter all 6 digits of the verification code.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await devoteeAuthService.verifyOtp(email, fullCode);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `${res.message} Staying signed in on this device for 29 days!`,
        });
        setTimeout(() => {
          router.push(redirectTarget);
        }, 800);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Verification failed. Please check the code or request a new one.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Switch account / Logout existing session
  const handleSwitchAccount = () => {
    devoteeAuthService.clearSession();
    setExistingSession(null);
    setStep('enter-email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setStatusMessage(null);
  };

  return (
    <div className="login-hero-wrapper">
      {/* Sanctum Background */}
      <div className="login-hero-bg" aria-hidden="true">
        <div className="login-hero-overlay" />
      </div>

      <div className="container login-hero-container">
        {/* LEFT COLUMN: Sacred Brand Essence & Elder-Friendly Trust Indicators */}
        <div className="login-left-content">
          <div className="login-kicker">
            <span className="kicker-gem">❖</span>
            <span>AAMADAPPETTI DEVOTEE SANCTUM</span>
            <span className="kicker-gem">❖</span>
          </div>

          <h1 className="login-hero-headline">
            Sacred Login
            <br />
            <span className="login-headline-accent">Without Passwords</span>
          </h1>

          <div className="login-lotus-divider" aria-hidden="true">
            <span className="divider-line" />
            <img
              src="/assets/gold_lotus_emblem.png"
              alt="Lotus Emblem"
              width={26}
              height={26}
              className="lotus-divider-img"
            />
            <span className="divider-line" />
          </div>

          <p className="login-hero-subtitle">
            Experience effortless, password-free login designed with reverence for every devotee.
          </p>

          {/* Active 29-Day Session Banner */}
          {existingSession && (
            <div
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#d4af37" />
                <span style={{ color: '#f5eedb', fontSize: '0.92rem' }}>
                  Signed in as <strong>{existingSession.user.name}</strong> ({existingSession.user.email})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#9db3a8' }}>
                  ✓ Valid on this device for <strong>{existingSession.daysRemaining} more days</strong>
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link
                    href={redirectTarget}
                    className="btn-gold"
                    style={{
                      padding: '6px 16px',
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Enter Sanctum →
                  </Link>
                  <button
                    onClick={handleSwitchAccount}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#b0a391',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Elderly & Hassle-Free Benefits List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: '50%', padding: '6px', marginTop: '2px' }}>
                <KeyRound size={16} color="#d4af37" />
              </div>
              <div>
                <strong style={{ color: '#fcf9f2', fontSize: '0.95rem' }}>No Passwords to Remember</strong>
                <p style={{ color: '#9db3a8', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                  Receive a single 6-digit code via email. No forgetting passwords or recovery hassles.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: '50%', padding: '6px', marginTop: '2px' }}>
                <CheckCircle2 size={16} color="#d4af37" />
              </div>
              <div>
                <strong style={{ color: '#fcf9f2', fontSize: '0.95rem' }}>Stay Signed In for 29 Days</strong>
                <p style={{ color: '#9db3a8', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                  Your phone or computer remembers your sanctum access for 29 days unless you logout.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: '50%', padding: '6px', marginTop: '2px' }}>
                <UserCheck size={16} color="#d4af37" />
              </div>
              <div>
                <strong style={{ color: '#fcf9f2', fontSize: '0.95rem' }}>Instant Auto-Registration</strong>
                <p style={{ color: '#9db3a8', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                  First time here? No sign-up form needed. Your account is automatically activated.
                </p>
              </div>
            </div>
          </div>

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
                <span className="trust-title">Assay Certified</span>
                <span className="trust-sub">Purity</span>
              </div>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <div className="trust-icon-box">
                <Leaf size={20} className="trust-icon" />
              </div>
              <div className="trust-text">
                <span className="trust-title">Sacred Puja</span>
                <span className="trust-sub">Blessed Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Glassmorphism Card */}
        <div className="login-right-content">
          <div className="login-glass-card">
            {/* Top Sacred Lotus Emblem */}
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

            {/* Notification / Alert Message */}
            {statusMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  background:
                    statusMessage.type === 'success'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${
                    statusMessage.type === 'success'
                      ? 'rgba(34, 197, 94, 0.4)'
                      : 'rgba(239, 68, 68, 0.4)'
                  }`,
                  color: statusMessage.type === 'success' ? '#86efac' : '#fca5a5',
                  fontSize: '0.88rem',
                }}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* STEP 1: ENTER EMAIL FOR SACRED OTP */}
            {step === 'enter-email' && (
              <>
                <div className="login-card-header">
                  <h2 className="login-card-title">Devotee Login</h2>
                  <p className="login-card-subtitle">
                    Enter your email to receive a sacred 6-digit verification code. No password required.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="login-card-form">
                  <div className="login-form-group">
                    <label className="login-input-label" htmlFor="devotee-email">
                      Email Address
                    </label>
                    <div className="login-input-box">
                      <Mail size={18} className="login-input-icon" />
                      <input
                        id="devotee-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="login-input-field"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9db3a8', marginTop: '6px', display: 'block' }}>
                      We will email your 6-digit code with our sacred gold temple badge.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="login-submit-btn"
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Sending Sacred Code...</span>
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
            )}

            {/* STEP 2: ENTER 6-DIGIT OTP */}
            {step === 'enter-otp' && (
              <>
                <div className="login-card-header">
                  <h2 className="login-card-title">Enter Sacred Code</h2>
                  <p className="login-card-subtitle">
                    We sent a 6-digit verification code to:
                    <br />
                    <strong style={{ color: '#d4af37' }}>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="login-card-form">
                  {/* 6 Digit Individual Inputs */}
                  <div className="login-form-group">
                    <label className="login-input-label" style={{ textAlign: 'center', display: 'block' }}>
                      Enter 6-Digit Code
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        margin: '12px 0 16px 0',
                      }}
                    >
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onFocus={() => setActiveOtpIndex(idx)}
                          style={{
                            width: '46px',
                            height: '56px',
                            textAlign: 'center',
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#fcf9f2',
                            background: 'rgba(5, 22, 15, 0.9)',
                            border:
                              activeOtpIndex === idx
                                ? '2px solid #d4af37'
                                : '1px solid rgba(212, 175, 55, 0.35)',
                            borderRadius: '10px',
                            outline: 'none',
                            boxShadow:
                              activeOtpIndex === idx
                                ? '0 0 12px rgba(212, 175, 55, 0.3)'
                                : 'none',
                            transition: 'all 0.2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="login-submit-btn"
                    style={{
                      opacity: isLoading || otp.join('').length !== 6 ? 0.6 : 1,
                      cursor: isLoading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Verifying Sanctum Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Enter Sanctum</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Resend and Change Email options */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setStep('enter-email');
                        setStatusMessage(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9db3a8',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      ← Change Email
                    </button>

                    <button
                      type="button"
                      disabled={cooldown > 0 || isLoading}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: cooldown > 0 ? '#6a7d74' : '#d4af37',
                        fontWeight: 600,
                        cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                        padding: 0,
                      }}
                    >
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Sacred OTP'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Reassurance Footer */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#7f8f87',
                lineHeight: 1.5,
              }}
            >
              🔒 Stored securely on your device for <strong>29 days</strong>.
              <br />
              Zero passwords to remember. Handcrafted with reverence.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            minHeight: '80vh',
            background: 'radial-gradient(circle at top, #141f17 0%, #03100a 100%)',
          }}
        />
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
