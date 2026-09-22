'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Truck,
  Calendar,
  Package,
  Gift,
  Copy,
  Check,
  Share2,
  Tag,
} from 'lucide-react';
import { ordersService } from '@/services/ordersService';
import { referralsService, UserReferralSummary } from '@/services/referralsService';
import { OrderCMS } from '@/data/cmsData';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || 'ORD-98425';
  const method = searchParams.get('method') || 'cashfree';

  const [order, setOrder] = useState<OrderCMS | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralSummary, setReferralSummary] = useState<UserReferralSummary | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (orderId) {
        try {
          const data = await ordersService.getById(orderId);
          setOrder(data);
          if (data?.email) {
            referralsService
              .getUserReferrals(data.email)
              .then(setReferralSummary)
              .catch(() => {});
          }
        } catch {
          // graceful fallback
        } finally {
          setLoading(false);
        }
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <div
      style={{
        minHeight: '90vh',
        background: 'radial-gradient(ellipse at top, #072a1b 0%, #020c08 100%)',
        color: '#fcf9f2',
        padding: '40px 16px 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          background: 'rgba(5, 22, 15, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Animated Check Badge */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(34, 197, 94, 0.25) 100%)',
            border: '2px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.35)',
          }}
        >
          <CheckCircle2 size={44} color="#d4af37" />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: '#4ade80',
            background: 'rgba(34, 197, 94, 0.15)',
            padding: '4px 14px',
            borderRadius: '20px',
            marginBottom: '16px',
            fontWeight: 600,
          }}
        >
          <span>Order Placed Successfully</span>
        </div>

        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '2rem',
            color: '#fcf9f2',
            marginBottom: '10px',
          }}
        >
          Thank You! Your Order is Confirmed
        </h1>

        <p
          style={{
            color: '#a3b8ad',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto 28px',
          }}
        >
          We have received your order. A confirmation has been sent to your email and phone.
          Our team is now carefully packing your jewellery for insured transit.
        </p>

        {/* Order Reference Box */}
        <div
          style={{
            background: 'rgba(2, 12, 8, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: '16px',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#8fa59b' }}>Order ID</div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#f5d77f',
                letterSpacing: '0.04em',
              }}
            >
              {orderId}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#8fa59b' }}>Payment Status</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#4ade80' }}>
              {method.includes('cod') ? 'Cash on Delivery (Pending)' : 'Paid Online (Cashfree)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#8fa59b' }}>Estimated Delivery</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fcf9f2' }}>
              Within 3-5 Business Days
            </div>
          </div>
        </div>

        {/* 4-Step Fulfillment Journey */}
        <div
          style={{
            background: 'rgba(2, 12, 8, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#d4af37',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Calendar size={16} />
            <span>Order Fulfillment Tracking</span>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  color: '#05160f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fcf9f2' }}>
                  Order Confirmed
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8fa59b' }}>
                  Your order has been recorded and verified.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#d4af37',
                  color: '#05160f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fcf9f2' }}>
                  Quality Inspection &amp; Packaging
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8fa59b' }}>
                  Each item is verified for metal assay certification and placed in premium packaging.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#8fa59b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fcf9f2' }}>
                  Insured Courier Dispatch
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6d8379' }}>
                  Handed over to express courier with tracking number.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#8fa59b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fcf9f2' }}>
                  Doorstep Delivery
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6d8379' }}>
                  Delivered securely to your address.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refer & Earn Viral Share Card */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(2, 12, 8, 0.9) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '12px',
            padding: '22px',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#d4af37',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            <Gift size={18} />
            <span>Refer a Devotee Friend &amp; Earn ₹{referralSummary?.referrerReward || 200}</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#b0c4b8', margin: '0 0 16px', lineHeight: 1.5 }}>
            Invite friends to Aamadappetti. They get{' '}
            <strong style={{ color: '#4ade80' }}>₹{referralSummary?.refereeDiscount || 100} off</strong> their
            first order, and you receive a{' '}
            <strong style={{ color: '#f5d77f' }}>₹{referralSummary?.referrerReward || 200} reward coupon</strong>!
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#f5d77f',
                background: 'rgba(2, 12, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '8px 18px',
                borderRadius: '8px',
                letterSpacing: '0.06em',
              }}
            >
              {referralSummary?.referralCode || 'BHAKTI-7K9'}
            </div>

            <button
              type="button"
              onClick={() => {
                const c = referralSummary?.referralCode || 'BHAKTI-7K9';
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

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                const c = referralSummary?.referralCode || 'BHAKTI-7K9';
                const shareUrl =
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/checkout?ref=${c}`
                    : `https://aamadappetti.in/checkout?ref=${c}`;
                navigator.clipboard?.writeText(shareUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: copiedLink ? '#4ade80' : '#fcf9f2',
                borderRadius: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} color="#d4af37" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const c = referralSummary?.referralCode || 'BHAKTI-7K9';
                const shareUrl =
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/checkout?ref=${c}`
                    : `https://aamadappetti.in/checkout?ref=${c}`;
                const msg = `🙏 Vanakkam! I just ordered consecrated Panchaloham temple jewellery from Aamadappetti. Use my referral code ${c} at checkout to get ₹${referralSummary?.refereeDiscount || 100} off your order!\n\n${shareUrl}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/collections"
            className="btn-gold"
            style={{
              padding: '12px 28px',
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/account"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#fcf9f2',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={16} color="#d4af37" />
            <span>View Account &amp; Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37',
          }}
        >
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
