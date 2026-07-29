import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategorySidebar from './components/CategorySidebar';
import ProductGrid from './components/ProductGrid';
import LaserQuoteStudio from './components/LaserQuoteStudio';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import Footer from './components/Footer';

import { INITIAL_PRODUCTS, INITIAL_QUOTES } from './data/mockData';
import { supabaseService } from './lib/supabase';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'laser-studio'
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Modal states
  const [cartItems, setCartItems] = useState([
    {
      cartItemId: 'sample-cart-1',
      product: INITIAL_PRODUCTS[0],
      quantity: 1
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState(null);

  // Load products & orders from Supabase on initial mount
  useEffect(() => {
    supabaseService.getProducts(INITIAL_PRODUCTS).then((loadedProducts) => {
      if (loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
      }
    });

    supabaseService.getOrders(orders).then((loadedOrders) => {
      if (loadedOrders && loadedOrders.length > 0) {
        setOrders(loadedOrders);
        try {
          localStorage.setItem('shadow_orders', JSON.stringify(loadedOrders));
        } catch (e) {}
      }
    });
  }, []);

  // Admin Security Trigger
  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  // Cart Handlers
  const handleAddToCart = (product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.product.customization) === JSON.stringify(product.customization)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantityToAdd;
        return updated;
      }

      return [
        ...prevItems,
        {
          cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity: quantityToAdd
        }
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('shadow_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Admin Product & Quote Handlers with Supabase Sync
  const handleAddProduct = async (newProd) => {
    if (!isAdminAuthenticated) return;
    setProducts((prev) => [newProd, ...prev]);
    await supabaseService.addProduct(newProd);
  };

  const handleUpdateProduct = (prodId, updates) => {
    if (!isAdminAuthenticated) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, ...updates } : p))
    );
  };

  const handleDeleteProduct = async (productId) => {
    if (!isAdminAuthenticated) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await supabaseService.deleteProduct(productId);
  };

  const handleAddQuote = async (newQuote) => {
    setQuotes((prev) => [newQuote, ...prev]);
    await supabaseService.submitQuote(newQuote);
  };

  const handleUpdateQuoteStatus = (quoteId, status) => {
    if (!isAdminAuthenticated) return;
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status } : q))
    );
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdminTrigger}
        activeView={activeView}
        setActiveView={setActiveView}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={handleAdminLogout}
      />

      {/* Hero Banner Section */}
      <HeroBanner
        onOpenStudio={() => setActiveView('laser-studio')}
        onExploreCatalog={() => {
          setActiveView('catalog');
          setActiveCategory('all');
        }}
      />

      {/* Main Workspace Layout matching reference screenshot */}
      <main className="main-layout">
        {/* Left Column: Category Sidebar */}
        <CategorySidebar
          activeCategory={activeCategory}
          onSelectCategory={(catId) => setActiveCategory(catId)}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        {/* Right Column: Catalog Grid OR Laser Cutting Studio */}
        <div className="main-content-area">
          {activeView === 'laser-studio' ? (
            <LaserQuoteStudio
              onAddToCart={handleAddToCart}
              onSubmitQuote={handleAddQuote}
            />
          ) : (
            <ProductGrid
              products={products}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onCustomizeProduct={(prod) => setCustomizingProduct(prod)}
              onAddToCart={(prod) => handleAddToCart(prod, 1)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Personalization Modal */}
      {customizingProduct && (
        <ProductCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={(custProd) => handleAddToCart(custProd, 1)}
        />
      )}

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
      />

      {/* Admin Passcode Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Protected Admin Panel Modal */}
      {isAdminAuthenticated && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          quotes={quotes}
          onUpdateQuoteStatus={handleUpdateQuoteStatus}
          orders={orders}
          onLogout={handleAdminLogout}
        />
      )}
    </div>
  );
}
