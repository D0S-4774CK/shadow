import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onSelectProduct }) {
  return (
    <div className="product-card card-neo">
      {/* Product Image Container */}
      <div
        className="product-image-container"
        onClick={() => onSelectProduct && onSelectProduct(product)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
        />

        {/* Badge Tag */}
        {product.badge && (
          <span className="product-badge badge-neo">
            {product.badge}
          </span>
        )}

        {/* Quick View Hover Icon */}
        <div className="product-quick-view-overlay">
          <button className="btn-neo" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#FFFFFF' }}>
            <Eye size={14} />
            <span>Quick View & Reviews</span>
          </button>
        </div>
      </div>

      {/* Product Info Content */}
      <div className="product-card-body">
        {/* Category Label */}
        <span className="product-category-label">
          {product.categoryLabel || product.category}
        </span>

        {/* Product Title */}
        <h3
          className="product-title"
          onClick={() => onSelectProduct && onSelectProduct(product)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>

        {/* Bottom Price & Add to Cart Row */}
        <div className="product-card-footer">
          <div className="product-price-tag">
            {product.formattedPrice || `₹${product.price}`}
          </div>

          <button
            className="btn-neo btn-neo-pink add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            title="Add product to shopping cart"
          >
            <ShoppingBag size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
