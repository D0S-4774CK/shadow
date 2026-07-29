import React, { useState } from 'react';
import { SINGLE_MATERIAL_SPECS } from '../data/mockData';
import { Zap, Upload, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

export default function LaserQuoteStudio({ onAddToCart, onSubmitQuote }) {
  const [widthMm, setWidthMm] = useState(200);
  const [heightMm, setHeightMm] = useState(150);
  const [quantity, setQuantity] = useState(10);
  const [processType, setProcessType] = useState('cut-engrave');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const materialObj = SINGLE_MATERIAL_SPECS;

  // Single material pricing formula
  const areaSqCm = (widthMm * heightMm) / 100;
  const unitMaterialCost = areaSqCm * materialObj.baseCostPerSqCm;
  const estimatedPerimeterM = ((widthMm + heightMm) * 2 + areaSqCm * 0.05) / 1000;
  const laserTimeCostPerUnit = estimatedPerimeterM * 1.5;

  const rawUnitPrice = Math.max(15, (unitMaterialCost + laserTimeCostPerUnit) * 10);

  // Bulk discount
  let bulkDiscountPct = 0;
  if (quantity >= 100) bulkDiscountPct = 0.25;
  else if (quantity >= 50) bulkDiscountPct = 0.20;
  else if (quantity >= 25) bulkDiscountPct = 0.15;
  else if (quantity >= 10) bulkDiscountPct = 0.10;

  const unitPrice = rawUnitPrice * (1 - bulkDiscountPct);
  const setupFee = 50; // INR / Setup units
  const totalPrice = unitPrice * quantity + setupFee;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        sizeKb: (file.size / 1024).toFixed(1),
        pathNodes: Math.floor(Math.random() * 300) + 120
      });
    }
  };

  const handleAddToCart = () => {
    const customProduct = {
      id: `custom-laser-${Date.now()}`,
      name: `Custom Laser Cut (${widthMm}x${heightMm}mm)`,
      category: 'custom-studio',
      categoryLabel: 'Custom Laser Studio',
      price: Math.round(totalPrice / quantity),
      formattedPrice: `₹${Math.round(totalPrice / quantity)}`,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      isCustomizable: true,
      description: `${quantity}x ${materialObj.name} (${widthMm}x${heightMm}mm). File: ${uploadedFile ? uploadedFile.name : 'Vector Specs'}`
    };

    onAddToCart(customProduct, quantity);
  };

  const handleSubmitQuoteForm = (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    const newQuote = {
      id: `quote-${Date.now().toString().slice(-4)}`,
      customerName,
      email: customerEmail,
      material: materialObj.name,
      widthMm,
      heightMm,
      quantity,
      estimatedPrice: Math.round(totalPrice),
      formattedPrice: `₹${Math.round(totalPrice)}`,
      notes: notes || `File: ${uploadedFile ? uploadedFile.name : 'Vector uploaded'}`,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSubmitQuote(newQuote);
    setQuoteSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto' }}>
      {/* Studio Banner */}
      <div
        className="card-neo"
        style={{
          backgroundColor: '#E2D4F8',
          padding: '24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            backgroundColor: '#1a1a1a',
            color: '#FFFDE7',
            padding: '14px',
            borderRadius: '16px',
            boxShadow: '3px 3px 0px #FF9EAA'
          }}
        >
          <Zap size={32} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.8rem' }}>Custom Laser Cutting Calculator</h2>
          <p style={{ color: '#333', fontSize: '0.95rem' }}>
            Instant laser cut & engraving price estimator for <strong>3mm Baltic Birch Wood</strong>.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Left Form Section */}
        <div className="studio-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>1. Custom Dimensions & Vector Artwork</h3>

          {/* Locked Single Material Display */}
          <div className="form-group">
            <label className="form-label">Laser Material Stock</label>
            <div
              style={{
                padding: '12px 16px',
                border: '2px solid #1a1a1a',
                borderRadius: '12px',
                backgroundColor: '#FFFDF0',
                boxShadow: '3px 3px 0px #1a1a1a',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🪵</span>
              <div>
                <div>{materialObj.name}</div>
                <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: '500' }}>
                  {materialObj.description}
                </span>
              </div>
            </div>
          </div>

          {/* Width & Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Width (mm)</label>
              <input
                type="number"
                className="form-input"
                min="20"
                max={materialObj.maxCuttingAreaMm.width}
                value={widthMm}
                onChange={(e) => setWidthMm(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height (mm)</label>
              <input
                type="number"
                className="form-input"
                min="20"
                max={materialObj.maxCuttingAreaMm.height}
                value={heightMm}
                onChange={(e) => setHeightMm(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Operation */}
          <div className="form-group">
            <label className="form-label">Laser Operation</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`btn-neo ${processType === 'cut' ? 'btn-neo-yellow' : ''}`}
                style={{ flex: 1, fontSize: '0.85rem' }}
                onClick={() => setProcessType('cut')}
              >
                Outline Cut Only
              </button>
              <button
                type="button"
                className={`btn-neo ${processType === 'cut-engrave' ? 'btn-neo-pink' : ''}`}
                style={{ flex: 1, fontSize: '0.85rem' }}
                onClick={() => setProcessType('cut-engrave')}
              >
                Cut + Vector Engraving
              </button>
            </div>
          </div>

          {/* File Upload Simulation */}
          <div className="form-group">
            <label className="form-label">Upload Vector Design (DXF, SVG, AI, PDF)</label>
            <div
              style={{
                border: '2px dashed #1a1a1a',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#FFFDF0',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input
                type="file"
                accept=".svg,.dxf,.ai,.pdf"
                onChange={handleFileUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />

              {uploadedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <FileText color="#FF7B8E" size={24} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{uploadedFile.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#666' }}>
                      {uploadedFile.sizeKb} KB • {uploadedFile.pathNodes} vector nodes
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload size={28} style={{ margin: '0 auto 6px', color: '#555' }} />
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Click or drop vector file here</p>
                  <p style={{ fontSize: '0.75rem', color: '#777' }}>Supports SVG, DXF, AI up to 50MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Quantity</label>
              <span className="badge-neo" style={{ backgroundColor: '#AEE2FF' }}>
                {quantity} units {bulkDiscountPct > 0 && `(${(bulkDiscountPct * 100)}% bulk discount)`}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="250"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ accentColor: '#1a1a1a', width: '100%', height: '8px' }}
            />
          </div>
        </div>

        {/* Right Price Calculator & Quote Request */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="studio-card" style={{ backgroundColor: '#FAF7BE', border: '3px solid #1a1a1a' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>Cost Estimation</h3>

            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Material:</span>
                <strong>3mm Baltic Birch</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Dimensions:</span>
                <strong>{widthMm} × {heightMm} mm</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Unit Price:</span>
                <strong>₹{Math.round(unitPrice)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Setup Fee:</span>
                <strong>₹{setupFee}</strong>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '2px solid #1a1a1a', margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                ₹{Math.round(totalPrice)}
              </span>
            </div>

            <button
              className="btn-neo btn-neo-pink"
              style={{ width: '100%', marginBottom: '10px' }}
              onClick={handleAddToCart}
            >
              <Zap size={18} />
              <span>Add Batch to Cart</span>
            </button>
          </div>

          {/* Quote Submission */}
          <div className="studio-card">
            <h4 style={{ fontSize: '1.05rem', marginBottom: '10px' }}>Submit Custom Quote</h4>
            {quoteSubmitted ? (
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#C1E1C1', borderRadius: '12px', border: '2px solid #1a1a1a' }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 4px' }} />
                <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Quote Submitted!</p>
                <p style={{ fontSize: '0.78rem' }}>Sent to store admin for review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuoteForm} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Custom notes or dimensions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button type="submit" className="btn-neo" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} />
                  <span>Submit to Admin</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
