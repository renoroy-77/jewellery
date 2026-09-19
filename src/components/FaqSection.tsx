'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { STORE_FAQS } from '@/data/products';
import JsonLd from './JsonLd';
import { getFaqSchema } from '@/lib/seo';
import { useTranslation } from '@/context/LanguageContext';
import { cmsService } from '@/services/cmsService';
import { FAQItem } from '@/types';

export default function FaqSection() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQItem[]>(STORE_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    cmsService
      .getFaqs()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic FAQs from backend:', err);
      });
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="section-padding" style={{ background: '#05160f' }} aria-labelledby="faq-heading">
      {/* FAQ Schema for Google Rich Results */}
      <JsonLd data={getFaqSchema(faqs)} />

      <div className="container" style={{ maxWidth: '840px' }}>
        <div className="section-header">
          <div className="section-kicker">{t('faq.kicker', 'HERITAGE & KNOWLEDGE')}</div>
          <h2 id="faq-heading" className="section-title">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p style={{ marginTop: '8px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {t('faq.subtitle', 'Everything you need to know about consecrated five-metal Panchaloham jewellery.')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    color: isOpen ? '#f5d77f' : '#fcf9f2',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem',
                    fontWeight: 500,
                  }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0,
                      color: '#d4af37',
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 24px 20px',
                      fontSize: '0.92rem',
                      lineHeight: '1.65',
                      color: 'var(--text-secondary)',
                      borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                      paddingTop: '16px',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
