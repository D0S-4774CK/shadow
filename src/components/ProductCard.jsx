import React, { useState } from 'react';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayPrice = product.formattedPrice || `₹${product.price}`;

  return (
    <div className="product-card">
      {/* Top Image Holder featuring real product photos */}
      <div
        className="card-image-box"
        style={{
          backgroundColor: '#F3EFE6',
          position: 'relative',
          height: '200px',
          overflow: 'hidden'
        }}
      >
        {/* Badge Overlay */}
        {product.badge && (
          <span
            className="badge-neo"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: '#FFFFFF',
              zIndex: 3
            }}
          >
            {product.badge}
          </span>
        )}

        {/* Real Product Photography */}
        {!imageError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              opacity: imageLoaded ? 1 : 0.4
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#888'
            }}
          >
            <ImageIcon size={36} />
            <span style={{ fontSize: '0.8rem', marginTop: '4px' }}>Laser Wood Craft</span>
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div className="card-content">
        <div style={{ fontSize: '0.78rem', color: '#666', fontWeight: '600', marginBottom: '4px' }}>
          {product.categoryLabel}
        </div>

        <h3 className="card-title" title={product.name} style={{ fontSize: '1.05rem', fontWeight: '700' }}>
          {product.name}
        </h3>

        <div className="card-meta" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className="card-price" style={{ fontSize: '1.3rem', fontWeight: '800' }}>
              {displayPrice}
            </span>
          </div>
        </div>

        {/* Action Button: Direct Add to Cart */}
        <div className="card-actions">
          <button
            className="btn-neo btn-neo-pink"
            style={{ width: '100%', fontSize: '0.9rem', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
