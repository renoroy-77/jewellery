'use client';

import React, { useState } from 'react';
import { CheckCircle2, Send, MessageSquare, Sparkles, PhoneCall } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Custom Deity Pendant',
    preferredContact: 'WhatsApp',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="contact-success-box">
        <CheckCircle2 size={40} color="#dfba6c" style={{ margin: '0 auto 16px' }} />
        <h3 className="contact-success-title">Inquiry Blessed and Received</h3>
        <p className="contact-success-desc">
          Thank you, <strong>{formData.name || 'Devotee'}</strong>. Your consultation inquiry has been assigned reference ID <strong>#AAP-{Math.floor(10000 + Math.random() * 90000)}</strong>.
        </p>
        <p className="contact-success-sub">
          Our generational master sthapati and temple advisor will reach out via <strong>{formData.preferredContact}</strong> within 24 hours.
        </p>
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
          style={{ marginTop: '20px' }}
        >
          Send Another Inquiry
        </button>
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
            <option value="Custom Deity Pendant">Custom Deity Pendant & Locket</option>
            <option value="Temple Consecration Order">Temple Consecration & Prana Pratishtha</option>
            <option value="Wedding & Bridal Jewellery">Wedding & Bridal Panchaloham</option>
            <option value="Sizing & Fit Consultation">Chain, Kada & Ring Sizing Advice</option>
            <option value="Order Tracking & International Delivery">Order Status & Shipping</option>
          </select>
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label">Preferred Response Via</label>
          <select
            value={formData.preferredContact}
            onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
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
      <button type="submit" className="contact-submit-btn">
        <Send size={18} />
        <span>Submit Sacred Consultation Request</span>
      </button>

      {/* Direct WhatsApp Action */}
      <div className="contact-direct-whatsapp">
        <span>Need instant assistance from our artisans?</span>
        <a
          href="https://wa.me/919600000000?text=Vanakkam%2C%20I%20would%20like%20to%20inquire%20about%20Panchaloham%20temple%20jewellery"
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
