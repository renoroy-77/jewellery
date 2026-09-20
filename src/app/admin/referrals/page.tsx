'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Save,
  Copy,
  ExternalLink,
  Users,
  ShieldAlert,
  Coins,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Loader2,
  Check,
  Percent,
  Sliders,
} from 'lucide-react';
import {
  referralsService,
  AdminReferralSettings,
  ReferralRecord,
} from '@/services/referralsService';
import { toast } from 'sonner';

export default function AdminReferralsPage() {
  const [settings, setSettings] = useState<AdminReferralSettings>({
    id: 'default',
    enabled: true,
    refereeDiscountRupees: 50,
    referrerRewardRupees: 100,
    minOrderSubtotal: 500,
  });

  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'DELIVERED' | 'PENDING' | 'CANCELLED'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedSettings, fetchedReferrals] = await Promise.all([
        referralsService.getAdminSettings(),
        referralsService.getAdminReferrals(),
      ]);
      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedReferrals && Array.isArray(fetchedReferrals)) {
        setReferrals(fetchedReferrals);
      }
    } catch (err: any) {
      console.error('Failed to load referrals data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await referralsService.updateAdminSettings({
        enabled: settings.enabled,
        refereeDiscountRupees: Number(settings.refereeDiscountRupees),
        referrerRewardRupees: Number(settings.referrerRewardRupees),
        minOrderSubtotal: Number(settings.minOrderSubtotal),
      });
      setSettings(updated);
      showToast('Referral program settings successfully saved to Neon Cloud PostgreSQL!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update referral settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const filteredReferrals = referrals.filter((r) => {
    const s = r.status as string;
    const matchesStatus =
      statusFilter === 'all' ||
      s === statusFilter ||
      (statusFilter === 'DELIVERED' && (s === 'DELIVERED' || s === 'REWARDED')) ||
      (statusFilter === 'CANCELLED' && (s === 'CANCELLED' || s === 'REVERSED'));
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.refereeEmail.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      (r.referrerName && r.referrerName.toLowerCase().includes(q)) ||
      (r.referrerCode && r.referrerCode.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const totalRewardsGranted = referrals
    .filter((r) => r.status === 'DELIVERED' || (r.status as string) === 'REWARDED' || r.walletCredited)
    .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  const pendingCount = referrals.filter((r) => r.status === 'PENDING').length;
  const deliveredCount = referrals.filter((r) => r.status === 'DELIVERED' || (r.status as string) === 'REWARDED' || r.walletCredited).length;
  const cancelledCount = referrals.filter((r) => r.status === 'CANCELLED' || (r.status as string) === 'REVERSED').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: toastMessage.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: '#ffffff',
            border: toastMessage.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '0.88rem',
            fontWeight: 500,
          }}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} color="#34d399" />
          ) : (
            <AlertCircle size={18} color="#f87171" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-cinzel, serif)',
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              REFERRALS &amp; REWARDS
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: settings.enabled ? '#ecfdf5' : '#fef2f2',
                color: settings.enabled ? '#047857' : '#b91c1c',
                border: `1px solid ${settings.enabled ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: settings.enabled ? '#10b981' : '#ef4444',
                }}
              />
              {settings.enabled ? 'Active at Checkout' : 'Program Paused'}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Configure backend referral discounts, manage referrer reward coupons, and monitor devotee invitations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadData}
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Loader2 size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Database'}</span>
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-gold"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Card 1: Total Referred */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Friends Referred
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
              {referrals.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 500, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} />
              <span>{deliveredCount} orders delivered &amp; rewarded</span>
            </div>
          </div>
        </div>

        {/* Card 2: Rewards Granted */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rewards Granted
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <Coins size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b45309', lineHeight: 1 }}>
              ₹{totalRewardsGranted.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
              Credited directly to referrers&apos; Sanctum Wallets
            </div>
          </div>
        </div>

        {/* Card 3: Pending Delivery */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Delivery
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
              Orders awaiting delivery before wallet credit
            </div>
          </div>
        </div>

        {/* Card 4: Current Rules Overview */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Incentives
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#faf5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9333ea',
              }}
            >
              <Gift size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              ₹{settings.refereeDiscountRupees} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>off friend</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0d5438', fontWeight: 600, marginTop: '4px' }}>
              + ₹{settings.referrerRewardRupees} wallet credit on delivery
            </div>
          </div>
        </div>
      </div>

      {/* Backend Program Rules & Controls (Clean Light Card) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        {/* Card Header Bar */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#0d5438',
                color: '#fcd34d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Program Rules &amp; Discount Configuration
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                These parameters directly govern the live checkout discounts and devotee coupon rewards.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="admin-btn admin-btn-gold"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Save size={14} />
            <span>{isSaving ? 'Updating...' : 'Update Rules'}</span>
          </button>
        </div>

        {/* Card Form Body */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            {/* 1. Toggle Switch */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Referral Program Status
              </label>
              <div
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  background: settings.enabled ? '#f0fdf4' : '#f8fafc',
                  border: settings.enabled ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: settings.enabled ? '#10b981' : '#cbd5e1',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: settings.enabled ? '23px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: settings.enabled ? '#065f46' : '#64748b' }}>
                    {settings.enabled ? 'Enabled at Checkout' : 'Paused / Inactive'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {settings.enabled ? 'Devotees can redeem codes' : 'Referral box hidden at checkout'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Friend Discount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Friend Welcome Discount (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={settings.refereeDiscountRupees}
                  onChange={(e) =>
                    setSettings({ ...settings, refereeDiscountRupees: Number(e.target.value) })
                  }
                  className="admin-form-input"
                  style={{ paddingLeft: '32px', fontWeight: 600, fontSize: '0.95rem' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', margin: '6px 0 0' }}>
                Instant rupee deduction deducted from the friend&apos;s first purchase.
              </p>
            </div>

            {/* 3. Referrer Reward */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Referrer Reward (Wallet Credit) (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={settings.referrerRewardRupees}
                  onChange={(e) =>
                    setSettings({ ...settings, referrerRewardRupees: Number(e.target.value) })
                  }
                  className="admin-form-input"
                  style={{ paddingLeft: '32px', fontWeight: 600, fontSize: '0.95rem' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', margin: '6px 0 0' }}>
                Store credit automatically credited to the referrer&apos;s Sanctum Wallet once the order status is Delivered.
              </p>
            </div>

            {/* 4. Minimum Subtotal */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Minimum Order Subtotal (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={settings.minOrderSubtotal}
                  onChange={(e) =>
                    setSettings({ ...settings, minOrderSubtotal: Number(e.target.value) })
                  }
                  className="admin-form-input"
                  style={{ paddingLeft: '32px', fontWeight: 600, fontSize: '0.95rem' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', margin: '6px 0 0' }}>
                Cart minimum required before referral discounts can be unlocked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals Audit Trail Section */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Table Filters and Search Bar */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(
              [
                { key: 'all', label: 'All Referrals', count: referrals.length },
                { key: 'DELIVERED', label: 'Delivered & Credited', count: deliveredCount },
                { key: 'PENDING', label: 'Pending Delivery', count: pendingCount },
                { key: 'CANCELLED', label: 'Cancelled', count: cancelledCount },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? '1px solid #0d5438' : '1px solid #e2e8f0',
                    background: isActive ? '#0d5438' : '#ffffff',
                    color: isActive ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email, order, or referrer..."
              className="admin-form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referrer</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invited Friend</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reward Method &amp; Wallet Status</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                  Reward (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                        }}
                      >
                        <Gift size={22} />
                      </div>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                        No referral activity matching current filter
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, maxWidth: '420px' }}>
                        Devotees receive their personal referral link on their account page. When a friend uses the link at checkout, the verified record will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    {/* Date */}
                    <td style={{ padding: '14px 18px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Referrer */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.referrerName || 'Devotee User'}
                      </div>
                      {item.referrerCode && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '3px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            backgroundColor: '#f1f5f9',
                            color: '#0d5438',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          {item.referrerCode}
                        </span>
                      )}
                    </td>

                    {/* Referee Email */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>
                        {item.refereeEmail}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                        First Order Devotee
                      </span>
                    </td>

                    {/* Order ID */}
                    <td style={{ padding: '14px 18px' }}>
                      <Link
                        href={`/admin/orders`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#0d5438',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          padding: '2px 8px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '6px',
                        }}
                      >
                        <span>{item.orderId.substring(0, 12)}...</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: '14px 18px' }}>
                      {(item.status === 'DELIVERED' || (item.status as string) === 'REWARDED' || item.walletCredited) && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>DELIVERED &amp; CREDITED</span>
                        </span>
                      )}
                      {item.status === 'PENDING' && !item.walletCredited && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                          }}
                        >
                          <Clock size={13} />
                          <span>AWAITING DELIVERY</span>
                        </span>
                      )}
                      {(item.status === 'CANCELLED' || (item.status as string) === 'REVERSED') && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                          }}
                        >
                          <XCircle size={13} />
                          <span>CANCELLED</span>
                        </span>
                      )}
                    </td>

                    {/* Reward Method & Wallet Status */}
                    <td style={{ padding: '14px 18px' }}>
                      {item.walletCredited || item.status === 'DELIVERED' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#065f46',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          <Coins size={14} color="#059669" />
                          <span>Sanctum Wallet Balance</span>
                        </span>
                      ) : item.status === 'CANCELLED' || (item.status as string) === 'REVERSED' ? (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Ineligible / Cancelled</span>
                      ) : (
                        <span style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: 500 }}>
                          Credited Upon Delivery
                        </span>
                      )}
                    </td>

                    {/* Reward Amount */}
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: item.walletCredited || item.status === 'DELIVERED' ? '#059669' : '#0f172a', fontSize: '0.95rem' }}>
                      +₹{item.rewardAmount || 100}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
