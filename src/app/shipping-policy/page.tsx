import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Shipping, Returns & Authenticity Policies',
  description:
    'Transparent details regarding our insured temple packaging, worldwide courier delivery, and 7-day exchange policies.',
  canonicalUrl: '/shipping-policy',
});

export default function ShippingPolicyPage() {
  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1 className="section-title" style={{ marginBottom: '24px' }}>
          Shipping & Authenticity Policies
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.8' }}>
          <section>
            <h2 style={{ fontSize: '1.4rem', color: '#fff9eb', marginBottom: '12px' }}>
              1. Domestic Shipping within India
            </h2>
            <p>
              All orders above <strong>₹999</strong> receive 100% free express delivery. Domestic orders are dispatched within 24 hours of consecration and usually arrive within 3–5 business days via Blue Dart, Delhivery, or Speed Post. Every package is sealed in tamper-evident spiritual gift boxing and fully insured.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: '#fff9eb', marginBottom: '12px' }}>
              2. International Worldwide Delivery
            </h2>
            <p>
              We deliver worldwide to devotees across the USA, UK, UAE, Canada, Singapore, Malaysia, and Europe via DHL Express and FedEx. International orders typically reach within 5–7 business days.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: '#fff9eb', marginBottom: '12px' }}>
              3. 7-Day Sacred Return & Exchange
            </h2>
            <p>
              If your jewellery item is damaged during transit or requires size replacement (e.g. rings or kadas), you may request a hassle-free exchange within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: '#fff9eb', marginBottom: '12px' }}>
              4. Authenticity Guarantee
            </h2>
            <p>
              Each item is cast according to classical Panchaloham proportions and comes with an individual Assay Certificate confirming the presence of the five sacred elements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
