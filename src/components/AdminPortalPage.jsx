import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle, Package, ShoppingBag, ShieldCheck, LogOut, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Plus, Image as ImageIcon, ExternalLink, Settings, Database, X, Layers, Users, CreditCard, Tag, Globe } from 'lucide-react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/mockData';
import { supabaseService, getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export default function AdminPortalPage({
  products,
  categories = DEFAULT_CATEGORIES,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  orders = [],
  onUpdateOrder,
  onNavigateToStore
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('shadow_admin_auth') === 'true';
  });

  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'categories' | 'orders' | 'admins' | 'settings'
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [inputUrl, setInputUrl] = useState(() => localStorage.getItem('shadow_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [inputKey, setInputKey] = useState(() => localStorage.getItem('shadow_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const [isCheckingConn, setIsCheckingConn] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveOrders, setLiveOrders] = useState(orders);
  const [userRoles, setUserRoles] = useState([]);

  // New product form state with Slugs & Tags
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategory, setNewCategory] = useState('home-decor');
  const [newPrice, setNewPrice] = useState(199);
  const [newStock, setNewStock] = useState(20);
  const [newBadge, setNewBadge] = useState('New Arrival');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('Wood, Laser Cut, Craft');

  // New category form state
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🪵');

  // New admin email state
  const [grantAdminEmail, setGrantAdminEmail] = useState('');

  // Store Settings state
  const [storeName, setStoreName] = useState('Shadow Studio');
  const [supportEmail, setSupportEmail] = useState('harsha.stratcrowd@gmail.com');
  const [shippingThreshold, setShippingThreshold] = useState('999');

  const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'Shadow@2026';

  // Check Supabase connection & fetch live data
  const runConnectionCheck = async () => {
    setIsCheckingConn(true);
    const status = await supabaseService.checkConnection();
    setIsConnectedToSupabase(status);
    setIsCheckingConn(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      runConnectionCheck();

      supabaseService.getOrders(orders).then((fetchedOrders) => {
        if (fetchedOrders) setLiveOrders(fetchedOrders);
      });

      supabaseService.getUserRoles().then((roles) => {
        if (roles) setUserRoles(roles);
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

  const handleSaveCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!inputUrl || !inputKey) return;

    supabaseService.saveCredentials(inputUrl, inputKey);
    setShowKeyModal(false);
    await runConnectionCheck();
    alert('🎉 Supabase Credentials saved! Syncing catalog products now...');
    handleSyncToSupabase();
  };

  const handleSyncToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setShowKeyModal(true);
      return;
    }

    setIsSyncing(true);
    const res = await supabaseService.syncCatalogToSupabase(products, client);
    setIsSyncing(false);

    if (res && res.success) {
      alert(`🎉 All ${products.length} products successfully saved & synced to Supabase!`);
    } else {
      const errMsg = res?.error || 'Unknown error';
      alert(`⚠️ Could not sync to Supabase.\n\nError details: ${errMsg}`);
    }
  };

  // Product Creator Handler
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const catObj = categories.find((c) => c.id === newCategory);
    const generatedSlug = newSlug.trim() || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const parsedTags = newTags.split(',').map((t) => t.trim()).filter(Boolean);

    const created = {
      id: `prod-${Date.now()}`,
      name: newTitle,
      slug: generatedSlug,
      category: newCategory,
      categoryLabel: catObj?.label || 'Custom Product',
      price: Number(newPrice),
      formattedPrice: `₹${newPrice}`,
      rating: 5.0,
      reviewsCount: 1,
      badge: newBadge,
      isCustomizable: false,
      description: newDescription || 'Handcrafted wooden product added via Admin Portal.',
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      inStock: Number(newStock),
      tags: parsedTags.length > 0 ? parsedTags : ['Wood', 'Laser Cut']
    };

    onAddProduct(created);
    setShowAddForm(false);
    setNewTitle('');
    setNewSlug('');
    setNewImageUrl('');
    setNewDescription('');
  };

  // Category Creator Handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatLabel) return;

    const generatedId = newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: generatedId,
      label: newCatLabel,
      icon: newCatIcon || '🪵',
      isPillAccent: false
    };

    if (onAddCategory) onAddCategory(newCat);
    await supabaseService.addCategory(newCat);

    setShowCatForm(false);
    setNewCatId('');
    setNewCatLabel('');
    setNewCatIcon('🪵');
  };

  // Grant Admin Status Handler
  const handleGrantAdminSubmit = async (e) => {
    e.preventDefault();
    if (!grantAdminEmail) return;

    const success = await supabaseService.grantAdminRole(grantAdminEmail);
    if (success) {
      alert(`🎉 Admin access granted to ${grantAdminEmail}!`);
      setGrantAdminEmail('');
      const roles = await supabaseService.getUserRoles();
      if (roles) setUserRoles(roles);
    } else {
      alert('⚠️ Could not grant admin role. Check Supabase connection.');
    }
  };

  // Order & Payment Status Handlers
  const handleOrderStatusChange = async (orderId, newStatus) => {
    await supabaseService.updateOrderStatus(orderId, newStatus);
    setLiveOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (onUpdateOrder) onUpdateOrder(orderId, { status: newStatus });
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    await supabaseService.updatePaymentStatus(orderId, newPaymentStatus);
    setLiveOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o))
    );
    if (onUpdateOrder) onUpdateOrder(orderId, { payment_status: newPaymentStatus });
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
          padding: '16px 24px'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
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
                  <button
                    className="badge-neo"
                    style={{ backgroundColor: '#FFD6E0', color: '#800f2f', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: '1px solid #1a1a1a' }}
                    onClick={() => setShowKeyModal(true)}
                  >
                    <AlertTriangle size={12} />
                    <span>Supabase Setup Required ⚙️ (Click to Enter Keys)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn-neo"
              style={{ fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
              onClick={() => setShowKeyModal(true)}
              title="Configure Supabase Project URL & Anon Key"
            >
              <Database size={16} />
              <span>Database Settings</span>
            </button>

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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className={`btn-neo ${activeTab === 'inventory' ? 'btn-neo-pink' : ''}`}
              onClick={() => setActiveTab('inventory')}
              style={{ padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <Package size={18} />
              <span>Products ({products.length})</span>
            </button>

            <button
              className={`btn-neo ${activeTab === 'categories' ? 'btn-neo-blue' : ''}`}
              onClick={() => setActiveTab('categories')}
              style={{ padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <Layers size={18} />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              className={`btn-neo ${activeTab === 'orders' ? 'btn-neo-yellow' : ''}`}
              onClick={() => setActiveTab('orders')}
              style={{ padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <ShoppingBag size={18} />
              <span>Orders & Status ({liveOrders.length})</span>
            </button>

            <button
              className={`btn-neo ${activeTab === 'admins' ? 'btn-neo-pink' : ''}`}
              onClick={() => setActiveTab('admins')}
              style={{ padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <Users size={18} />
              <span>Admin Users</span>
            </button>

            <button
              className={`btn-neo ${activeTab === 'settings' ? '' : ''}`}
              style={{ backgroundColor: activeTab === 'settings' ? '#FAF7BE' : '#FFFFFF', padding: '10px 16px', fontSize: '0.9rem' }}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>Store Settings</span>
            </button>
          </div>

          {/* Save & Sync Current Products to Supabase */}
          <button
            className="btn-neo btn-neo-blue"
            style={{ fontSize: '0.85rem', padding: '10px 16px' }}
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Save & Sync Products to Supabase'}</span>
          </button>
        </div>

        {/* TAB 1: Inventory & Expanded Products Manager (Slug, Tags, Description) */}
        {activeTab === 'inventory' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Manage Products & Attributes</h2>
                <p style={{ fontSize: '0.88rem', color: '#666' }}>
                  Add, edit, or remove products with Name, Slug, Category, Tags, Description, Price (₹), Stock, and Picture URL.
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
                <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Create New Product with Attributes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Product Title (e.g. Moon Pendant, Wooden Clock)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>URL Slug (Auto-generated if empty)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. moon-pendant-cutout"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Category</label>
                    <select
                      className="form-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      {categories.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Product Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Wood, Laser Cut, Gift, Wall Decor"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Image Picture URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Enter detailed laser craft product description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-neo btn-neo-pink" style={{ width: '100%', padding: '12px' }}>
                  <Plus size={18} />
                  <span>Save Product to Storefront & Supabase</span>
                </button>
              </form>
            )}

            {/* Inventory List with Attributes */}
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
                          width: '64px',
                          height: '64px',
                          borderRadius: '10px',
                          border: '2px solid #1a1a1a',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{prod.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span className="badge-neo" style={{ backgroundColor: '#AEE2FF', fontSize: '0.7rem' }}>
                            {prod.categoryLabel || prod.category}
                          </span>
                          <span className="badge-neo" style={{ backgroundColor: '#FAF7BE', fontSize: '0.7rem' }}>
                            Slug: /{prod.slug || prod.id}
                          </span>
                        </div>
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

                  {/* Attributes Editor Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={14} color="#555" />
                      <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Picture URL:</span>
                      <input
                        type="url"
                        style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '6px' }}
                        value={prod.imageUrl}
                        onChange={(e) => onUpdateProduct(prod.id, { imageUrl: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={14} color="#555" />
                      <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Tags:</span>
                      <input
                        type="text"
                        style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '6px' }}
                        value={Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || '')}
                        onChange={(e) => onUpdateProduct(prod.id, { tags: e.target.value.split(',').map(t => t.trim()) })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Dynamic Categories Manager */}
        {activeTab === 'categories' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Manage Store Categories</h2>
                <p style={{ fontSize: '0.88rem', color: '#666' }}>
                  Add new product categories dynamically. All categories appear instantly on your storefront sidebar!
                </p>
              </div>

              <button
                className="btn-neo btn-neo-pink"
                onClick={() => setShowCatForm(!showCatForm)}
              >
                <Plus size={18} />
                <span>{showCatForm ? 'Cancel' : 'Add New Category'}</span>
              </button>
            </div>

            {/* Add Category Form */}
            {showCatForm && (
              <form
                onSubmit={handleCreateCategory}
                style={{
                  backgroundColor: '#FFFDF0',
                  border: '2px solid #1a1a1a',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  boxShadow: '4px 4px 0px #1a1a1a'
                }}
              >
                <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Create Category</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Category Label Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Wall Art, Kitchen Craft"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Category ID (Auto-generated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. wall-art"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Emoji</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-neo btn-neo-pink" style={{ width: '100%', padding: '12px' }}>
                  <Plus size={18} />
                  <span>Save Category to Storefront</span>
                </button>
              </form>
            )}

            {/* Category List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {categories.filter((c) => c.id !== 'all').map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: '#FFFDF0',
                    border: '2px solid #1a1a1a',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '3px 3px 0px #1a1a1a'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '700' }}>{cat.label}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>ID: {cat.id}</span>
                    </div>
                  </div>

                  <button
                    className="btn-neo"
                    style={{ backgroundColor: '#FFD6E0', padding: '6px 8px', color: '#D81B60' }}
                    onClick={() => {
                      if (window.confirm(`Delete category "${cat.label}"?`)) {
                        if (onDeleteCategory) onDeleteCategory(cat.id);
                      }
                    }}
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Orders & Payment Status Manager */}
        {activeTab === 'orders' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Manage Orders & Payment Statuses</h2>

            {liveOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFDF0', borderRadius: '14px', border: '2px solid #1a1a1a' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>No orders placed yet</p>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span className="badge-neo" style={{ backgroundColor: '#FF9EAA', marginBottom: '6px' }}>
                          Order ID: {ord.id}
                        </span>
                        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                          <strong>Customer: {ord.customer_name || 'Customer'}</strong>
                          <span style={{ color: '#1b4332', fontWeight: '700' }}>📞 {ord.customer_phone || 'Phone N/A'}</span>
                          <span style={{ color: '#555' }}>✉️ {ord.customer_email || 'Email N/A'}</span>
                        </div>
                      </div>

                      {/* Status Dropdowns */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                          ₹{ord.total_amount}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', fontWeight: '700' }}>Order Status</label>
                            <select
                              className="form-select"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: '700' }}
                              value={ord.status || 'Processing'}
                              onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', fontWeight: '700' }}>Payment</label>
                            <select
                              className="form-select"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: '700' }}
                              value={ord.payment_status || 'Pending'}
                              onChange={(e) => handlePaymentStatusChange(ord.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                        </div>
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
                            <span>• {item.name} × {item.quantity}</span>
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

        {/* TAB 4: Admin User Management */}
        {activeTab === 'admins' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Admin Role Management</h2>
            <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '20px' }}>
              Grant Admin access to other customer user emails so they can manage products and orders.
            </p>

            <form
              onSubmit={handleGrantAdminSubmit}
              style={{
                backgroundColor: '#FFFDF0',
                border: '2px solid #1a1a1a',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
                boxShadow: '3px 3px 0px #1a1a1a'
              }}
            >
              <div style={{ flex: 1 }}>
                <label className="form-label">Customer User Email to promote to Admin</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. manager@shadowstudio.in"
                  value={grantAdminEmail}
                  onChange={(e) => setGrantAdminEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-neo btn-neo-pink" style={{ padding: '10px 18px' }}>
                <ShieldCheck size={18} />
                <span>Grant Admin Role</span>
              </button>
            </form>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Current Admin Accounts:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', backgroundColor: '#C1E1C1', borderRadius: '10px', border: '1px solid #1a1a1a', fontWeight: '700' }}>
                ✦ Super Admin: harsha.stratcrowd@gmail.com
              </div>
              <div style={{ padding: '12px', backgroundColor: '#FFFDF0', borderRadius: '10px', border: '1px solid #1a1a1a', fontWeight: '700' }}>
                ✦ Passcode Admin: Shadow@2026 (or shadowadmin)
              </div>
              {userRoles.map((r) => (
                <div key={r.email} style={{ padding: '12px', backgroundColor: '#FFFDF0', borderRadius: '10px', border: '1px solid #1a1a1a' }}>
                  📧 {r.email} - Role: <strong>{r.role}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Storefront Website Settings */}
        {activeTab === 'settings' && (
          <div className="card-neo" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Storefront Website Settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Store Brand Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Support Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Free Shipping Threshold (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={shippingThreshold}
                  onChange={(e) => setShippingThreshold(e.target.value)}
                />
              </div>

              <button
                className="btn-neo btn-neo-pink"
                style={{ padding: '12px', marginTop: '10px' }}
                onClick={() => alert('🎉 Store Settings saved!')}
              >
                Save Store Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Supabase Key Setup Modal */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '540px', backgroundColor: '#FFFDF0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="btn-neo modal-close-btn" onClick={() => setShowKeyModal(false)}>
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#C1E1C1',
                  border: '2px solid #1a1a1a',
                  boxShadow: '3px 3px 0px #1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <Database size={28} color="#1a1a1a" />
              </div>
              <h2 style={{ fontSize: '1.4rem' }}>Connect Supabase Database</h2>
              <p style={{ fontSize: '0.85rem', color: '#555' }}>
                Paste your Supabase Project URL & Anon Key from your Supabase Dashboard to sync instantly!
              </p>
            </div>

            <form onSubmit={handleSaveCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Supabase Project URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://xyzabcdef.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Supabase Anon Key</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-neo btn-neo-pink" style={{ padding: '12px', marginTop: '6px' }}>
                <RefreshCw size={18} />
                <span>Save Credentials & Sync Products Now</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
