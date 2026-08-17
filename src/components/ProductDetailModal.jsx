import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, CheckCircle2, MessageSquare, Tag, Sparkles, Send, User } from 'lucide-react';
import { supabaseService } from '../lib/supabase';

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  currentUser
}) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // New Review Form State
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState(() => {
    return currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || '';
  });
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (product?.id && isOpen) {
      setQuantity(1);
      setLoadingReviews(true);

      const initialMockReviews = [
        {
          id: 'rev-1',
          product_id: product.id,
          reviewer_name: 'Priya Sharma',
          rating: 5,
          comment: 'Beautiful quality craft item!',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];

      supabaseService.getProductReviews(product.id, initialMockReviews).then((fetched) => {
        setReviews(fetched && fetched.length > 0 ? fetched : initialMockReviews);
        setLoadingReviews(false);
      });
    }
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const reviewObj = {
      id: `rev-${Date.now()}`,
      product_id: product.id,
      reviewer_name: reviewerName.trim() || 'Happy Customer',
      rating: Number(newRating),
      comment: newComment.trim(),
      created_at: new Date().toISOString()
    };

    const saved = await supabaseService.addProductReview(reviewObj);
    setIsSubmitting(false);

    setReviews((prev) => [saved, ...prev]);
    setNewComment('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const calculateAvgRating = () => {
    if (!reviews || reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const productTags = Array.isArray(product.tags)
    ? product.tags
    : (product.tags ? String(product.tags).split(',') : []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          maxWidth: '840px',
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFDF0',
          padding: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button */}
        <button
          className="btn-neo modal-close-btn"
          onClick={onClose}
          style={{ position: 'sticky', top: '16px', right: '16px', zIndex: 10 }}
        >
          <X size={18} />
        </button>

        {/* Top Product Hero Info Layout */}
        <div
          style={{
            padding: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            borderBottom: '2px solid #1a1a1a',
            backgroundColor: '#FFFFFF'
          }}
        >
          {/* Left Column: Image Picture */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                border: '3px solid #1a1a1a',
                boxShadow: '4px 4px 0px #1a1a1a',
                overflow: 'hidden',
                backgroundColor: '#fef3c7'
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '320px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {product.badge && (
                <span
                  className="badge-neo"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#FF9EAA',
                    fontSize: '0.82rem'
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Title, Price, Description, Add to Cart */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-neo" style={{ backgroundColor: '#AEE2FF', fontSize: '0.75rem' }}>
                  {product.categoryLabel || product.category}
                </span>
                <span className="badge-neo" style={{ backgroundColor: '#FAF7BE', fontSize: '0.75rem' }}>
                  /{product.slug || product.id}
                </span>
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', lineHeight: '1.2' }}>{product.name}</h2>

              {/* Price & Rating Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                  ₹{product.price}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEFCE8', padding: '4px 10px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{calculateAvgRating()}</span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>({reviews.length} reviews)</span>
                </div>
              </div>

              {/* Description (Only show if written by Admin) */}
              {product.description && product.description.trim() !== '' && (
                <p style={{ fontSize: '0.92rem', color: '#333', lineHeight: '1.5', marginBottom: '16px' }}>
                  {product.description}
                </p>
              )}

              {/* Tags */}
              {productTags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {productTags.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        backgroundColor: '#FEFCE8',
                        border: '1px solid #1a1a1a',
                        borderRadius: '6px',
                        color: '#555',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={12} />#{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid #1a1a1a',
                  borderRadius: '10px',
                  backgroundColor: '#FFFDF0',
                  boxShadow: '2px 2px 0px #1a1a1a'
                }}
              >
                <button
                  type="button"
                  style={{ padding: '8px 12px', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span style={{ padding: '0 10px', fontWeight: '800' }}>{quantity}</span>
                <button
                  type="button"
                  style={{ padding: '8px 12px', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn-neo btn-neo-pink"
                style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
              >
                <ShoppingBag size={18} />
                <span>Add {quantity} to Cart • ₹{product.price * quantity}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Customer Comments & Reviews (Visible to All) */}
        <div style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={22} color="#D81B60" />
            <span>Customer Comments & Reviews ({reviews.length})</span>
          </h3>

          {/* Add Review Form */}
          <form
            onSubmit={handleAddReviewSubmit}
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #1a1a1a',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '3px 3px 0px #1a1a1a'
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#D81B60" />
              <span>Leave a Comment & Review</span>
            </h4>

            {submitSuccess && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#C1E1C1',
                  borderRadius: '8px',
                  border: '1px solid #1a1a1a',
                  color: '#1b4332',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Review posted! Thank you for sharing your feedback.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ananya Patel"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Rating (Stars)</label>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      onClick={() => setNewRating(star)}
                    >
                      <Star
                        size={22}
                        fill={star <= newRating ? '#F59E0B' : '#E5E7EB'}
                        color={star <= newRating ? '#F59E0B' : '#9CA3AF'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Your Comment / Review</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Share your thoughts about this product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-neo btn-neo-pink"
              style={{ width: '100%', padding: '10px', fontSize: '0.92rem' }}
              disabled={isSubmitting}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Posting Review...' : 'Post Public Review'}</span>
            </button>
          </form>

          {/* Public Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', padding: '20px' }}>
                No reviews yet. Be the first to leave a review!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #1a1a1a',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    boxShadow: '2px 2px 0px #1a1a1a'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#AEE2FF', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={14} color="#1a1a1a" />
                      </div>
                      <strong style={{ fontSize: '0.95rem' }}>{rev.reviewer_name}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= (rev.rating || 5) ? '#F59E0B' : '#E5E7EB'}
                          color={s <= (rev.rating || 5) ? '#F59E0B' : '#9CA3AF'}
                        />
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#333', lineHeight: '1.4' }}>{rev.comment}</p>
                  <span style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px', display: 'block' }}>
                    {new Date(rev.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
