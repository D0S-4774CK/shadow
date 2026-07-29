import React, { useState } from 'react';
import { X, Sparkles, ShoppingBag, Type, Palette } from 'lucide-react';

export default function ProductCustomizerModal({ product, onClose, onAddToCart }) {
  const [engravedText, setEngravedText] = useState('Sophia & Liam');
  const [selectedFont, setSelectedFont] = useState('Fredoka');
  const [materialFinish, setMaterialFinish] = useState('#F3EFE6');

  if (!product) return null;

  const fontOptions = [
    { id: 'Fredoka', label: 'Playful Round', fontFamily: "'Fredoka', sans-serif" },
    { id: 'Jakarta', label: 'Modern Sans', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    { id: 'Serif', label: 'Classic Elegance', fontFamily: "Georgia, serif" },
    { id: 'Cursive', label: 'Script Calligraphy', fontFamily: "'Brush Script MT', cursive, sans-serif" }
  ];

  const handleSaveAndAdd = () => {
    const customizedProduct = {
      ...product,
      customization: {
        engravedText,
        font: selectedFont,
        finishBg: materialFinish
      }
    };
    onAddToCart(customizedProduct);
    onClose();
  };

  const formattedPrice = product.formattedPrice || `₹${product.price}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="btn-neo modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles color="#FF7B8E" size={20} />
          <h2 style={{ fontSize: '1.5rem' }}>Personalize Engraving</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Live Visual Preview Section */}
          <div
            style={{
              backgroundColor: materialFinish,
              border: '3px solid #1a1a1a',
              borderRadius: '16px',
              boxShadow: '4px 4px 0px #1a1a1a',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              position: 'relative',
              textAlign: 'center',
              overflow: 'hidden'
            }}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.35
                }}
              />
            )}

            <div
              style={{
                marginTop: '16px',
                padding: '12px 20px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #1a1a1a',
                borderRadius: '12px',
                boxShadow: '3px 3px 0px #1a1a1a',
                maxWidth: '90%',
                zIndex: 2
              }}
            >
              <p
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  fontFamily: fontOptions.find((f) => f.id === selectedFont)?.fontFamily,
                  color: '#1a1a1a',
                  wordBreak: 'break-word'
                }}
              >
                {engravedText || 'Your Custom Text'}
              </p>
            </div>

            <span className="badge-neo" style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.7rem', zIndex: 2 }}>
              Laser Engraving Preview
            </span>
          </div>

          {/* Controls Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Type size={16} />
                <span>Custom Engraving Text</span>
              </label>
              <input
                type="text"
                className="form-input"
                maxLength={36}
                value={engravedText}
                onChange={(e) => setEngravedText(e.target.value)}
                placeholder="Enter names, date, or quote..."
              />
              <span style={{ fontSize: '0.75rem', color: '#666', textAlign: 'right' }}>
                {engravedText.length}/36 chars
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Typography Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {fontOptions.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`btn-neo ${selectedFont === font.id ? 'btn-neo-pink' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '6px 8px', fontFamily: font.fontFamily }}
                    onClick={() => setSelectedFont(font.id)}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={16} />
                <span>Wood Tone Preview</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { color: '#F3EFE6', label: 'Natural Birch' },
                  { color: '#E2D4F8', label: 'Lilac Tone' },
                  { color: '#FFD6E0', label: 'Blush Tone' },
                  { color: '#C1E1C1', label: 'Sage Tone' },
                  { color: '#FAF7BE', label: 'Golden Birch' }
                ].map((finish) => (
                  <div
                    key={finish.color}
                    onClick={() => setMaterialFinish(finish.color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: finish.color,
                      border: materialFinish === finish.color ? '3px solid #1a1a1a' : '2px solid #aaa',
                      boxShadow: materialFinish === finish.color ? '2px 2px 0px #1a1a1a' : 'none',
                      cursor: 'pointer'
                    }}
                    title={finish.label}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn-neo btn-neo-pink"
              style={{ marginTop: 'auto', padding: '12px' }}
              onClick={handleSaveAndAdd}
            >
              <ShoppingBag size={18} />
              <span>Add Customized Gift ({formattedPrice})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
