import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategorySidebar from './components/CategorySidebar';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import AdminPortalPage from './components/AdminPortalPage';
import Footer from './components/Footer';

import { INITIAL_PRODUCTS } from './data/mockData';
import { supabaseService } from './lib/supabase';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Routing state for dedicated Admin Webpage (/admin or #admin)
  const [routePath, setRoutePath] = useState(() => {
    return window.location.pathname.toLowerCase() === '/admin' || window.location.hash.toLowerCase() === '#admin'
      ? '/admin'
      : '/';
  });

  // Listen for browser URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdminRoute =
        window.location.pathname.toLowerCase() === '/admin' ||
        window.location.hash.toLowerCase() === '#admin';
      setRoutePath(isAdminRoute ? '/admin' : '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Cart & Modal states
  const [cartItems, setCartItems] = useState([
    {
      cartItemId: 'sample-cart-1',
      product: INITIAL_PRODUCTS[0],
      quantity: 1
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  // Navigation Helper
  const navigateTo = (path) => {
    if (path === '/admin') {
      window.history.pushState({}, '', '/admin');
      window.location.hash = 'admin';
      setRoutePath('/admin');
    } else {
      window.history.pushState({}, '', '/');
      window.location.hash = '';
      setRoutePath('/');
    }
  };

  // Cart Handlers
  const handleAddToCart = (product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
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

  // Product Handlers
  const handleAddProduct = async (newProd) => {
    setProducts((prev) => [newProd, ...prev]);
    await supabaseService.addProduct(newProd);
  };

  const handleUpdateProduct = (prodId, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, ...updates } : p))
    );
  };

  const handleDeleteProduct = async (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await supabaseService.deleteProduct(productId);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ROUTE 2: DEDICATED SEPARATE ADMIN PORTAL WEBPAGE (/admin)
  if (routePath === '/admin') {
    return (
      <AdminPortalPage
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        orders={orders}
        onNavigateToStore={() => navigateTo('/')}
      />
    );
  }

  // ROUTE 1: CLEAN PUBLIC STOREFRONT
  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        setActiveView={setActiveView}
      />

      {/* Hero Banner Section */}
      <HeroBanner
        onExploreCatalog={() => {
          setActiveView('catalog');
          setActiveCategory('all');
        }}
      />

      {/* Main Workspace Layout */}
      <main className="main-layout">
        {/* Left Column: Category Sidebar */}
        <CategorySidebar
          activeCategory={activeCategory}
          onSelectCategory={(catId) => setActiveCategory(catId)}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        {/* Right Column: Catalog Grid */}
        <div className="main-content-area">
          <ProductGrid
            products={products}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onAddToCart={(prod) => handleAddToCart(prod, 1)}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />

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
    </div>
  );
}
