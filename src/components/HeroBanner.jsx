import React from 'react';
import { Gift, Sparkles } from 'lucide-react';

export default function HeroBanner({ heroTitle, onExploreCatalog }) {
  const currentTitle = heroTitle || "Precision Cut Wood Crafts, Designed for Everyday Moments.";

  return (
    <section className="hero-banner">
      <div className="hero-inner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }} className="badge-neo">
          <Sparkles size={14} color="#FF7B8E" />
          <span>Artisan Laser Cut & Bespoke Gifting</span>
        </div>

        <h1 className="hero-title">{currentTitle}</h1>

        <p className="hero-subtitle">
          Premium laser-cut home decor, personalized wooden keepsakes, and handcrafted gifts designed with care and crafted to perfection.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button className="btn-neo btn-neo-yellow" onClick={onExploreCatalog} style={{ padding: '12px 24px', fontSize: '1rem' }}>
            <Gift size={20} />
            <span>Explore All Products</span>
          </button>
        </div>
      </div>
    </section>
  );
}
