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
} from 'lucide-react';
import {
  referralsService,
  AdminReferralSettings,
  ReferralRecord,
} from '@/services/referralsService';

export default function AdminReferralsPage() {
  const [settings, setSettings] = useState<AdminReferralSettings>({
    id: 'default',
    enabled: true,
    refereeDiscountRupees: 100,
    referrerRewardRupees: 200,
    minOrderSubtotal: 500,
  });

  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'REWARDED' | 'PENDING' | 'REVERSED'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
      if (fetchedReferrals) setReferrals(fetchedReferrals);
    } catch {
      // Keep defaults
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await referralsService.updateAdminSettings({
        enabled: settings.enabled,
        refereeDiscountRupees: Number(settings.refereeDiscountRupees),
        referrerRewardRupees: Number(settings.referrerRewardRupees),
        minOrderSubtotal: Number(settings.minOrderSubtotal),
      });
      setSettings(updated);
      showToast('Referral program settings updated and synchronized with backend!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update referral settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const filteredReferrals = referrals.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.refereeEmail.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      (r.referrerName && r.referrerName.toLowerCase().includes(q)) ||
      (r.referrerCode && r.referrerCode.toLowerCase().includes(q)) ||
      (r.rewardCoupon && r.rewardCoupon.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const totalRewardsGranted = referrals
    .filter((r) => r.status === 'REWARDED')
    .reduce((sum, r) => sum + r.rewardAmount, 0);

  const pendingCount = referrals.filter((r) => r.status === 'PENDING').length;
  const rewardedCount = referrals.filter((r) => r.status === 'REWARDED').length;

  return (
    <div className="admin-page-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #041f14 0%, #03140c 100%)',
            border: '1px solid #d4af37',
            color: '#fcf9f2',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Sparkles size={24} color="#d4af37" />
          <h1 style={{ fontSize: '1.8rem', color: '#fcf9f2', margin: 0 }}>
            Referrals &amp; Rewards Program
          </h1>
        </div>
        <p style={{ color: '#9db3a8', fontSize: '0.92rem', margin: 0 }}>
          Manage referral rules, discount amounts, referrer reward coupons, and track friend invitations.
        </p>
      </div>

      {/* Analytics Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            background: 'rgba(4, 20, 13, 0.75)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#8fa59b', textTransform: 'uppercase', marginBottom: '6px' }}>
            Total Friends Referred
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fcf9f2' }}>
            {referrals.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px' }}>
            {rewardedCount} orders confirmed
          </div>
        </div>

        <div
          style={{
            background: 'rgba(4, 20, 13, 0.75)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#8fa59b', textTransform: 'uppercase', marginBottom: '6px' }}>
            Rewards Granted
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#d4af37' }}>
            ₹{totalRewardsGranted.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b0c4b8', marginTop: '4px' }}>
            Single-use referrer coupons
          </div>
        </div>

        <div
          style={{
            background: 'rgba(4, 20, 13, 0.75)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#8fa59b', textTransform: 'uppercase', marginBottom: '6px' }}>
            Pending Verification
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f5d77f' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8fa59b', marginTop: '4px' }}>
            Awaiting order confirmation
          </div>
        </div>

        <div
          style={{
            background: 'rgba(4, 20, 13, 0.75)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#8fa59b', textTransform: 'uppercase', marginBottom: '6px' }}>
            Program Status
          </div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: settings.enabled ? '#4ade80' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: settings.enabled ? '#4ade80' : '#f87171',
                boxShadow: settings.enabled ? '0 0 10px #4ade80' : 'none',
              }}
            />
            <span>{settings.enabled ? 'Active at Checkout' : 'Paused / Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Backend Control Settings Card */}
      <form
        onSubmit={handleSaveSettings}
        style={{
          background: 'rgba(4, 20, 13, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '36px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            paddingBottom: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fcf9f2', margin: 0 }}>
              Backend Program Rules &amp; Controls
            </h2>
            <p style={{ color: '#8fa59b', fontSize: '0.85rem', margin: '4px 0 0' }}>
              These parameters directly control the checkout discounts and referrer reward values.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
              color: '#05160f',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Toggle on/off */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: '#b0c4b8',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Referral Program Status
            </label>
            <div
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(2, 12, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '24px',
                  borderRadius: '12px',
                  background: settings.enabled ? '#4ade80' : '#4b5563',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#05160f',
                    position: 'absolute',
                    top: '3px',
                    left: settings.enabled ? '21px' : '3px',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.9rem', color: settings.enabled ? '#4ade80' : '#9ca3af' }}>
                {settings.enabled ? 'Enabled at Checkout' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Friend Discount */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: '#b0c4b8',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Friend Discount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={settings.refereeDiscountRupees}
              onChange={(e) =>
                setSettings({ ...settings, refereeDiscountRupees: Number(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(2, 12, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '6px',
                color: '#fcf9f2',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.72rem', color: '#8fa59b', marginTop: '4px' }}>
              Instant welcome deduction on the friend&apos;s first purchase.
            </div>
          </div>

          {/* Referrer Reward */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: '#b0c4b8',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Referrer Reward Coupon (₹)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={settings.referrerRewardRupees}
              onChange={(e) =>
                setSettings({ ...settings, referrerRewardRupees: Number(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(2, 12, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '6px',
                color: '#fcf9f2',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.72rem', color: '#8fa59b', marginTop: '4px' }}>
              Single-use reward coupon generated for referrer when payment succeeds.
            </div>
          </div>

          {/* Min Order Subtotal */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: '#b0c4b8',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Minimum Order Subtotal (₹)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={settings.minOrderSubtotal}
              onChange={(e) =>
                setSettings({ ...settings, minOrderSubtotal: Number(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(2, 12, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '6px',
                color: '#fcf9f2',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.72rem', color: '#8fa59b', marginTop: '4px' }}>
              Minimum cart value required before referral code can be applied.
            </div>
          </div>
        </div>
      </form>

      {/* Referrals Audit Table Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'REWARDED', 'PENDING', 'REVERSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border:
                  statusFilter === st
                    ? '1px solid #d4af37'
                    : '1px solid rgba(212, 175, 55, 0.2)',
                background:
                  statusFilter === st
                    ? 'rgba(212, 175, 55, 0.15)'
                    : 'rgba(2, 12, 8, 0.6)',
                color: statusFilter === st ? '#f5d77f' : '#8fa59b',
                cursor: 'pointer',
              }}
            >
              {st === 'all' ? 'All Referrals' : st}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={16}
            color="#8fa59b"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, order, or coupon..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'rgba(2, 12, 8, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '6px',
              color: '#fcf9f2',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'rgba(4, 20, 13, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(2, 12, 8, 0.95)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600 }}>Referrer</th>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600 }}>Invited Friend</th>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600 }}>Referrer Reward Coupon</th>
                <th style={{ padding: '14px 16px', color: '#d4af37', fontWeight: 600, textAlign: 'right' }}>
                  Reward (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#8fa59b' }}>
                    {isLoading
                      ? 'Loading referrals from PostgreSQL database...'
                      : 'No referral activity found matching your filter.'}
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px 16px', color: '#8fa59b', whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fcf9f2' }}>{item.referrerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#d4af37' }}>
                        Code: <code>{item.referrerCode}</code>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#b0c4b8' }}>
                      <div>{item.refereeEmail}</div>
                      {item.refereePhone && (
                        <div style={{ fontSize: '0.75rem', color: '#8fa59b' }}>{item.refereePhone}</div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <Link
                        href={`/admin/orders?search=${item.orderId}`}
                        style={{
                          color: '#f5d77f',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500,
                        }}
                      >
                        <span>{item.orderId}</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>

                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          background:
                            item.status === 'REWARDED'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : item.status === 'PENDING'
                              ? 'rgba(212, 175, 55, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            item.status === 'REWARDED'
                              ? '#4ade80'
                              : item.status === 'PENDING'
                              ? '#f5d77f'
                              : '#f87171',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {item.rewardCoupon ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code
                            style={{
                              background: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: '#f5d77f',
                              fontSize: '0.8rem',
                            }}
                          >
                            {item.rewardCoupon}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.rewardCoupon!)}
                            title="Copy coupon code"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedCoupon === item.rewardCoupon ? '#4ade80' : '#8fa59b',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Copy size={13} />
                          </button>
                          {item.rewardCouponUsed && (
                            <span style={{ fontSize: '0.7rem', color: '#9db3a8', fontStyle: 'italic' }}>
                              (Used)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Issued on confirmation</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#4ade80' }}>
                      ₹{item.rewardAmount.toLocaleString('en-IN')}
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
