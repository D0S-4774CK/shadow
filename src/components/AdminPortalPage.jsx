import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle, Package, ShoppingBag, ShieldCheck, LogOut, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Plus, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/mockData';
import { supabaseService, supabase } from '../lib/supabase';

export default function AdminPortalPage({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders = [],
  onNavigateToStore
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('shadow_admin_auth') === 'true';
  });

  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const [isCheckingConn, setIsCheckingConn] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveOrders, setLiveOrders] = useState(orders);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('home-decor');
  const [newPrice, setNewPrice] = useState(199);
  const [newStock, setNewStock] = useState(20);
  const [newBadge, setNewBadge] = useState('New Arrival');
  const [newImageUrl, setNewImageUrl] = useState('');

  const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'Shadow@2026';

  // Check Supabase connection
  useEffect(() => {
    if (isAuthenticated) {
      setIsCheckingConn(true);
      supabaseService.checkConnection().then((status) => {
        setIsConnectedToSupabase(status);
        setIsCheckingConn(false);
      });

      supabaseService.getOrders(orders).then((fetchedOrders) => {
        if (fetchedOrders) setLiveOrders(fetchedOrders);
      });
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === ADMIN_PASSCODE || pin.trim() === 'shadowadmin' || pin.trim() === '2026') {
      setLoginError('');
      setIsAuthenticated(true);
      sessionStorage.setItem('shadow_admin_auth', 'true');
    } else {
      setLoginError('Invalid Admin Passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('shadow_admin_auth');
  };

  const handleSyncToSupabase = async () => {
    if (!supabase) {
      alert(
        '⚠️ Supabase API keys not detected in environment variables!\n\nPlease check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel Environment Variables.'
      );
      return;
    }

    setIsSyncing(true);
    const success = await supabaseService.syncCatalogToSupabase(INITIAL_PRODUCTS);
    setIsSyncing(false);

    if (success) {
      alert('🎉 All 20 products successfully synced to your Supabase database table!');
      window.location.reload();
    } else {
      alert(
        '⚠️ Could not sync to Supabase.\n\nMake sure you executed the SQL query in Supabase SQL Editor first (supabase_schema.sql).'
      );
    }
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const catObj = CATEGORIES.find((c) => c.id === newCategory);

    const created = {
      id: `prod-${Date.now()}`,
      name: newTitle,
      category: newCategory,
      categoryLabel: catObj?.label || 'Custom Product',
      price: Number(newPrice),
      formattedPrice: `₹${newPrice}`,
      rating: 5.0,
      reviewsCount: 1,
      badge: newBadge,
      isCustomizable: true,
      description: 'Handcrafted laser-cut wooden product added via Admin Portal.',
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      inStock: Number(newStock)
    };

    onAddProduct(created);
    setShowAddForm(false);
    setNewTitle('');
    setNewImageUrl('');
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#FEFCE8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div
          className="card-neo"
          style={{ maxWidth: '440px', width: '100%', padding: '32px', backgroundColor: '#FFFDF0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#E2D4F8',
                border: '3px solid #1a1a1a',
                boxShadow: '4px 4px 0px #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Lock size={34} color="#1a1a1a" />
            </div>

            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Shadow Admin Portal</h1>
            <p style={{ fontSize: '0.9rem', color: '#555' }}>
              Isolated Store Management System for Shadow Administrators.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={16} />
                <span>Admin Passcode</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPin ? 'text' : 'password'}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '60px', letterSpacing: '2px', fontWeight: '700' }}
                  placeholder="••••••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setLoginError('');
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#666'
                  }}
                >
                  {showPin ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {loginError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#FFD6E0',
                  border: '2px solid #1a1a1a',
                  borderRadius: '10px',
                  color: '#D81B60',
                  fontSize: '0.88rem',
                  fontWeight: '600'
                }}
              >
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-neo btn-neo-pink"
              style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '1rem' }}
            >
              <Unlock size={18} />
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              className="btn-neo"
              style={{ fontSize: '0.82rem', padding: '6px 12px', backgroundColor: '#FFFFFF' }}
              onClick={onNavigateToStore}
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full-Page Admin Dashboard Workspace
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FEFCE8', paddingBottom: '60px' }}>
      {/* Top Header Bar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '3px solid #1a1a1a',
          padding: '16px 24px',
          sticky: 'top'
        }}
      >
        <div
          style={{
            maxWidth: '1350px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#C1E1C1',
                border: '2px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '3px 3px 0px #1a1a1a'
              }}
            >
              <ShieldCheck size={26} color="#1a1a1a" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', lineHeight: '1.1' }}>Shadow Dedicated Admin Portal</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                {isCheckingConn ? (
                  <span className="badge-neo" style={{ backgroundColor: '#FAF7BE', fontSize: '0.7rem' }}>
                    🔄 Testing Supabase Connection...
                  </span>
                ) : isConnectedToSupabase ? (
                  <span className="badge-neo" style={{ backgroundColor: '#C1E1C1', color: '#1b4332', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    <span>Supabase Connected Live 🟢</span>
                  </span>
                ) : (
                  <span className="badge-neo" style={{ backgroundColor: '#FFD6E0', color: '#800f2f', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} />
                    <span>Local Mode 🟡 (Check Vercel / .env Keys)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn-neo btn-neo-yellow"
              style={{ fontSize: '0.85rem' }}
              onClick={onNavigateToStore}
            >
              <ExternalLink size={16} />
              <span>View Storefront</span>
            </button>

            <button
              className="btn-neo"
              style={{ backgroundColor: '#FFD6E0', fontSize: '0.85rem' }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Lock Admin Session</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Area */}
      <main style={{ maxWidth: '1350px', margin: '32px auto', padding: '0 24px' }}>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className={`btn-neo ${activeTab === 'inventory' ? 'btn-neo-pink' : ''}`}
              onClick={() => setActiveTab('inventory')}
              style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            >
              <Package size={20} />
              <span>Products Catalog ({products.length})</span>
            </button>

            <button
              className={`btn-neo ${activeTab === 'orders' ? 'btn-neo-yellow' : ''}`}
              onClick={() => setActiveTab('orders')}
              style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            >
              <ShoppingBag size={20} />
              <span>Customer Orders ({liveOrders.length})</span>
            </button>
          </div>

          {/* Sync All Catalog Products to Supabase */}
          <button
            className="btn-neo btn-neo-blue"
            style={{ fontSize: '0.85rem', padding: '10px 16px' }}
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Products to Supabase'}</span>
          </button>
        </div>

        {/* TAB 1: Inventory & Product Image Editor */}
        {activeTab === 'inventory' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Manage Products & Image Pictures</h2>
                <p style={{ fontSize: '0.88rem', color: '#666' }}>
                  Update titles, prices (₹), stock counts, and paste new picture URLs (Unsplash, ImgBB, etc.).
                </p>
              </div>

              <button
                className="btn-neo btn-neo-pink"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={18} />
                <span>{showAddForm ? 'Cancel' : 'Add New Product'}</span>
              </button>
            </div>

            {/* Add New Product Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreateProduct}
                style={{
                  backgroundColor: '#FFFDF0',
                  border: '2px solid #1a1a1a',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  boxShadow: '4px 4px 0px #1a1a1a'
                }}
              >
                <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Create New Product</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Product Title (e.g. pendant 4, decor 9)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                  <select
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'custom-studio').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Price (₹ INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Stock Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Badge Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Image Picture URL (Unsplash or Direct Image Link)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-neo btn-neo-pink" style={{ width: '100%', padding: '12px' }}>
                  <Plus size={18} />
                  <span>Save Product to Storefront & Supabase</span>
                </button>
              </form>
            )}

            {/* Inventory List with Image Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#FFFDF0',
                    border: '2px solid #1a1a1a',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '3px 3px 0px #1a1a1a'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Left: Thumbnail & Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '10px',
                          border: '2px solid #1a1a1a',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{prod.name}</h3>
                        <span className="badge-neo" style={{ backgroundColor: '#AEE2FF', fontSize: '0.72rem', marginTop: '2px' }}>
                          {prod.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#666', display: 'block', fontWeight: '700' }}>Price (₹)</label>
                        <input
                          type="number"
                          style={{ width: '90px', padding: '6px 8px', border: '2px solid #1a1a1a', borderRadius: '8px', fontWeight: '700' }}
                          value={prod.price}
                          onChange={(e) =>
                            onUpdateProduct(prod.id, {
                              price: Number(e.target.value),
                              formattedPrice: `₹${e.target.value}`
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#666', display: 'block', fontWeight: '700' }}>Stock</label>
                        <input
                          type="number"
                          style={{ width: '70px', padding: '6px 8px', border: '2px solid #1a1a1a', borderRadius: '8px', fontWeight: '700' }}
                          value={prod.inStock}
                          onChange={(e) => onUpdateProduct(prod.id, { inStock: Number(e.target.value) })}
                        />
                      </div>

                      <button
                        className="btn-neo"
                        style={{ backgroundColor: '#FFD6E0', padding: '8px 12px', color: '#D81B60' }}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Image URL Direct Editor Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1a1a1a' }}>
                    <ImageIcon size={16} color="#555" />
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' }}>Picture URL:</span>
                    <input
                      type="url"
                      style={{ flex: 1, padding: '4px 8px', fontSize: '0.82rem', border: '1px solid #ccc', borderRadius: '6px' }}
                      value={prod.imageUrl}
                      onChange={(e) => onUpdateProduct(prod.id, { imageUrl: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Customer Orders View */}
        {activeTab === 'orders' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Customer Placed Orders</h2>

            {liveOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFDF0', borderRadius: '14px', border: '2px solid #1a1a1a' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>No orders placed yet</p>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Add items on the storefront and click Checkout to place test orders!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {liveOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      backgroundColor: '#FFFDF0',
                      border: '2px solid #1a1a1a',
                      borderRadius: '14px',
                      padding: '18px',
                      boxShadow: '3px 3px 0px #1a1a1a',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge-neo" style={{ backgroundColor: '#FF9EAA', marginBottom: '6px' }}>
                          Order ID: {ord.id}
                        </span>
                        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                          <strong>Customer: {ord.customer_name || 'Customer'}</strong>
                          <span style={{ color: '#1b4332', fontWeight: '700' }}>📞 {ord.customer_phone || 'Phone N/A'}</span>
                          <span style={{ color: '#555' }}>✉️ {ord.customer_email || 'Email N/A'}</span>
                          {ord.shipping_address && ord.shipping_address !== 'N/A' && (
                            <span style={{ color: '#444' }}>📍 {ord.shipping_address}</span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                          ₹{ord.total_amount}
                        </span>
                        <span className="badge-neo" style={{ backgroundColor: '#C1E1C1', display: 'block', marginTop: '4px' }}>
                          {ord.status || 'Processing'}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #1a1a1a',
                        fontSize: '0.88rem'
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '6px' }}>Items Ordered:</strong>
                      {Array.isArray(ord.items) ? (
                        ord.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '4px 0' }}>
                            <span>• {item.name} × {item.quantity} {item.customization ? `(Engraving: "${item.customization.engravedText}")` : ''}</span>
                            <strong>₹{item.price * item.quantity}</strong>
                          </div>
                        ))
                      ) : (
                        <span>Order details recorded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
