'use client';

import React from 'react';
import { Globe, RotateCcw, ShieldCheck, Award, Headphones } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function TrustBadges() {
  const { t } = useTranslation();

  const BADGES = [
    {
      icon: Globe,
      title: t('trust.shipping.title', 'Worldwide Shipping'),
      desc: t('trust.shipping.desc', 'Doorstep blessing delivery across 45+ countries'),
    },
    {
      icon: RotateCcw,
      title: t('trust.returns.title', 'Easy Returns'),
      desc: t('trust.returns.desc', '7-day hassle-free exchange guarantee'),
    },
    {
      icon: ShieldCheck,
      title: t('trust.payments.title', 'Secure Payments'),
      desc: t('trust.payments.desc', '256-bit encrypted UPI & card gateways'),
    },
    {
      icon: Award,
      title: t('trust.authenticity.title', 'Certified Authenticity'),
      desc: t('trust.authenticity.desc', 'Government lab tested Panchaloham assay certificate'),
    },
    {
      icon: Headphones,
      title: t('trust.support.title', 'Dedicated Support'),
      desc: t('trust.support.desc', 'Direct consultation with temple jewellery experts'),
    },
  ];

  return (
    <section className="value-props-bar" aria-label="Customer Guarantees">
      <div className="container">
        <div className="props-horizontal-row">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <React.Fragment key={index}>
                {index > 0 && <span className="prop-pipe-divider" aria-hidden="true" />}
                <div className="prop-item-inline">
                  <div className="prop-icon-wrapper">
                    <Icon size={26} className="prop-icon" />
                  </div>
                  <div className="prop-text-group">
                    <span className="prop-title-text">{badge.title}</span>
                    <span className="prop-subtitle-text">{badge.desc}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
