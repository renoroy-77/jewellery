import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy | Aamadappetti Panchaloham Temple Jewellery',
  description:
    'Read Aamadappetti’s Privacy Policy. Transparent information about how we collect, protect, and process devotee personal and payment transaction data securely.',
  canonicalUrl: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="section-padding" style={{ minHeight: '85vh', background: 'var(--bg-dark, #04130c)' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div className="pdp-top-bar" style={{ marginBottom: '28px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />
          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 500 }}>Privacy Policy</span>
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
            <Lock size={15} />
            <span>Data Protection &amp; Confidentiality</span>
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
            Privacy Policy
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
            Last Updated: September 2026 • Your sacred devotee privacy is our foremost responsibility
          </p>
        </div>

        {/* Merchant & Business Compliance Box */}
        <div
          style={{
            background: 'rgba(10, 36, 25, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            fontSize: '0.85rem',
            lineHeight: '1.6',
          }}
        >
          <div>
            <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600 }}>Legal Business Name:</div>
            <div style={{ color: '#fff9eb', fontWeight: 600 }}>Athira Rajendran</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.8rem' }}>
              Operating Brand / Trade Name: <strong>Aamadappetti</strong>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600 }}>Business Category:</div>
            <div style={{ color: '#fff9eb', fontWeight: 600 }}>
              Precious &amp; Semi-Precious Jewellery (MCC: 5944)
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.8rem' }}>
              Retail sale of finished Panchaloham temple jewellery &amp; artefacts
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600 }}>Operating Location:</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Kannur, Kerala – 670650, India
            </div>
          </div>
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
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              1. Information We Collect
            </h2>
            <p>
              When you purchase consecrated temple jewellery or submit an inquiry on <strong>aamadappetti.com</strong> (owned and operated by <strong>Athira Rajendran</strong>), we collect necessary devotee information, including your full name, shipping and billing address, email address, phone/WhatsApp number, and optional temple sankalpam blessing notes.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              2. Payment Security &amp; PCI-DSS Compliance
            </h2>
            <p>
              We do <strong>not</strong> store your credit card numbers, debit card CVVs, or Net Banking credentials on our servers. All financial transactions are encrypted through 256-bit SSL encryption and processed directly by RBI-licensed payment aggregators (such as <strong>PayU Payments</strong>) complying with strict global PCI-DSS standards.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              3. How We Use Your Information
            </h2>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>To fulfill and securely deliver your consecrated jewellery order.</li>
              <li>To dispatch shipment tracking updates via email or SMS/WhatsApp.</li>
              <li>To provide customer support and master artisan consultation responses.</li>
              <li>To maintain your devotee account profile and saved addresses upon OTP authentication.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              4. Data Sharing &amp; Third Parties
            </h2>
            <p>
              We do not sell, rent, or trade your personal data. Customer delivery details are shared exclusively with trusted logistics partners (Blue Dart, Delhivery, Speed Post, DHL) solely for delivery fulfillment.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              5. Contact Us Regarding Privacy
            </h2>
            <p>
              If you have inquiries about this Privacy Policy or wish to request data updates, please contact our Data Protection Officer at:
            </p>
            <div style={{ marginTop: '12px', padding: '16px 20px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', borderLeft: '3px solid #d4af37' }}>
              <p style={{ margin: 0 }}><strong>Aamadappetti Privacy &amp; Grievance Desk</strong></p>
              <p style={{ margin: '4px 0' }}>Operating Entity: <strong>Athira Rajendran (Brand: Aamadappetti)</strong></p>
              <p style={{ margin: '4px 0' }}>Grievance Officer: <strong>Athira Rajendran</strong></p>
              <p style={{ margin: '4px 0' }}>Registered Address: <strong>Eazhaparambil, Edayar, Kannavam P.O., Koloyad, Kannur, Kerala – 670650, India</strong></p>
              <p style={{ margin: '4px 0' }}>Email: <a href="mailto:support@aamadappetti.com" style={{ color: '#d4af37' }}>support@aamadappetti.com</a></p>
              <p style={{ margin: 0 }}>Helpline: <a href="tel:+917012732880" style={{ color: '#d4af37' }}>+91 70127 32880</a> (Mon – Sat, 9:00 AM – 6:00 PM IST)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
