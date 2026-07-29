import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { CATEGORIES } from '../data/mockData';
import { Sparkles, Frown } from 'lucide-react';

export default function ProductGrid({
  products,
  activeCategory,
  searchQuery,
  onCustomizeProduct,
  onAddToCart
}) {
  const [sortBy, setSortBy] = useState('featured');

  // Filter products by category & search query
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      activeCategory === 'all' || prod.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured default order
  });

  const categoryObj = CATEGORIES.find((c) => c.id === activeCategory);
  const titleText = activeCategory === 'all' ? 'All Products' : categoryObj?.label || 'Products';

  return (
    <section>
      {/* Grid Header */}
      <div className="products-header">
        <div>
          <h2 className="products-title">{titleText}</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '2px' }}>
            Showing {sortedProducts.length} precision laser-crafted item{sortedProducts.length === 1 ? '' : 's'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Sort By:</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.9rem' }}
          >
            <option value="featured">Featured First</option>
            <option value="rating">Highest Rated ⭐</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {sortedProducts.length > 0 ? (
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCustomize={onCustomizeProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div
          className="card-neo"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#FFFDF0'
          }}
        >
          <Frown size={48} color="#FF7B8E" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No items found</h3>
          <p style={{ color: '#555', maxWidth: '400px', margin: '0 auto 18px' }}>
            We couldn't find any products matching "{searchQuery}". Try searching for acrylic, signs, or keychains!
          </p>
        </div>
      )}
    </section>
  );
}
