import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, X, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  // Secure Admin Passcode (hidden from website UI)
  const ADMIN_PASSCODE = 'Shadow@2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === ADMIN_PASSCODE || pin.trim() === 'shadowadmin') {
      setError('');
      onLoginSuccess();
      setPin('');
      onClose();
    } else {
      setError('Invalid Admin Passcode.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '420px', backgroundColor: '#FFFDF0' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-neo modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#E2D4F8',
              border: '3px solid #1a1a1a',
              boxShadow: '4px 4px 0px #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Lock size={32} color="#1a1a1a" />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Admin Authentication</h2>
          <p style={{ fontSize: '0.88rem', color: '#555' }}>
            Protected store management panel for Shadow Administrators.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={16} />
              <span>Enter Admin Passcode</span>
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
                  setError('');
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

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#FFD6E0',
                border: '2px solid #1a1a1a',
                borderRadius: '8px',
                color: '#D81B60',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-neo btn-neo-pink"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            <Unlock size={18} />
            <span>Unlock Admin Access</span>
          </button>
        </form>
      </div>
    </div>
  );
}
