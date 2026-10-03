import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Flame, Compass, ArrowRight } from 'lucide-react';

export default function HeritageOverview() {
  return (
    <section
      className="heritage-overview-section"
      style={{
        padding: '110px 0 96px',
        background: 'linear-gradient(180deg, #020d09 0%, #05160f 50%, #03100b 100%)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 64px' }}>
          <div
            className="section-kicker"
            style={{
              color: 'var(--gold, #d4af37)',
              letterSpacing: '0.22em',
              fontSize: '0.86rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '18px',
              display: 'inline-block',
            }}
          >
            VEDIC METALLURGY &amp; AGAMIC TRADITION
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              fontSize: 'clamp(2rem, 3.4vw, 2.75rem)',
              color: '#fef3c7',
              margin: '0 0 22px',
              fontWeight: 700,
              lineHeight: '1.35',
            }}
          >
            The Sacred Alchemy of Authentic Panchaloham
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              margin: '0 auto 24px',
            }}
          >
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6))' }} />
            <span style={{ color: '#d4af37', fontSize: '0.85rem' }}>✦</span>
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.6), transparent)' }} />
          </div>

          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.02rem', lineHeight: '1.9', margin: '0 auto' }}>
            At <strong>Aamadappetti</strong> (also cherished across India as <strong>Amadapetti</strong>), we preserve the sacred temple metallurgy prescribed in ancient Agamic Shilpa Shastras. Each consecrated adornment is cast in pure <strong>Panchaloham</strong>—a divine five-metal alloy harmonizing planetary frequencies to bestow peace, protection, and spiritual radiance upon the devotee.
          </p>
        </div>

        {/* Five Metals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '44px' }}>
          <div style={{ background: 'rgba(4, 29, 20, 0.7)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Flame size={22} color="#f5d061" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', color: '#f5d061', fontSize: '1.05rem', margin: '0 0 8px' }}>Gold (Pon)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.84rem', lineHeight: '1.6', margin: 0 }}>
              Channelling solar energy (Surya), gold brings mental clarity, spiritual nobility, and radiant life force.
            </p>
          </div>

          <div style={{ background: 'rgba(4, 29, 20, 0.7)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Sparkles size={22} color="#e2e8f0" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', color: '#e2e8f0', fontSize: '1.05rem', margin: '0 0 8px' }}>Silver (Velli)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.84rem', lineHeight: '1.6', margin: 0 }}>
              Embodying lunar serenity (Chandra), silver soothes emotions, enhances intuition, and calms the physical body.
            </p>
          </div>

          <div style={{ background: 'rgba(4, 29, 20, 0.7)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Compass size={22} color="#fb923c" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', color: '#fb923c', fontSize: '1.05rem', margin: '0 0 8px' }}>Copper (Chembu)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.84rem', lineHeight: '1.6', margin: 0 }}>
              The bio-conductor of Vedic science, copper absorbs cosmic prana and balances the body&apos;s natural bio-currents.
            </p>
          </div>

          <div style={{ background: 'rgba(4, 29, 20, 0.7)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Sparkles size={22} color="#cbd5e1" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', color: '#cbd5e1', fontSize: '1.05rem', margin: '0 0 8px' }}>Zinc (Pithalai)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.84rem', lineHeight: '1.6', margin: 0 }}>
              Governed by Vayu, sacred brass and zinc reinforce cellular stamina, physical strength, and energetic equilibrium.
            </p>
          </div>

          <div style={{ background: 'rgba(4, 29, 20, 0.7)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '10px', padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <ShieldCheck size={22} color="#94a3b8" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', color: '#94a3b8', fontSize: '1.05rem', margin: '0 0 8px' }}>Iron (Irumbu)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.84rem', lineHeight: '1.6', margin: 0 }}>
              The anchor of strength, iron grounds subtle planetary influences, providing a spiritual shield against negativity.
            </p>
          </div>
        </div>

        {/* Narrative Callout */}
        <div style={{ background: 'radial-gradient(ellipse at center, rgba(13, 84, 56, 0.35) 0%, rgba(4, 29, 20, 0.8) 100%)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', padding: '32px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ maxWidth: '680px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', color: '#fef3c7', fontSize: '1.3rem', margin: '0 0 10px', fontWeight: 600 }}>
              Handcrafted Deity Pendants &amp; Consecrated Temple Heirlooms
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
              Whether ordering a certified <strong>Lord Ganesha gold pendant</strong> for obstacle removal, a sanctified <strong>Murugan Vel talisman</strong> for courage, a graceful <strong>Lakshmi pendant dollar chain</strong> for prosperity, or heavy handmade temple chains, every piece comes with an authenticated Hallmark Purity Certificate and sacred sanctum energization.
            </p>
          </div>
          <Link href="/collections" className="admin-btn admin-btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 600 }}>
            <span>Explore All Collections</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
