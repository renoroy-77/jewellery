import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ChevronRight, CheckCircle2, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = constructMetadata({
  title: 'Refunds & Cancellations Policy | Aamadappetti',
  description:
    'Learn about Aamadappetti’s transparent Refunds & Cancellations policy. Hassle-free 7-day returns, instant cancellation, and secure refunds via PayU within 5-7 business days.',
  canonicalUrl: '/refunds-and-cancellations',
});

export default function RefundsAndCancellationsPage() {
  return (
    <div className="section-padding" style={{ minHeight: '85vh', background: 'var(--bg-dark, #04130c)' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div className="pdp-top-bar" style={{ marginBottom: '28px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />
          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 500 }}>Refunds &amp; Cancellations</span>
          </nav>
        </div>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            <RefreshCw size={15} />
            <span>Devotee Protection &amp; Assurance</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              color: '#fff9eb',
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: '12px',
            }}
          >
            Refunds &amp; Cancellations Policy
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
            Transparent guidelines for order cancellations, 7-day exchanges, and payment gateway refunds
          </p>
        </div>

        {/* Policy Content Card */}
        <div
          style={{
            background: 'rgba(5, 22, 15, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '16px',
            padding: '40px 32px',
            color: 'rgba(255, 255, 255, 0.88)',
            lineHeight: 1.8,
            fontSize: '1rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Quick Summary Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '36px',
            }}
          >
            <div style={{ background: 'rgba(212, 175, 55, 0.07)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <Clock size={20} color="#d4af37" style={{ marginBottom: '8px' }} />
              <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.95rem' }}>Pre-Dispatch Cancellation</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                Cancel anytime before sanctum dispatch with 100% full refund.
              </p>
            </div>

            <div style={{ background: 'rgba(212, 175, 55, 0.07)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <RefreshCw size={20} color="#d4af37" style={{ marginBottom: '8px' }} />
              <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.95rem' }}>7-Day Return / Exchange</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                Easy return or ring/kada size replacement within 7 days of delivery.
              </p>
            </div>

            <div style={{ background: 'rgba(212, 175, 55, 0.07)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <CreditCard size={20} color="#d4af37" style={{ marginBottom: '8px' }} />
              <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.95rem' }}>5–7 Day Bank Refund</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                Refunds processed through PayU directly back to source account.
              </p>
            </div>
          </div>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              1. Order Cancellation Policy
            </h2>
            <p>
              At <strong>Aamadappetti</strong> (operated by <strong>Athira Rajendran</strong>), each sacred piece is consecrated and prepared with Vedic reverence. We understand that circumstances may require order modification or cancellation:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>
                <strong>Cancellations Prior to Dispatch:</strong> Devotees may cancel standard orders anytime prior to package handover to the courier. Upon cancellation, a <strong>100% full refund</strong> will be initiated immediately.
              </li>
              <li>
                <strong>Post-Dispatch Cancellations:</strong> If your order has already been handed over to the courier (with tracking assigned), it cannot be cancelled in transit. Please receive the package and initiate a standard 7-day return request upon arrival.
              </li>
              <li>
                <strong>Custom Agamic Commissions:</strong> Custom deity pendants or personalized wedding thali orders that have already undergone sacred casting cannot be cancelled once casting has commenced.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              2. 7-Day Return &amp; Exchange Policy
            </h2>
            <p>
              We want every devotee to cherish their sacred jewel. You are eligible for a replacement, exchange, or refund within <strong>7 days</strong> of delivery under the following conditions:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>
                <strong>Transit Damage or Manufacturing Defect:</strong> If the jewel arrives damaged or with any structural defect, we will arrange an immediate free replacement or full refund.
              </li>
              <li>
                <strong>Size Adjustment:</strong> For bangles, rings, and kadas, we offer one-time size exchange assistance within 7 days.
              </li>
              <li>
                <strong>Condition of Item:</strong> The jewellery piece must be unworn, undamaged by the user, and returned with its original sacred velvet packaging and hallmark authenticity certificate.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              3. Refund Process &amp; Timelines
            </h2>
            <p>
              All refunds are handled through licensed payment gateway channels (such as <strong>PayU Payments</strong>) directly to the devotee’s original source of payment:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>
                <strong>Approval Timeline:</strong> Once the returned item is received at our master atelier and inspected for hallmark integrity, refund approval is communicated within <strong>24–48 hours</strong>.
              </li>
              <li>
                <strong>Settlement Timeline:</strong> The refund is credited back to your original payment method (Bank Account, UPI, Debit/Credit Card) within <strong>5 to 7 business days</strong>, subject to your issuing bank’s standard clearing cycles.
              </li>
              <li>
                <strong>Cash on Delivery (COD) Orders:</strong> For orders placed through COD, refunds will be transferred via NEFT/IMPS or UPI directly to the devotee’s verified bank account details provided upon return approval.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              4. How to Request Cancellation or Refund
            </h2>
            <p>
              To initiate a cancellation, return, or refund, simply reach our Devotee Care team with your Order ID:
            </p>
            <div style={{ marginTop: '14px', padding: '16px 20px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', borderLeft: '3px solid #d4af37' }}>
              <p style={{ margin: 0 }}><strong>Aamadappetti Devotee Support Desk</strong></p>
              <p style={{ margin: '4px 0' }}>Email: <a href="mailto:support@aamadappetti.com" style={{ color: '#d4af37' }}>support@aamadappetti.com</a></p>
              <p style={{ margin: '4px 0' }}>WhatsApp Support: <a href="https://wa.me/919600000000" target="_blank" rel="noopener noreferrer" style={{ color: '#d4af37' }}>+91 96000 00000</a></p>
              <p style={{ margin: 0 }}>Subject Line format: <em>&quot;Return/Cancellation Request - Order #ORD-XXXXX&quot;</em></p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#d4af37" />
              5. Merchant Right of Cancellation
            </h2>
            <p>
              Aamadappetti reserves the right to cancel any order if:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>The delivery address provided is unserviceable by our insured courier partners.</li>
              <li>A pricing error occurred on the website due to technical typographical glitches.</li>
              <li>Payment authorization was flagged as suspicious or unauthorized by fraud prevention systems.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              In all merchant-initiated cancellation cases, a <strong>100% full refund</strong> is processed back to the customer immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
