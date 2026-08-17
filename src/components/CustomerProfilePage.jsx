import React from 'react';
import { User, ShoppingBag, Package, Truck, CheckCircle2, Clock, LogOut, ArrowLeft, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function CustomerProfilePage({
  currentUser,
  orders = [],
  onSignOut,
  onNavigateToStore
}) {
  const userEmail = currentUser?.email || 'customer@example.com';
  const userName = currentUser?.user_metadata?.full_name || userEmail.split('@')[0];

  // Filter customer orders by email or user_id
  const customerOrders = orders.filter(
    (o) =>
      (o.user_id && currentUser?.id && o.user_id === currentUser.id) ||
      (o.customer_email && o.customer_email.toLowerCase() === userEmail.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge-neo" style={{ backgroundColor: '#C1E1C1', color: '#1b4332' }}>✓ Delivered</span>;
      case 'Shipped':
        return <span className="badge-neo" style={{ backgroundColor: '#AEE2FF', color: '#004085' }}>🚚 Shipped & In Transit</span>;
      case 'Cancelled':
        return <span className="badge-neo" style={{ backgroundColor: '#FFD6E0', color: '#800f2f' }}>✕ Cancelled</span>;
      default:
        return <span className="badge-neo" style={{ backgroundColor: '#FAF7BE', color: '#856404' }}>⏳ Processing in Studio</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FEFCE8', paddingBottom: '60px' }}>
      {/* Header Bar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '3px solid #1a1a1a',
          padding: '16px 24px'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn-neo" style={{ padding: '8px 12px' }} onClick={onNavigateToStore}>
              <ArrowLeft size={16} />
              <span>Back to Shop</span>
            </button>
            <h1 style={{ fontSize: '1.4rem' }}>My Account & Order Tracker</h1>
          </div>

          <button className="btn-neo" style={{ backgroundColor: '#FFD6E0', padding: '8px 14px' }} onClick={onSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px' }}>
        {/* Customer Account Info Card */}
        <div
          className="card-neo"
          style={{
            backgroundColor: '#FFFDF0',
            padding: '24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#FF9EAA',
                border: '3px solid #1a1a1a',
                boxShadow: '3px 3px 0px #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={30} color="#1a1a1a" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>Welcome, {userName}!</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '0.9rem', marginTop: '2px' }}>
                <Mail size={14} />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge-neo" style={{ backgroundColor: '#C1E1C1' }}>
              ✦ Verified Customer
            </span>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
              Total Orders Placed: <strong>{customerOrders.length}</strong>
            </p>
          </div>
        </div>

        {/* Orders Tracking Section */}
        <div className="card-neo" style={{ backgroundColor: '#FFFFFF', padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} color="#D81B60" />
            <span>Order History & Real-Time Tracking</span>
          </h2>

          {customerOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFDF0', borderRadius: '14px', border: '2px solid #1a1a1a' }}>
              <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No orders found for your account</h3>
              <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '16px' }}>
                Explore our catalog of laser-cut wooden gifts to place your first order!
              </p>
              <button className="btn-neo btn-neo-pink" onClick={onNavigateToStore}>
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: '#FFFDF0',
                    border: '2px solid #1a1a1a',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '4px 4px 0px #1a1a1a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {/* Order Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-neo" style={{ backgroundColor: '#FF9EAA', fontSize: '0.85rem' }}>
                          ID: {ord.id}
                        </span>
                        {getStatusBadge(ord.status || 'Processing')}
                        <span className={`badge-neo ${ord.payment_status === 'Paid' ? 'btn-neo-blue' : ''}`} style={{ fontSize: '0.75rem' }}>
                          Payment: {ord.payment_status || 'Pending'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#666', marginTop: '6px' }}>
                        Placed on: {new Date(ord.created_at || Date.now()).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                        ₹{ord.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Order Shipping Progress Bar */}
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #1a1a1a'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={16} color="#D81B60" />
                      <span>Shipping Progress Timeline:</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.8rem' }}>
                      <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: ord.status === 'Processing' || ord.status === 'Shipped' || ord.status === 'Delivered' ? '#C1E1C1' : '#eee', border: '1px solid #1a1a1a', fontWeight: '700' }}>
                        1. Studio Crafting
                      </div>
                      <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: ord.status === 'Shipped' || ord.status === 'Delivered' ? '#AEE2FF' : '#eee', border: '1px solid #1a1a1a', fontWeight: '700' }}>
                        2. In Courier Transit
                      </div>
                      <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: ord.status === 'Delivered' ? '#FAF7BE' : '#eee', border: '1px solid #1a1a1a', fontWeight: '700' }}>
                        3. Delivered
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #1a1a1a',
                      fontSize: '0.88rem'
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: '6px' }}>Purchased Items:</strong>
                    {Array.isArray(ord.items) ? (
                      ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '4px 0' }}>
                          <span>• {item.name} × {item.quantity}</span>
                          <strong>₹{item.price * item.quantity}</strong>
                        </div>
                      ))
                    ) : (
                      <span>Items recorded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
