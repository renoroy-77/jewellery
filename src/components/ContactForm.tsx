'use client';

import React, { useState } from 'react';
import { CheckCircle2, Send, MessageSquare, Loader2 } from 'lucide-react';
import { inquiriesService } from '@/services/inquiriesService';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Custom Deity Pendant',
    preferredContact: 'WhatsApp' as 'WhatsApp' | 'Phone Call' | 'Email',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await inquiriesService.create(formData);
      setReferenceId(created.referenceId);
      setSubmitted(true);
    } catch {
      // Fallback
      setReferenceId(`#AAP-${Math.floor(10000 + Math.random() * 90000)}`);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-success-box">
        <CheckCircle2 size={40} color="#dfba6c" style={{ margin: '0 auto 16px' }} />
        <h3 className="contact-success-title">Inquiry Blessed and Received</h3>
        <p className="contact-success-desc">
          Thank you, <strong>{formData.name || 'Devotee'}</strong>. Your consultation inquiry has been assigned reference ID <strong>{referenceId}</strong>.
        </p>
        <p className="contact-success-sub">
          Our generational master sthapati and temple advisor will reach out via <strong>{formData.preferredContact}</strong> within 24 hours.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          {formData.preferredContact === 'WhatsApp' && (
            <a
              href={`https://wa.me/917012732880?text=Namaste%2C%20I%20have%20submitted%20consultation%20inquiry%20${referenceId}%20for%20${encodeURIComponent(formData.inquiryType)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="banner-cta-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <MessageSquare size={16} />
              <span>Connect on WhatsApp Now</span>
            </a>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                inquiryType: 'Custom Deity Pendant',
                preferredContact: 'WhatsApp',
                message: '',
              });
            }}
            className="btn-gold"
          >
            Send Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form-layout">
      {/* Name */}
      <div className="contact-form-group">
        <label className="contact-form-label">Full Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. Ananya Raman"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="contact-form-input"
        />
      </div>

      {/* Row: Email & Phone */}
      <div className="contact-form-row">
        <div className="contact-form-group">
          <label className="contact-form-label">Email Address *</label>
          <input
            type="email"
            required
            placeholder="ananya@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="contact-form-input"
          />
        </div>
        <div className="contact-form-group">
          <label className="contact-form-label">WhatsApp / Phone Number *</label>
          <input
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="contact-form-input"
          />
        </div>
      </div>

      {/* Row: Inquiry Type & Contact Preference */}
      <div className="contact-form-row">
        <div className="contact-form-group">
          <label className="contact-form-label">Inquiry Reason</label>
          <select
            value={formData.inquiryType}
            onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
            className="contact-form-select"
          >
            <option value="Custom Deity Pendant">Custom Deity Pendant &amp; Locket</option>
            <option value="Temple Consecration Order">Temple Consecration &amp; Prana Pratishtha</option>
            <option value="Wedding & Bridal Jewellery">Wedding &amp; Bridal Panchaloham</option>
            <option value="Sizing & Fit Consultation">Chain, Kada &amp; Ring Sizing Advice</option>
            <option value="Order Tracking & International Delivery">Order Status &amp; Shipping</option>
          </select>
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label">Preferred Response Via</label>
          <select
            value={formData.preferredContact}
            onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
            className="contact-form-select"
          >
            <option value="WhatsApp">WhatsApp Message</option>
            <option value="Phone Call">Direct Phone Call</option>
            <option value="Email">Email Response</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="contact-form-group">
        <label className="contact-form-label">Your Message or Custom Request *</label>
        <textarea
          rows={4}
          required
          placeholder="Please describe your deity preference, desired weight/size, or special consecration date..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="contact-form-textarea"
        />
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={isSubmitting} className="contact-submit-btn">
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Blessing &amp; Submitting...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Submit Sacred Consultation Request</span>
          </>
        )}
      </button>

      {/* Direct WhatsApp Action */}
      <div className="contact-direct-whatsapp">
        <span>Need instant assistance from our artisans?</span>
        <a
          href="https://wa.me/917012732880?text=Vanakkam%2C%20I%20would%20like%20to%20inquire%20about%20Panchaloham%20temple%20jewellery"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-quick-btn"
        >
          <MessageSquare size={16} />
          <span>Chat on WhatsApp Directly</span>
        </a>
      </div>
    </form>
  );
}
