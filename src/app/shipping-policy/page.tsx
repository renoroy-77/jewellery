import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Clock,
  Globe2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = constructMetadata({
  title: 'Shipping and Return Policy | Aamadappetti Panchaloham Temple Jewellery',
  description:
    'Read Aamadappetti’s transparent Shipping and Return Policy. Free domestic express shipping above ₹999, worldwide delivery, tamper-evident insured packaging, and 7-day hassle-free return and exchange guarantee.',
  canonicalUrl: '/shipping-policy',
});

export default function ShippingAndReturnPolicyPage() {
  return (
    <div className="section-padding" style={{ minHeight: '85vh', background: 'var(--bg-dark, #04130c)' }}>
      <div className="container" style={{ maxWidth: '920px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div className="pdp-top-bar" style={{ marginBottom: '28px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />
          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 500 }}>
              Shipping &amp; Return Policy
            </span>
          </nav>
        </div>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#d4af37',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            <Truck size={15} />
            <span>Fulfillment &amp; Returns Assurance</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
              color: '#fff9eb',
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: '12px',
            }}
          >
            Shipping &amp; Return Policy
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto' }}>
            Last Updated: September 2026 • Insured sacred packaging, express domestic delivery, and 7-day hassle-free devotee returns
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
            lineHeight: 1.6,
          }}
        >
          <div>
            <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600 }}>Legal Business Name:</div>
            <div style={{ color: '#fff9eb', fontWeight: 600 }}>Athira Rajendran</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.8rem' }}>
              Operating Brand: <strong>Aamadappetti</strong>
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

        {/* Summary Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              textAlign: 'center',
            }}
          >
            <Clock size={24} color="#d4af37" style={{ margin: '0 auto 8px' }} />
            <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.98rem' }}>24–48 Hours</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
              Sanctum Dispatch &amp; Consecration
            </p>
          </div>

          <div
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              textAlign: 'center',
            }}
          >
            <Truck size={24} color="#d4af37" style={{ margin: '0 auto 8px' }} />
            <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.98rem' }}>3–5 Business Days</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
              Express Delivery Across India
            </p>
          </div>

          <div
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              textAlign: 'center',
            }}
          >
            <RotateCcw size={24} color="#d4af37" style={{ margin: '0 auto 8px' }} />
            <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.98rem' }}>7 Days Return</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
              Replacement &amp; Size Exchange
            </p>
          </div>

          <div
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              textAlign: 'center',
            }}
          >
            <ShieldCheck size={24} color="#d4af37" style={{ margin: '0 auto 8px' }} />
            <div style={{ color: '#fff9eb', fontWeight: 600, fontSize: '0.98rem' }}>100% Insured</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
              Tamper-Proof Sanctum Packaging
            </p>
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
          {/* SECTION A: SHIPPING POLICY */}
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--gold, #d4af37)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              Part A
            </div>
            <h2
              style={{
                fontSize: '1.6rem',
                color: '#fff9eb',
                fontFamily: 'var(--font-serif, "Cinzel", serif)',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              Shipping &amp; Delivery Terms
            </h2>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                1. Order Dispatch &amp; Consecration Timeline
              </h3>
              <p>
                Each authentic <strong>Panchaloham temple jewellery</strong> piece purchased on <strong>aamadappetti.com</strong> (owned &amp; operated by <strong>Athira Rajendran</strong>) is subjected to sanctum inspection and sacred cleaning prior to dispatch. Standard catalog orders are dispatched from our atelier within <strong>24 to 48 business hours</strong> of order confirmation and payment clearance.
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                2. Domestic Shipping Charges &amp; Delivery Timelines (India)
              </h3>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>
                  <strong>Free Express Shipping:</strong> All domestic orders with a cart value equal to or exceeding <strong>₹999</strong> qualify for 100% Free Express Delivery across India.
                </li>
                <li>
                  <strong>Standard Shipping Fee:</strong> Orders below ₹999 incur a nominal flat shipping fee of <strong>₹99</strong>.
                </li>
                <li>
                  <strong>Delivery Timelines:</strong> Domestic shipments typically arrive within <strong>3 to 5 business days</strong> from the date of dispatch, depending on recipient pin code accessibility (metros usually 2–3 days; regional areas 4–5 days).
                </li>
                <li>
                  <strong>Courier Partners:</strong> We ship via reputed, premier logistics carriers including <strong>Blue Dart Express</strong>, <strong>Delhivery</strong>, and <strong>India Post Speed Post</strong>.
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                3. Worldwide International Shipping
              </h3>
              <p>
                We proudly ship consecrated temple jewellery to devotees worldwide across the United States, United Kingdom, UAE, Canada, Singapore, Malaysia, Australia, and Europe:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>
                  <strong>International Carriers:</strong> Dispatched via <strong>DHL Express</strong> and <strong>FedEx International Priority</strong> with end-to-end customs clearance assistance.
                </li>
                <li>
                  <strong>International Transit Time:</strong> Typically delivered within <strong>5 to 7 business days</strong> globally.
                </li>
                <li>
                  <strong>Customs &amp; Import Duties:</strong> Any country-specific statutory customs duty, VAT, or local levies imposed by destination customs are the responsibility of the recipient.
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                4. Tamper-Evident Insured Packaging
              </h3>
              <p>
                Every jewel is cushioned in plush velvet temple gift cases, vacuum-sealed inside tamper-evident waterproof outer packaging, and accompanied by an authentic government-laboratory assayed <strong>Panchaloham Metallurgical Certificate</strong>. All shipments are <strong>100% transit-insured</strong> against loss, theft, or damage during transit until safe delivery at your doorstep.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                5. Shipment Tracking
              </h3>
              <p>
                Once your package is handed over to our logistics partner, an automated confirmation containing your Air Waybill (AWB) Tracking Number and live tracking URL will be sent to your registered Email and WhatsApp/SMS. You can track your parcel in real-time until delivery.
              </p>
            </section>
          </div>

          {/* SECTION B: RETURN & REPLACEMENT POLICY */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--gold, #d4af37)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              Part B
            </div>
            <h2
              style={{
                fontSize: '1.6rem',
                color: '#fff9eb',
                fontFamily: 'var(--font-serif, "Cinzel", serif)',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              Return, Replacement &amp; Exchange Policy
            </h2>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                6. 7-Day Devotee Return Window
              </h3>
              <p>
                We hold our consecrated craftsmanship to the highest temple standards. If you are not completely satisfied with your purchase, you may request a <strong>return, exchange, or refund within 7 days</strong> from the date of delivery.
              </p>
              <div
                style={{
                  marginTop: '12px',
                  padding: '16px 20px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  borderRadius: '10px',
                  borderLeft: '3px solid #d4af37',
                }}
              >
                <div style={{ fontWeight: 600, color: '#f5d77f', marginBottom: '6px' }}>
                  Eligible Return Situations:
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.94rem' }}>
                  <li><strong>Transit Damage or Structural Defect:</strong> Received defective, damaged, or broken.</li>
                  <li><strong>Incorrect Product:</strong> Received a different model, deity icon, or size than ordered.</li>
                  <li><strong>Size Mismatch:</strong> Ring or kada size does not fit comfortably; one-time size swap is offered.</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                7. Return Guidelines &amp; Condition
              </h3>
              <p>
                To qualify for a valid return or exchange:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>The jewellery piece must remain <strong>unworn, unaltered, and unscratched</strong>.</li>
                <li>The item must be returned in its original velvet jewellery box with all original security tags, packaging, and the assay certificate intact.</li>
                <li>Custom bespoke deity castings or personalized wedding thalis cast specifically under personal astrological sankalpam are non-returnable unless defective.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                8. Step-by-Step Return Process
              </h3>
              <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Initiate Request:</strong> Email us at <a href="mailto:support@aamadappetti.com" style={{ color: '#d4af37' }}>support@aamadappetti.com</a> or WhatsApp <a href="https://wa.me/917012732880" style={{ color: '#d4af37' }}>+91 70127 32880</a> within 7 days of package delivery with your Order ID and photo/video of the item.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Reverse Pickup:</strong> Our support desk will arrange a complimentary insured reverse courier pickup from your delivery address through Blue Dart / Delhivery (subject to pin code serviceability). If reverse pickup is unserviceable at your location, we will provide our atelier return address and reimburse standard courier charges.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Atelier Inspection:</strong> Upon receipt at our Kannur workshop, our master artisans inspect the piece to verify hallmark integrity.
                </li>
                <li>
                  <strong>Resolution:</strong> A replacement unit is dispatched within 2 business days, or a 100% full refund is issued back to your source account.
                </li>
              </ol>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                9. Refund Settlement Timelines
              </h3>
              <p>
                All refunds are credited directly back to the devotee’s original payment method via licensed payment aggregators (such as <strong>PayU Payments</strong>):
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li><strong>Prepaid Orders (UPI / Cards / Net Banking):</strong> Credited within <strong>5 to 7 business days</strong> of inspection approval.</li>
                <li><strong>Cash on Delivery (COD):</strong> Refunded via direct NEFT / IMPS or UPI to the bank account designated by the customer within 3–5 business days.</li>
              </ul>
              <p style={{ marginTop: '10px', fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                For comprehensive details on cancellations, please review our full <Link href="/refunds-and-cancellations" style={{ color: '#d4af37', textDecoration: 'underline' }}>Refund &amp; Cancellation Policy</Link>.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.25rem', color: '#f5d77f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#d4af37" />
                10. Customer Support &amp; Grievance Redressal
              </h3>
              <p>
                Our Devotee Care team is at your sacred service for any shipping, tracking, or return inquiries:
              </p>
              <div
                style={{
                  marginTop: '14px',
                  padding: '20px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  fontSize: '0.92rem',
                }}
              >
                <div>
                  <div style={{ color: '#f5d77f', fontWeight: 600, marginBottom: '4px' }}>Devotee Care Desk</div>
                  <div>Operating Entity: <strong>Athira Rajendran (Aamadappetti)</strong></div>
                  <div>Email: <a href="mailto:support@aamadappetti.com" style={{ color: '#d4af37' }}>support@aamadappetti.com</a></div>
                  <div>Helpline / WhatsApp: <a href="tel:+917012732880" style={{ color: '#d4af37' }}>+91 70127 32880</a></div>
                </div>
                <div>
                  <div style={{ color: '#f5d77f', fontWeight: 600, marginBottom: '4px' }}>Registered Atelier Address</div>
                  <div>Eazhaparambil, Edayar, Kannavam P.O.</div>
                  <div>Koloyad, Kannur, Kerala – 670650, India</div>
                  <div>Operating Hours: Mon – Sat, 9:00 AM – 6:00 PM IST</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
