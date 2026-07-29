import React, { useState, useEffect } from 'react';
import { X, Plus, Package, ShieldCheck, LogOut, Trash2, CheckCircle2, AlertTriangle, RefreshCw, ShoppingBag, Phone, Mail, User, MapPin } from 'lucide-react';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/mockData';
import { isSupabaseConfigured, supabaseService, supabase } from '../lib/supabase';

export default function AdminPanel({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders = [],
  onLogout
}) {
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

  // Check Supabase connection & fetch live orders when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsCheckingConn(true);
      supabaseService.checkConnection().then((status) => {
        setIsConnectedToSupabase(status);
        setIsCheckingConn(false);
      });

      supabaseService.getOrders(orders).then((fetchedOrders) => {
        if (fetchedOrders) setLiveOrders(fetchedOrders);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncToSupabase = async () => {
    if (!supabase) {
      alert(
        '⚠️ Supabase API keys not detected in .env file!\n\nPlease open your .env file in shadow folder, paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and restart Vite dev server.'
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
      description: 'Handcrafted laser-cut wooden product added via Admin Panel.',
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      inStock: Number(newStock)
    };

    onAddProduct(created);
    setShowAddForm(false);
    setNewTitle('');
    setNewImageUrl('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '960px', backgroundColor: '#FEFCE8' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingRight: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#C1E1C1',
                border: '2px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0px #1a1a1a'
              }}
            >
              <ShieldCheck size={24} color="#1a1a1a" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', lineHeight: '1.1' }}>Shadow Admin & Orders Dashboard</h2>
              
              {/* Supabase Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
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
                    <span>Local Mode 🟡</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            className="btn-neo"
            style={{ backgroundColor: '#FFD6E0', padding: '6px 12px', fontSize: '0.85rem' }}
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut size={16} />
            <span>Lock & Logout</span>
          </button>
        </div>

        <button className="btn-neo modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Tab switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn-neo ${activeTab === 'inventory' ? 'btn-neo-pink' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Package size={18} />
              <span>Products ({products.length})</span>
            </button>

            <button
              className={`btn-neo ${activeTab === 'orders' ? 'btn-neo-yellow' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={18} />
              <span>Customer Orders ({liveOrders.length})</span>
            </button>
          </div>

          {/* Sync All Catalog Products to Supabase */}
          <button
            className="btn-neo"
            style={{ fontSize: '0.82rem', padding: '8px 12px', backgroundColor: '#FFFFFF' }}
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            title="Uploads all 20 catalog products to your Supabase products table"
          >
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Products to Supabase'}</span>
          </button>
        </div>

        {/* Tab 1: Inventory Management */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Manage Store Products</h3>
              <button
                className="btn-neo btn-neo-pink"
                style={{ fontSize: '0.85rem' }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={16} />
                <span>{showAddForm ? 'Cancel' : 'Add New Product'}</span>
              </button>
            </div>

            {/* Add New Product Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreateProduct}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #1a1a1a',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '20px',
                  boxShadow: '3px 3px 0px #1a1a1a'
                }}
              >
                <h4 style={{ marginBottom: '12px' }}>Add Product Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Price (₹ INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Stock Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Image URL (Unsplash or Direct Link)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-neo btn-neo-pink" style={{ width: '100%' }}>
                  <Plus size={18} />
                  <span>Save Product to Supabase & Storefront</span>
                </button>
              </form>
            )}

            {/* Inventory List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #1a1a1a',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '2px 2px 0px #1a1a1a'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        border: '2px solid #1a1a1a',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{prod.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#666' }}>{prod.categoryLabel}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>Price (₹)</label>
                      <input
                        type="number"
                        style={{ width: '80px', padding: '4px 6px', border: '1px solid #1a1a1a', borderRadius: '6px', fontWeight: '700' }}
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
                      <label style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>Stock</label>
                      <input
                        type="number"
                        style={{ width: '60px', padding: '4px 6px', border: '1px solid #1a1a1a', borderRadius: '6px', fontWeight: '700' }}
                        value={prod.inStock}
                        onChange={(e) => onUpdateProduct(prod.id, { inStock: Number(e.target.value) })}
                      />
                    </div>

                    {/* Delete Product Button */}
                    <button
                      className="btn-neo"
                      style={{ backgroundColor: '#FFD6E0', padding: '8px 10px', color: '#D81B60' }}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      title="Delete Product from Store & Supabase"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Customer Orders */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Placed Customer Orders</h3>

            {liveOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px solid #1a1a1a' }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>No orders placed yet</p>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Add items to cart on storefront and click Checkout to place test orders!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {liveOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #1a1a1a',
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '3px 3px 0px #1a1a1a',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge-neo" style={{ backgroundColor: '#FF9EAA', marginBottom: '6px' }}>
                          Order ID: {ord.id}
                        </span>
                        
                        {/* Customer Contact Details */}
                        <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                            <User size={14} color="#D81B60" />
                            {ord.customer_name || 'Customer'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} color="#1b4332" />
                            <strong style={{ color: '#1b4332' }}>{ord.customer_phone || 'Phone not provided'}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
                            <Mail size={14} />
                            {ord.customer_email || 'No Email'}
                          </span>
                          {ord.shipping_address && ord.shipping_address !== 'N/A' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#444' }}>
                              <MapPin size={14} />
                              {ord.shipping_address}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                          ₹{ord.total_amount}
                        </span>
                        <span className="badge-neo" style={{ backgroundColor: '#C1E1C1', display: 'block', marginTop: '4px' }}>
                          {ord.status || 'Processing'}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#FFFDF0',
                        borderRadius: '8px',
                        border: '1px solid #1a1a1a',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '4px' }}>Purchased Items:</strong>
                      {Array.isArray(ord.items) ? (
                        ord.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', margin: '2px 0' }}>
                            <span>• {item.name} × {item.quantity} {item.customization ? `(Engraving: "${item.customization.engravedText}")` : ''}</span>
                            <strong>₹{item.price * item.quantity}</strong>
                          </div>
                        ))
                      ) : (
                        <span>Item details recorded</span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#777', textAlign: 'right' }}>
                      Placed at: {new Date(ord.created_at || Date.now()).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
