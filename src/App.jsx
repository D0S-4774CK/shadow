import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategorySidebar from './components/CategorySidebar';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import AdminPortalPage from './components/AdminPortalPage';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomerProfilePage from './components/CustomerProfilePage';
import Footer from './components/Footer';

import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from './data/mockData';
import { supabaseService, getSupabaseClient } from './lib/supabase';

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_custom_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Routing state for dedicated pages (/admin, /profile, /)
  const [routePath, setRoutePath] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    if (p === '/admin' || h === '#admin') return '/admin';
    if (p === '/profile' || h === '#profile') return '/profile';
    return '/';
  });

  // Listen for URL route changes
  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p === '/admin' || h === '#admin') {
        setRoutePath('/admin');
      } else if (p === '/profile' || h === '#profile') {
        setRoutePath('/profile');
      } else {
        setRoutePath('/');
      }
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

  // Initial data loading from Supabase & Auth subscription
  useEffect(() => {
    // Check Current User Auth
    supabaseService.getCurrentUser().then((u) => {
      if (u) setCurrentUser(u);
    });

    const client = getSupabaseClient();
    if (client) {
      const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user || null);
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    supabaseService.getProducts(products).then((loadedProducts) => {
      if (loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
        try {
          localStorage.setItem('shadow_custom_products', JSON.stringify(loadedProducts));
        } catch (e) {}
      }
    });

    supabaseService.getCategories(categories).then((loadedCategories) => {
      if (loadedCategories && loadedCategories.length > 0) {
        setCategories(loadedCategories);
        try {
          localStorage.setItem('shadow_categories', JSON.stringify(loadedCategories));
        } catch (e) {}
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
    } else if (path === '/profile') {
      window.history.pushState({}, '', '/profile');
      window.location.hash = 'profile';
      setRoutePath('/profile');
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
    const enrichedOrder = {
      ...newOrder,
      user_id: currentUser?.id || null
    };

    setOrders((prev) => {
      const updated = [enrichedOrder, ...prev];
      try {
        localStorage.setItem('shadow_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Category Handlers
  const handleAddCategory = (newCat) => {
    setCategories((prev) => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem('shadow_categories', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteCategory = (catId) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== catId);
      try {
        localStorage.setItem('shadow_categories', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    supabaseService.deleteCategory(catId);
  };

  // Product Handlers (saves to local state, localStorage AND Supabase)
  const handleAddProduct = async (newProd) => {
    setProducts((prev) => {
      const updated = [newProd, ...prev];
      try {
        localStorage.setItem('shadow_custom_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    await supabaseService.addProduct(newProd);
  };

  const handleUpdateProduct = (prodId, updates) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === prodId ? { ...p, ...updates } : p));
      try {
        localStorage.setItem('shadow_custom_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteProduct = async (productId) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('shadow_custom_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    await supabaseService.deleteProduct(productId);
  };

  const handleUpdateOrder = (orderId, updates) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const handleSignOut = async () => {
    await supabaseService.signOut();
    setCurrentUser(null);
    navigateTo('/');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ROUTE 2: DEDICATED SEPARATE ADMIN PORTAL WEBPAGE (/admin)
  if (routePath === '/admin') {
    return (
      <AdminPortalPage
        products={products}
        categories={categories}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        orders={orders}
        onUpdateOrder={handleUpdateOrder}
        onNavigateToStore={() => navigateTo('/')}
      />
    );
  }

  // ROUTE 3: CUSTOMER PROFILE & ORDER TRACKER PAGE (/profile)
  if (routePath === '/profile') {
    return (
      <CustomerProfilePage
        currentUser={currentUser}
        orders={orders}
        onSignOut={handleSignOut}
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
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => navigateTo('/profile')}
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
          categories={categories}
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

      {/* Customer Authentication Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          navigateTo('/profile');
        }}
      />
    </div>
  );
}
