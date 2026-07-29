import React from 'react';
import { Search, ShoppingBag, ShieldCheck, Lock, LogOut } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  activeView,
  setActiveView,
  isAdminAuthenticated,
  onAdminLogout
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => setActiveView('catalog')}
          title="Shadow Gifting & Laser Cutting"
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
            placeholder="Search custom gifts, wall decor, wooden crafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
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

          {/* Protected Admin Access Control */}
          {isAdminAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="btn-neo"
                style={{ backgroundColor: '#C1E1C1', fontWeight: '700', borderRadius: '12px' }}
                onClick={onOpenAdmin}
                title="Open Admin Management Panel"
              >
                <ShieldCheck size={18} />
                <span>Admin Panel</span>
              </button>
              <button
                className="btn-neo"
                style={{ padding: '8px 10px', backgroundColor: '#FFD6E0' }}
                onClick={onAdminLogout}
                title="Lock Admin Session"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn-neo"
              style={{ fontWeight: '700', borderRadius: '12px', backgroundColor: '#FFFFFF' }}
              onClick={onOpenAdmin}
              title="Admin Authentication Required"
            >
              <Lock size={16} color="#D81B60" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
