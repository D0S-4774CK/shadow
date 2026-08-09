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

  // Fetch All Products from Supabase
  async getProducts(fallbackProducts) {
    const client = getSupabaseClient();
    if (!client) return fallbackProducts;
    try {
      const { data, error } = await client.from('products').select('*');
      if (error || !data || data.length === 0) return fallbackProducts;

      return data.map((item) => ({
        ...item,
        categoryLabel: item.categoryLabel || item.categorylabel || item.category,
        formattedPrice: item.formattedPrice || item.formattedprice || `₹${item.price}`,
        imageUrl: item.imageUrl || item.imageurl || item.image_url,
        isCustomizable: item.isCustomizable !== undefined ? item.isCustomizable : item.iscustomizable,
        inStock: item.inStock !== undefined ? item.inStock : item.instock
      }));
    } catch (err) {
      console.warn('Supabase fetch error, using local fallback:', err);
      return fallbackProducts;
    }
  },

  // Insert New Product into Supabase
  async addProduct(newProduct) {
    const client = getSupabaseClient();
    if (!client) return newProduct;
    try {
      const formatted = {
        ...newProduct,
        categorylabel: newProduct.categoryLabel,
        formattedprice: newProduct.formattedPrice,
        imageurl: newProduct.imageUrl,
        iscustomizable: false,
        instock: newProduct.inStock
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

  // Bulk Seed/Sync Catalog Products to Supabase
  async syncCatalogToSupabase(productsList, customClient = null) {
    const client = customClient || getSupabaseClient();
    if (!client) {
      console.error('Supabase client not initialized.');
      return { success: false, error: 'Supabase client not initialized.' };
    }
    try {
      const formattedList = productsList.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        categoryLabel: p.categoryLabel,
        categorylabel: p.categoryLabel,
        price: p.price,
        formattedPrice: p.formattedPrice || `₹${p.price}`,
        formattedprice: p.formattedPrice || `₹${p.price}`,
        rating: p.rating || 5.0,
        reviewsCount: p.reviewsCount || 10,
        reviewscount: p.reviewsCount || 10,
        badge: p.badge || 'Popular',
        isCustomizable: false,
        iscustomizable: false,
        description: p.description || '',
        imageUrl: p.imageUrl,
        imageurl: p.imageUrl,
        inStock: p.inStock || 20,
        instock: p.inStock || 20
      }));

      const { error } = await client.from('products').upsert(formattedList, { onConflict: 'id' });
      if (error) {
        console.error('Error syncing products to Supabase:', error);
        return { success: false, error: error.message || JSON.stringify(error) };
      }
      return { success: true };
    } catch (err) {
      console.error('Sync error:', err);
      return { success: false, error: err.message || 'Unknown network error' };
    }
  },

  // Delete Product from Supabase
  async deleteProduct(productId) {
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) {
        console.error('Error deleting product from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase delete error:', err);
      return false;
    }
  },

  // Create Order in Supabase
  async createOrder(orderData) {
    const client = getSupabaseClient();
    if (!client) return orderData;
    try {
      const payload = {
        id: orderData.id,
        customer_name: orderData.customer_name || 'Customer',
        customer_phone: orderData.customer_phone || 'N/A',
        customer_email: orderData.customer_email || 'harsha.stratcrowd@gmail.com',
        shipping_address: orderData.shipping_address || 'N/A',
        total_amount: orderData.total_amount,
        items: orderData.items,
        status: orderData.status || 'Processing',
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
      console.error('Supabase order save exception:', err);
      return orderData;
    }
  },

  // Fetch Orders from Supabase
  async getOrders(fallbackOrders = []) {
    const client = getSupabaseClient();
    if (!client) return fallbackOrders;
    try {
      const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (error || !data) return fallbackOrders;
      return data;
    } catch (err) {
      console.warn('Supabase fetch orders error:', err);
      return fallbackOrders;
    }
  }
};
