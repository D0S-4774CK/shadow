import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.length > 10 &&
  !supabaseUrl.includes('your-supabase-project-id') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 10 &&
  supabaseAnonKey !== 'your-supabase-anon-key-here'
);

// Initialize Supabase Client (or null if unconfigured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null);

/**
 * Helper data service layer:
 * Connects to real Supabase database if configured, or falls back to local storage state.
 */
export const supabaseService = {
  // Test live connection status
  async checkConnection() {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase.from('products').select('id').limit(1);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // Fetch All Products from Supabase
  async getProducts(fallbackProducts) {
    if (!supabase) return fallbackProducts;
    try {
      const { data, error } = await supabase.from('products').select('*');
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
    if (!supabase) return newProduct;
    try {
      const formatted = {
        ...newProduct,
        categorylabel: newProduct.categoryLabel,
        formattedprice: newProduct.formattedPrice,
        imageurl: newProduct.imageUrl,
        iscustomizable: newProduct.isCustomizable,
        instock: newProduct.inStock
      };

      const { data, error } = await supabase
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
  async syncCatalogToSupabase(productsList) {
    if (!supabase) {
      console.error('Supabase client not initialized.');
      return false;
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
        isCustomizable: p.isCustomizable ?? true,
        iscustomizable: p.isCustomizable ?? true,
        description: p.description || '',
        imageUrl: p.imageUrl,
        imageurl: p.imageUrl,
        inStock: p.inStock || 20,
        instock: p.inStock || 20
      }));

      const { error } = await supabase.from('products').upsert(formattedList, { onConflict: 'id' });
      if (error) {
        console.error('Error syncing products to Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Sync error:', err);
      return false;
    }
  },

  // Delete Product from Supabase
  async deleteProduct(productId) {
    if (!supabase) return true;
    try {
      const { error } = await supabase
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

  // Submit Laser Quote
  async submitQuote(newQuote) {
    if (!supabase) return newQuote;
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select();
      if (error) console.error('Error submitting quote to Supabase:', error);
      return data ? data[0] : newQuote;
    } catch (err) {
      console.error('Supabase quote submit error:', err);
      return newQuote;
    }
  },

  // Create Order in Supabase (Handling schema columns gracefully)
  async createOrder(orderData) {
    if (!supabase) return orderData;
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

      const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select();

      if (error) {
        console.warn('Primary order insert notice (attempting fallback columns):', error);
        // Fallback to essential columns if new columns are not yet created in Supabase table
        const fallbackPayload = {
          id: orderData.id,
          customer_email: `${orderData.customer_name || 'Customer'} | ${orderData.customer_phone || ''} | ${orderData.customer_email || ''}`,
          total_amount: orderData.total_amount,
          items: orderData.items,
          status: orderData.status || 'Processing'
        };
        await supabase.from('orders').insert([fallbackPayload]);
      }
      return data ? data[0] : orderData;
    } catch (err) {
      console.error('Supabase order save exception:', err);
      return orderData;
    }
  },

  // Fetch Orders from Supabase
  async getOrders(fallbackOrders = []) {
    if (!supabase) return fallbackOrders;
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error || !data) return fallbackOrders;
      return data;
    } catch (err) {
      console.warn('Supabase fetch orders error:', err);
      return fallbackOrders;
    }
  }
};
