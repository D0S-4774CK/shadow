import React from 'react';
import { Mail, ShieldCheck, Truck, Sparkles, Heart, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', padding: '40px 24px 20px', borderTop: '4px solid #1A1A1A', marginTop: '60px' }}>
      <div className="footer-inner" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '28px' }}>
        
        {/* Column 1: Brand Info & Contact */}
        <div>
          <div className="brand-logo" style={{ color: '#FFFFFF', marginBottom: '12px', fontSize: '1.7rem' }}>
            <span style={{ color: '#FF9EAA' }}>✦</span>
            <span>Shadow Studio</span>
            <span style={{ color: '#FF9EAA' }}>✦</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#CCCCCC', lineHeight: '1.6', marginBottom: '14px' }}>
            Handcrafted laser-cut wooden gifts, custom plaques, and artisan keepsakes.
          </p>

          <a
            href="mailto:harsha.stratcrowd@gmail.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FF9EAA', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}
          >
            <Mail size={16} />
            <span>harsha.stratcrowd@gmail.com</span>
          </a>
        </div>

        {/* Column 2: Guarantees (Option B / Preset 2) */}
        <div>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', color: '#FAF7BE', fontFamily: 'var(--font-heading)' }}>
            Our Guarantees
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#DDDDDD' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#AEE2FF" />
              <span>100% Quality & Satisfaction Guarantee</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Leaf size={16} color="#C1E1C1" />
              <span>Sustainably Sourced & Eco-Friendly Materials</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={16} color="#FAF7BE" />
              <span>Fast & Insured Shipping Across India</span>
            </li>
          </ul>
        </div>

      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '18px', borderTop: '1px solid #333333', textAlign: 'center', fontSize: '0.82rem', color: '#AAAAAA' }}>
        <p>
          © 2026 ✦ <strong>Shadow Studio</strong> ✦ Crafted with <Heart size={13} color="#FF9EAA" style={{ display: 'inline', verticalAlign: 'middle' }} /> | Contact: <a href="mailto:harsha.stratcrowd@gmail.com" style={{ color: '#FF9EAA', textDecoration: 'none' }}>harsha.stratcrowd@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
