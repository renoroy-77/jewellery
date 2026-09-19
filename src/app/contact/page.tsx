import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Mail, Phone, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import ContactForm from '@/components/ContactForm';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us & Temple Atelier',
  description:
    'Reach out to our customer care team for jewellery enquiries, orders, and sacred gifting consultations.',
  canonicalUrl: '/contact',
});

export default function ContactPage() {
  return (
    <div className="contact-page-root section-padding">
      <div className="container contact-container">
        {/* Top Navigation Bar */}
        <div className="pdp-top-bar" style={{ marginBottom: '24px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />

          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold-light)', fontWeight: 500 }}>
              Contact Us &amp; Atelier
            </span>
          </nav>
        </div>

        {/* Section Header */}
        <div className="contact-header">
          <div className="section-kicker">GET IN TOUCH</div>
          <h1 className="contact-title">Temple Consultation &amp; Support</h1>
          <p className="contact-subtitle">
            Have questions about deity alignment, sizing, or international blessing deliveries? We are here to guide your pilgrimage.
          </p>
        </div>

        {/* Contact Page Responsive Grid */}
        <div className="contact-page-grid">
          {/* Interactive Contact Form Card */}
          <div className="contact-card contact-form-card">
            <h2 className="contact-card-heading">
              Send an Inquiry
            </h2>
            <ContactForm />
          </div>

          {/* Contact Details & Info Card */}
          <div className="contact-sidebar">
            <div className="contact-card contact-info-card">
              <div className="contact-info-item">
                <div className="contact-info-icon-wrap">
                  <MapPin size={20} color="#d4af37" />
                </div>
                <div>
                  <h3 className="contact-info-title">Artisan Atelier</h3>
                  <p className="contact-info-desc">
                    Heritage Temple Goldsmith Atelier<br />
                    Sanctum Jewellery Studios<br />
                    India
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon-wrap">
                  <Mail size={18} color="#d4af37" />
                </div>
                <div>
                  <h3 className="contact-info-title">Email Support</h3>
                  <a href="mailto:support@aamaclapetti.in" className="contact-info-link">
                    support@aamaclapetti.in
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon-wrap">
                  <Phone size={18} color="#d4af37" />
                </div>
                <div>
                  <h3 className="contact-info-title">Helpline &amp; WhatsApp</h3>
                  <a href="tel:+919600000000" className="contact-info-link">
                    +91 96000 00000
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon-wrap">
                  <Clock size={18} color="#d4af37" />
                </div>
                <div>
                  <h3 className="contact-info-title">Sanctum Hours</h3>
                  <p className="contact-info-desc">
                    Monday – Saturday<br />
                    9:00 AM – 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Sacred Assurance Badge Card */}
            <div className="contact-guarantee-box">
              <div className="guarantee-badge">
                <Sparkles size={15} color="#d4af37" />
                <span>SACRED ARTISAN ASSURANCE</span>
              </div>
              <p className="guarantee-text">
                Every Panchaloham consultation is directly coordinated with master temple sthapatis and certified hallmark metal documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
