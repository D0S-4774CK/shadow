import React from 'react';
import ProductCard from './ProductCard';
import { PackageX } from 'lucide-react';

export default function ProductGrid({
  products,
  activeCategory,
  searchQuery,
  onAddToCart,
  onSelectProduct
}) {
  // Filter products by Category and Search Query
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    const matchesCategory =
      activeCategory === 'all' || product.category === activeCategory;

    // 2. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.categoryLabel && product.categoryLabel.toLowerCase().includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="product-grid-section">
      {/* Grid Content */}
      {filteredProducts.length === 0 ? (
        <div className="empty-catalog-state card-neo">
          <PackageX size={48} className="empty-icon" />
          <h3 className="empty-title">No laser craft products found</h3>
          <p className="empty-subtitle">
            Try adjusting your search query or switching to a different category!
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
}
