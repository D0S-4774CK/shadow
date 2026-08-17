import { createClient } from '@supabase/supabase-js';

// Environment variables or localStorage override for Supabase
const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

  const localUrl = (localStorage.getItem('shadow_supabase_url') || '').trim();
  const localKey = (localStorage.getItem('shadow_supabase_key') || '').trim();

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  const isConfigured = Boolean(
    url &&
    url.length > 10 &&
    !url.includes('your-supabase-project-id') &&
    key &&
    key.length > 10 &&
    key !== 'your-supabase-anon-key-here'
  );

  return { url, key, isConfigured };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.isConfigured;

export const getSupabaseClient = () => {
  const current = getSupabaseConfig();
  if (current.isConfigured) {
    return createClient(current.url, current.key);
  }
  return null;
};

export const supabase = getSupabaseClient();

/**
 * Helper data service layer:
 * Connects to real Supabase database if configured, or falls back to local storage state.
 */
export const supabaseService = {
  // Test connection status
  async checkConnection() {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { data, error } = await client.from('products').select('id').limit(1);
      if (error) console.warn('Supabase connection notice:', error.message || error);
      return !error;
    } catch (err) {
      console.warn('Supabase connection test exception:', err);
      return false;
    }
  },

  // Save custom Supabase credentials
  saveCredentials(url, key) {
    localStorage.setItem('shadow_supabase_url', url.trim());
    localStorage.setItem('shadow_supabase_key', key.trim());
  },

  // ----------------------------------------------------
  // 1. SUPABASE USER AUTHENTICATION & ADMIN ROLES
  // ----------------------------------------------------
  async signUp(email, password, fullName = '') {
    const client = getSupabaseClient();
    if (!client) return { user: null, error: { message: 'Supabase client unconfigured' } };
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (!error && data?.user) {
        // Register in user_roles as customer by default
        await client.from('user_roles').insert([
          { user_id: data.user.id, email: data.user.email, role: 'customer' }
        ]);
      }
      return { user: data?.user || null, error };
    } catch (err) {
      return { user: null, error: err };
    }
  },

  async signIn(email, password) {
    const client = getSupabaseClient();
    if (!client) return { user: null, error: { message: 'Supabase client unconfigured' } };
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });
      return { user: data?.user || null, error };
    } catch (err) {
      return { user: null, error: err };
    }
  },

  async signOut() {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('SignOut error:', err);
    }
  },

  async getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data } = await client.auth.getUser();
      return data?.user || null;
    } catch (err) {
      return null;
    }
  },

  // Check if a given email/user is an Admin
  async checkIsAdmin(userOrEmail) {
    if (!userOrEmail) return false;
    const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;

    // Default superadmin emails
    if (email === 'harsha.stratcrowd@gmail.com' || email === 'admin@shadowstudio.in') {
      return true;
    }

    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { data } = await client
        .from('user_roles')
        .select('role')
        .eq('email', email)
        .single();

      return data?.role === 'admin';
    } catch (err) {
      return false;
    }
  },

  // Get all user roles for admin management
  async getUserRoles() {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data } = await client.from('user_roles').select('*').order('created_at', { ascending: false });
      return data || [];
    } catch (err) {
      return [];
    }
  },

  // Grant Admin Role to an Email
  async grantAdminRole(email) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { data, error } = await client
        .from('user_roles')
        .upsert([{ email: email.trim().toLowerCase(), role: 'admin' }], { onConflict: 'email' });
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ----------------------------------------------------
  // 2. DYNAMIC CATEGORY MANAGEMENT
  // ----------------------------------------------------
  async getCategories(fallbackCategories) {
    const client = getSupabaseClient();
    if (!client) return fallbackCategories;
    try {
      const { data, error } = await client.from('categories').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) return fallbackCategories;

      return data.map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.icon || '🪵',
        isPillAccent: c.isPillAccent ?? false
      }));
    } catch (err) {
      return fallbackCategories;
    }
  },

  async addCategory(categoryObj) {
    const client = getSupabaseClient();
    if (!client) return categoryObj;
    try {
      const { data } = await client
        .from('categories')
        .insert([{
          id: categoryObj.id,
          label: categoryObj.label,
          icon: categoryObj.icon || '🪵',
          isPillAccent: categoryObj.isPillAccent || false
        }])
        .select();
      return data ? data[0] : categoryObj;
    } catch (err) {
      return categoryObj;
    }
  },

  async deleteCategory(categoryId) {
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      await client.from('categories').delete().eq('id', categoryId);
      return true;
    } catch (err) {
      return false;
    }
  },

  // ----------------------------------------------------
  // 3. PRODUCTS MANAGEMENT & SCHEMA EXTENSIONS
  // ----------------------------------------------------
  async getProducts(fallbackProducts) {
    const client = getSupabaseClient();
    if (!client) return fallbackProducts;
    try {
      const { data, error } = await client.from('products').select('*');
      if (error || !data || data.length === 0) return fallbackProducts;

      return data.map((item) => ({
        ...item,
        slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `prod-${item.id}`),
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : ['Wood', 'Laser Cut']),
        categoryLabel: item.categoryLabel || item.categorylabel || item.category,
        formattedPrice: item.formattedPrice || item.formattedprice || `₹${item.price}`,
        imageUrl: item.imageUrl || item.imageurl || item.image_url,
        isCustomizable: false,
        inStock: item.inStock !== undefined ? item.inStock : (item.instock !== undefined ? item.instock : 20)
      }));
    } catch (err) {
      console.warn('Supabase fetch error, using local fallback:', err);
      return fallbackProducts;
    }
  },

  async addProduct(newProduct) {
    const client = getSupabaseClient();
    if (!client) return newProduct;
    try {
      const formatted = {
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: newProduct.category,
        price: newProduct.price,
        description: newProduct.description || '',
        imageurl: newProduct.imageUrl,
        imageUrl: newProduct.imageUrl,
        tags: Array.isArray(newProduct.tags) ? newProduct.tags : String(newProduct.tags || '').split(',').map(t => t.trim())
      };

      const { data, error } = await client
        .from('products')
        .insert([formatted])
        .select();
      if (error) console.error('Error adding product to Supabase:', error);
      return data ? data[0] : newProduct;
    } catch (err) {
      console.error('Supabase insert error:', err);
      return newProduct;
    }
  },

  async syncCatalogToSupabase(productsList, customClient = null) {
    const client = customClient || getSupabaseClient();
    if (!client) {
      console.error('Supabase client not initialized.');
      return { success: false, error: 'Supabase client not initialized.' };
    }

    const fullPayload = productsList.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: p.category,
      categoryLabel: p.categoryLabel,
      categorylabel: p.categoryLabel,
      price: p.price,
      formattedPrice: p.formattedPrice || `₹${p.price}`,
      formattedprice: p.formattedPrice || `₹${p.price}`,
      rating: p.rating || 5.0,
      reviewsCount: p.reviewsCount || 10,
      badge: p.badge || 'Popular',
      isCustomizable: false,
      iscustomizable: false,
      description: p.description || '',
      imageUrl: p.imageUrl,
      imageurl: p.imageUrl,
      inStock: p.inStock || 20,
      tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map(t => t.trim())
    }));

    try {
      const { error: err1 } = await client.from('products').upsert(fullPayload, { onConflict: 'id' });
      if (!err1) return { success: true };

      const standardPayload = productsList.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description || '',
        imageUrl: p.imageUrl,
        imageurl: p.imageUrl
      }));

      const { error: err2 } = await client.from('products').upsert(standardPayload, { onConflict: 'id' });
      if (!err2) return { success: true };

      const minPayload = productsList.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price
      }));

      const { error: err3 } = await client.from('products').upsert(minPayload, { onConflict: 'id' });
      if (!err3) return { success: true };

      return { success: false, error: err3.message || err2.message || err1.message };
    } catch (err) {
      console.error('Sync exception:', err);
      return { success: false, error: err.message || 'Network exception' };
    }
  },

  async deleteProduct(productId) {
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', productId);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ----------------------------------------------------
  // 4. ORDERS & PAYMENT STATUS MANAGEMENT
  // ----------------------------------------------------
  async createOrder(orderData) {
    const client = getSupabaseClient();
    if (!client) return orderData;
    try {
      const payload = {
        id: orderData.id,
        user_id: orderData.user_id || null,
        customer_name: orderData.customer_name || 'Customer',
        customer_phone: orderData.customer_phone || 'N/A',
        customer_email: orderData.customer_email || 'harsha.stratcrowd@gmail.com',
        shipping_address: orderData.shipping_address || 'N/A',
        total_amount: orderData.total_amount,
        items: orderData.items,
        status: orderData.status || 'Processing',
        payment_status: orderData.payment_status || 'Pending',
        created_at: orderData.created_at || new Date().toISOString()
      };

      const { data, error } = await client
        .from('orders')
        .insert([payload])
        .select();

      if (error) {
        console.warn('Primary order insert notice (attempting fallback columns):', error);
        const fallbackPayload = {
          id: orderData.id,
          customer_email: `${orderData.customer_name || 'Customer'} | ${orderData.customer_phone || ''} | ${orderData.customer_email || ''}`,
          total_amount: orderData.total_amount,
          items: orderData.items,
          status: orderData.status || 'Processing'
        };
        await client.from('orders').insert([fallbackPayload]);
      }
      return data ? data[0] : orderData;
    } catch (err) {
      return orderData;
    }
  },

  async getOrders(fallbackOrders = []) {
    const client = getSupabaseClient();
    if (!client) return fallbackOrders;
    try {
      const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (error || !data) return fallbackOrders;
      return data;
    } catch (err) {
      return fallbackOrders;
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      return !error;
    } catch (err) {
      return false;
    }
  },

  async updatePaymentStatus(orderId, newPaymentStatus) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client
        .from('orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ----------------------------------------------------
  // 5. WEBSITE STORE SETTINGS
  // ----------------------------------------------------
  async getStoreSettings(fallbackSettings) {
    const client = getSupabaseClient();
    if (!client) return fallbackSettings;
    try {
      const { data } = await client.from('store_settings').select('*');
      if (!data || data.length === 0) return fallbackSettings;

      const obj = { ...fallbackSettings };
      data.forEach((s) => {
        obj[s.setting_key] = s.setting_value;
      });
      return obj;
    } catch (err) {
      return fallbackSettings;
    }
  },

  async updateStoreSetting(key, value) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client
        .from('store_settings')
        .upsert([{ setting_key: key, setting_value: String(value), updated_at: new Date().toISOString() }], { onConflict: 'setting_key' });
      return !error;
    } catch (err) {
      return false;
    }
  }
};
