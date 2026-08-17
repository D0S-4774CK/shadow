import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabaseService } from '../lib/supabase';

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      const { user, error } = await supabaseService.signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Registration failed.');
      } else {
        setSuccessMsg(
          '🎉 Registration successful! If email confirmation is enabled in your Supabase Dashboard, please check your inbox (Resend API configured).'
        );
        if (onAuthSuccess) onAuthSuccess(user);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      const { user, error } = await supabaseService.signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else {
        setSuccessMsg('🎉 Successfully signed in!');
        if (onAuthSuccess) onAuthSuccess(user);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '440px', backgroundColor: '#FFFDF0' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-neo modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <User size={30} color="#1a1a1a" />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
            {isSignUp ? 'Create Customer Account' : 'Customer Sign In'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#555' }}>
            {isSignUp
              ? 'Sign up to track your laser craft orders in real time.'
              : 'Sign in to access your profile and track placed orders.'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FFD6E0',
              border: '2px solid #1a1a1a',
              borderRadius: '10px',
              color: '#D81B60',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#C1E1C1',
              border: '2px solid #1a1a1a',
              borderRadius: '10px',
              color: '#1b4332',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-neo btn-neo-pink"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.98rem' }}
            disabled={loading}
          >
            <Sparkles size={18} />
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#D81B60', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#D81B60', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
              >
                Sign Up Now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
