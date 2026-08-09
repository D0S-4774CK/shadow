import React from 'react';
import { Search, ShoppingBag } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  setActiveView
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => setActiveView('catalog')}
          title="Shadow Gifting & Laser Cutting Studio"
        >
          <span className="brand-sparkle">✦</span>
          <span>Shadow</span>
          <span className="brand-sparkle">✦</span>
        </div>

        {/* Search Bar */}
        <div className="header-search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search custom wooden gifts, wall decor, ornaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Storefront Action Buttons (100% Clean - No Admin References) */}
        <div className="header-actions">
          <button
            className="btn-neo btn-neo-yellow"
            onClick={onOpenCart}
            title="View Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="badge-neo" style={{ backgroundColor: '#FF9EAA', marginLeft: '4px' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
