import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ChevronRight, FileText, Scale, CheckCircle2 } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = constructMetadata({
  title: 'Terms & Conditions | Aamadappetti',
  description:
    'Read the official Terms and Conditions of Aamadappetti. Details regarding product orders, INR pricing, payment processing, intellectual property, and user agreements.',
  canonicalUrl: '/terms-and-conditions',
});

export default function TermsAndConditionsPage() {
  return (
    <div className="section-padding" style={{ minHeight: '85vh', background: 'var(--bg-dark, #04130c)' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div className="pdp-top-bar" style={{ marginBottom: '28px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />
          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 500 }}>Terms &amp; Conditions</span>
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
            <Scale size={15} />
            <span>Legal &amp; User Agreement</span>
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
            Terms &amp; Conditions
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
            Last Updated: September 2026 • Effective for all devotees and website users of Aamadappetti
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
              1. Introduction &amp; Ownership
            </h2>
            <p>
              Welcome to <strong>Aamadappetti</strong> (accessible at <a href="https://aamadappetti.com" style={{ color: '#d4af37', textDecoration: 'underline' }}>https://aamadappetti.com</a>). The website and brand Aamadappetti are owned and operated by <strong>Athira Rajendran</strong>. By visiting, browsing, registering, or placing an order on our platform, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions, our Privacy Policy, our Shipping &amp; Return Policy, and our Refunds &amp; Cancellations Policy.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              2. Products, Business Category &amp; Currency (INR)
            </h2>
            <p>
              Aamadappetti operates within the business category of <strong>Precious &amp; Semi-Precious Jewellery (MCC Code: 5944)</strong>, specializing in authentic Agamic <strong>Panchaloham temple jewellery</strong> (an alloy of Gold, Silver, Copper, Zinc, and Iron) cast following traditional Shilpa Shastras and Agamic guidelines.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>
                <strong>Permitted &amp; Finished Goods Only:</strong> We exclusively sell finished consecrated temple jewellery, deity lockets, and sacred spiritual artefacts. We do <strong>NOT</strong> sell loose or unset diamonds (MCC 5094), bullion, raw precious metals for speculative investment, or any prohibited items under PayU or RBI regulatory frameworks.
              </li>
              <li>
                <strong>Currency of Transaction:</strong> All product and service prices on this website are listed in <strong>Indian Rupees (INR - ₹)</strong> and are inclusive of applicable statutory taxes (GST) unless explicitly noted.
              </li>
              <li>
                <strong>Handcrafted Nature:</strong> As our consecrated jewellery is handcrafted by generational master sthapatis, subtle variations in polish, weight, and engravings are hallmarks of authentic artisanal work.
              </li>
              <li>
                <strong>Price Revisions:</strong> We reserve the right to revise prices for precious metals and craftsmanship based on market conditions without prior notice. However, orders already confirmed will be fulfilled at the ordered price.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              3. Orders &amp; Payment Processing
            </h2>
            <p>
              We provide secure, PCI-DSS compliant online payment facilities powered by licensed payment gateway aggregators, including <strong>PayU Payments</strong>, supporting UPI, Debit Cards, Credit Cards, and Net Banking.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>
                An order is deemed accepted only upon successful payment authorization or COD verification confirmation.
              </li>
              <li>
                You agree to provide authentic and accurate customer billing and delivery information.
              </li>
              <li>
                In the event of a payment transaction failure where money has been debited, the payment aggregator / bank typically initiates an automated reversal within 5–7 banking days.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              4. Shipping, Transit Insurance &amp; Delivery
            </h2>
            <p>
              Orders are packaged in tamper-evident sacred gift boxing and fully insured during transit. Domestic shipments across India typically deliver within 3–5 business days via trusted carriers (Blue Dart, Delhivery, Speed Post). International orders are fulfilled via DHL / FedEx.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              5. Intellectual Property
            </h2>
            <p>
              All trademarks, sanctum photographs, product descriptions, website graphics, logo marks, and textual materials on <strong>aamadappetti.com</strong> are the exclusive intellectual property of Aamadappetti and protected under the Indian Copyright Act and Trademark laws. Unauthorized reproduction is strictly prohibited.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              6. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms and Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Kannur, Kerala, India.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#f5d77f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#d4af37" />
              7. Contact &amp; Grievance Redressal
            </h2>
            <p>
              For questions regarding our terms, order inquiries, or grievances:
            </p>
            <div style={{ marginTop: '12px', padding: '16px 20px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', borderLeft: '3px solid #d4af37' }}>
              <p style={{ margin: 0 }}><strong>Aamadappetti Temple Jewellery Atelier</strong></p>
              <p style={{ margin: '4px 0' }}>Operating Legal Entity: <strong>Athira Rajendran (Brand: Aamadappetti)</strong></p>
              <p style={{ margin: '4px 0' }}>Registered Address: <strong>Eazhaparambil, Edayar, Kannavam P.O., Koloyad, Kannur, Kerala – 670650, India</strong></p>
              <p style={{ margin: '4px 0' }}>Email: <a href="mailto:support@aamadappetti.com" style={{ color: '#d4af37' }}>support@aamadappetti.com</a></p>
              <p style={{ margin: '4px 0' }}>Helpline / WhatsApp: <a href="tel:+917012732880" style={{ color: '#d4af37' }}>+91 70127 32880</a></p>
              <p style={{ margin: 0 }}>Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
