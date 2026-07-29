import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle, Truck, Sparkles, User, Mail, Phone, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabaseService } from '../lib/supabase';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated
}) {
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout-info' | 'success'
  const [orderId, setOrderId] = useState('');

  // Customer Contact Details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeShippingThreshold = 999; // INR
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 70;
  const grandTotal = subtotal + shippingCost;

  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleStartCheckout = () => {
    if (cartItems.length === 0) return;
    setStep('checkout-info');
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!customerEmail && !customerPhone) {
      setFormError('Please enter at least an Email address or Phone Number so we can contact you.');
      return;
    }

    setFormError('');

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log('Confetti effect triggered');
    }

    const generatedId = `SHADOW-IN-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);

    // Order payload with contact information
    const newOrder = {
      id: generatedId,
      customer_name: customerName || 'Valued Customer',
      customer_email: customerEmail || 'N/A',
      customer_phone: customerPhone || 'N/A',
      shipping_address: shippingAddress || 'N/A',
      total_amount: grandTotal,
      items: cartItems.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        customization: i.product.customization || null
      })),
      status: 'Processing',
      created_at: new Date().toISOString()
    };

    // Save order to Supabase & React State
    await supabaseService.createOrder(newOrder);
    if (onOrderCreated) {
      onOrderCreated(newOrder);
    }

    setStep('success');
  };

  const handleFinishOrder = () => {
    setStep('cart');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setShippingAddress('');
    onClearCart();
    onClose();
  };

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />

      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} />
            <h2 style={{ fontSize: '1.4rem' }}>
              {step === 'checkout-info' ? 'Checkout Info' : step === 'success' ? 'Order Success' : 'Your Cart'}
            </h2>
            {step === 'cart' && (
              <span className="badge-neo" style={{ backgroundColor: '#FF9EAA' }}>
                {cartItems.reduce((count, i) => count + i.quantity, 0)} items
              </span>
            )}
          </div>

          <button className="btn-neo" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* STEP 3: Order Success Modal View */}
        {step === 'success' ? (
          <div className="cart-body" style={{ justifyContent: 'center', textAlign: 'center', padding: '32px 20px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#C1E1C1',
                border: '3px solid #1a1a1a',
                boxShadow: '4px 4px 0px #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle size={36} color="#1a1a1a" />
            </div>

            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Order Placed! 🎉</h3>
            <p style={{ fontSize: '0.92rem', color: '#444', marginBottom: '14px' }}>
              Thank you, <strong>{customerName || 'Customer'}</strong>! Your order details have been saved and our studio will contact you shortly.
            </p>

            <div
              style={{
                padding: '14px',
                backgroundColor: '#FFFDF0',
                border: '2px solid #1a1a1a',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Order Tracking ID:</span>
                <strong style={{ color: '#FF7B8E' }}>{orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Contact Info:</span>
                <strong>{customerPhone || customerEmail}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Amount Paid:</span>
                <strong>₹{grandTotal}</strong>
              </div>
            </div>

            <button className="btn-neo btn-neo-pink" onClick={handleFinishOrder} style={{ width: '100%', padding: '12px' }}>
              Continue Shopping
            </button>
          </div>
        ) : step === 'checkout-info' ? (
          /* STEP 2: Customer Contact Info Form */
          <form onSubmit={handleConfirmOrder} className="cart-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '4px' }}>
              Please enter your contact details so we can confirm your order and reach out regarding shipping updates.
            </p>

            {formError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FFD6E0', border: '2px solid #1a1a1a', borderRadius: '8px', color: '#D81B60', fontSize: '0.82rem', fontWeight: '700' }}>
                {formError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} />
                <span>Phone / WhatsApp Number</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>Delivery Address (Optional)</span>
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="House No, Street, City, Pincode"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>

            {/* Order Summary Recap */}
            <div style={{ padding: '10px 14px', backgroundColor: '#FFFDF0', border: '2px solid #1a1a1a', borderRadius: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Order Total ({cartItems.length} items):</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button
                type="button"
                className="btn-neo"
                style={{ flex: 1 }}
                onClick={() => setStep('cart')}
              >
                Back to Cart
              </button>
              <button
                type="submit"
                className="btn-neo btn-neo-pink"
                style={{ flex: 1.5, padding: '12px' }}
              >
                <Sparkles size={18} />
                <span>Confirm Order (₹{grandTotal})</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 1: Cart Items List View */
          <>
            <div className="cart-body">
              {/* Free Shipping Progress Bar */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FFFDF0',
                  border: '2px solid #1a1a1a',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0px #1a1a1a'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  <Truck size={16} color="#1a1a1a" />
                  {subtotal >= freeShippingThreshold ? (
                    <span>🎉 You unlocked <strong>FREE Shipping!</strong></span>
                  ) : (
                    <span>Add <strong>₹{(freeShippingThreshold - subtotal)}</strong> more for FREE Shipping!</span>
                  )}
                </div>

                <div style={{ height: '8px', backgroundColor: '#E2D4F8', borderRadius: '4px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${freeShippingProgress}%`,
                      backgroundColor: '#FF9EAA',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem' }}>Explore our laser-cut gifts to add items!</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartItemId} className="cart-item">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      style={{
                        width: '54px',
                        height: '54px',
                        border: '2px solid #1a1a1a',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product.name}
                      </h4>

                      {item.product.customization && (
                        <div style={{ fontSize: '0.78rem', color: '#D81B60', fontWeight: '600', marginTop: '2px' }}>
                          ✨ Engraving: "{item.product.customization.engravedText}"
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                        <strong style={{ fontSize: '0.95rem' }}>
                          ₹{(item.product.price * item.quantity)}
                        </strong>

                        {/* Quantity controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="btn-neo"
                            style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem', width: '16px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            className="btn-neo"
                            style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </button>

                          <button
                            className="btn-neo"
                            style={{ padding: '4px', marginLeft: '6px', backgroundColor: '#FFD6E0' }}
                            onClick={() => onRemoveItem(item.cartItemId)}
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping:</span>
                    <strong>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</strong>
                  </div>
                  <hr style={{ border: 'none', borderTop: '2px solid #1a1a1a', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800' }}>
                    <span>Total:</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  className="btn-neo btn-neo-pink"
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
                  onClick={handleStartCheckout}
                >
                  <Sparkles size={18} />
                  <span>Proceed to Contact Info</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
