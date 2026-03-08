import axios from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Category,
  Order,
  User,
  AuthResponse,
  AdminDashboard,
  SellerDashboard,
  Review,
  WishlistItem,
  Coupon,
  Payment,
  SearchResults,
  SearchSuggestions,
  Address,
  OrderStatusHistory,
  Shop,
  Commission,
  Dispute,
  DisputeMessage,
  Conversation,
  Message,
  Wallet,
  Withdrawal,
  ReviewReply,
  ShippingZone,
} from '@/types';

// ============================================
// Auth API
// ============================================
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: 'buyer' | 'seller';
  }) => {
    const res = await axios.post<ApiResponse<AuthResponse>>('/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await axios.post<ApiResponse<AuthResponse>>('/login', data);
    return res.data;
  },

  logout: async () => {
    await axios.post('/logout');
  },

  refresh: async () => {
    const res = await axios.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return res.data;
  },

  getProfile: async () => {
    const res = await axios.get<ApiResponse<{ user: User }>>('/user');
    return res.data.data.user;
  },

  updateProfile: async (data: FormData) => {
    data.append('_method', 'PUT');
    const res = await axios.post<ApiResponse<{ user: User }>>('/user/update', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.user;
  },

  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await axios.put<ApiResponse<null>>('/user/password', data);
    return res.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const res = await axios.post<ApiResponse<null>>('/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await axios.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },
};

// ============================================
// Products API
// ============================================
export const productsApi = {
  getAll: async (params?: {
    category?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: string;
    per_page?: number;
    page?: number;
  }) => {
    const res = await axios.get<PaginatedResponse<Product>>('/products', { params });
    return res.data;
  },

  getFeatured: async (limit?: number) => {
    const res = await axios.get<ApiResponse<Product[]>>('/products/featured', {
      params: { limit },
    });
    return res.data.data;
  },

  getById: async (idOrSlug: string | number) => {
    const res = await axios.get<ApiResponse<Product>>(`/products/${idOrSlug}`);
    return res.data.data;
  },

  create: async (data: FormData) => {
    const res = await axios.post<ApiResponse<Product>>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  update: async (id: number, data: FormData) => {
    data.append('_method', 'PUT');
    const res = await axios.post<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  delete: async (id: number) => {
    await axios.delete(`/products/${id}`);
  },

  getMyProducts: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Product>>('/seller/products', { params });
    return res.data;
  },
};

// ============================================
// Categories API
// ============================================
export const categoriesApi = {
  getAll: async () => {
    const res = await axios.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  getBySlug: async (slug: string) => {
    const res = await axios.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data.data;
  },

  getProducts: async (slug: string, params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Product>>(`/categories/${slug}/products`, { params });
    return res.data;
  },
};

// ============================================
// Cart API
// ============================================
export interface CartResponseItem {
  item_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cart_id: number;
  items: CartResponseItem[];
  items_count: number;
  total: number;
}

export const cartApi = {
  get: async () => {
    const res = await axios.get<ApiResponse<CartResponse>>('/cart');
    return res.data.data;
  },

  addItem: async (data: { product_id: number; quantity: number }) => {
    const res = await axios.post('/cart', data);
    return res.data;
  },

  updateItem: async (cartItemId: number, quantity: number) => {
    const res = await axios.put(`/cart/${cartItemId}`, { quantity });
    return res.data;
  },

  removeItem: async (cartItemId: number) => {
    await axios.delete(`/cart/${cartItemId}`);
  },

  clear: async () => {
    await axios.delete('/cart');
  },
};

// ============================================
// Address API
// ============================================
export const addressApi = {
  getAll: async () => {
    const res = await axios.get<ApiResponse<Address[]>>('/addresses');
    return res.data.data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<Address>>(`/addresses/${id}`);
    return res.data.data;
  },

  create: async (data: {
    label?: string;
    full_name: string;
    phone: string;
    city: string;
    quarter: string;
    street_address: string;
    landmark?: string;
    is_default?: boolean;
  }) => {
    const res = await axios.post<ApiResponse<Address>>('/addresses', data);
    return res.data.data;
  },

  update: async (id: number, data: Record<string, unknown>) => {
    const res = await axios.put<ApiResponse<Address>>(`/addresses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number) => {
    await axios.delete(`/addresses/${id}`);
  },

  setDefault: async (id: number) => {
    const res = await axios.patch<ApiResponse<Address>>(`/addresses/${id}/default`);
    return res.data.data;
  },
};

// ============================================
// Orders API
// ============================================
export const ordersApi = {
  getAll: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Order>>('/orders', { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  create: async (data: {
    address_id: number;
    payment_method: string;
    coupon_code?: string;
    notes?: string;
  }) => {
    const res = await axios.post<ApiResponse<Order>>('/orders', data);
    return res.data;
  },

  cancel: async (id: number) => {
    const res = await axios.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return res.data;
  },

  updateStatus: async (id: number, data: { status: string; comment?: string }) => {
    const res = await axios.put<ApiResponse<Order>>(`/orders/${id}/status`, data);
    return res.data;
  },

  applyCoupon: async (code: string) => {
    const res = await axios.post<ApiResponse<{
      coupon: { code: string; type: string; value: number };
      subtotal: number;
      discount: number;
      total_after_discount: number;
    }>>('/orders/apply-coupon', { code });
    return res.data.data;
  },

  getHistory: async (id: number) => {
    const res = await axios.get<ApiResponse<OrderStatusHistory[]>>(`/orders/${id}/history`);
    return res.data.data;
  },

  reorder: async (id: number) => {
    const res = await axios.post(`/orders/${id}/reorder`);
    return res.data;
  },
};

// ============================================
// Payment API
// ============================================
export const paymentApi = {
  pay: async (orderId: number, data: { payment_method: string; phone_number?: string; amount?: number }) => {
    const res = await axios.post<ApiResponse<Payment>>(`/orders/${orderId}/pay`, data);
    return res.data;
  },

  getMyPayments: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Payment>>('/payments', { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data.data;
  },

  getStatus: async (orderId: number) => {
    const res = await axios.get(`/payments/${orderId}/status`);
    return res.data.data;
  },
};

// ============================================
// Reviews API
// ============================================
export const reviewsApi = {
  getByProduct: async (productId: number, page?: number) => {
    const res = await axios.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`, {
      params: { page },
    });
    return res.data;
  },

  create: async (productId: number, data: { rating: number; comment?: string }) => {
    const res = await axios.post<ApiResponse<Review>>(`/products/${productId}/reviews`, data);
    return res.data;
  },

  update: async (reviewId: number, data: { rating: number; comment?: string }) => {
    const res = await axios.put<ApiResponse<Review>>(`/reviews/${reviewId}`, data);
    return res.data;
  },

  delete: async (reviewId: number) => {
    await axios.delete(`/reviews/${reviewId}`);
  },

  reply: async (reviewId: number, content: string) => {
    const res = await axios.post<ApiResponse<ReviewReply>>(`/reviews/${reviewId}/reply`, { content });
    return res.data;
  },
};

// ============================================
// Wishlist API
// ============================================
export const wishlistApi = {
  getAll: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<WishlistItem>>('/wishlist', { params });
    return res.data;
  },

  add: async (productId: number) => {
    const res = await axios.post<ApiResponse<WishlistItem>>('/wishlist', { product_id: productId });
    return res.data;
  },

  remove: async (productId: number) => {
    await axios.delete(`/wishlist/${productId}`);
  },

  check: async (productId: number) => {
    const res = await axios.get<ApiResponse<{ in_wishlist: boolean }>>(`/wishlist/check/${productId}`);
    return res.data.data.in_wishlist;
  },

  clear: async () => {
    await axios.delete('/wishlist');
  },
};

// ============================================
// Search API
// ============================================
export const searchApi = {
  search: async (q: string) => {
    const res = await axios.get<ApiResponse<SearchResults>>('/search', { params: { q } });
    return res.data.data;
  },

  suggestions: async (q: string) => {
    const res = await axios.get<ApiResponse<SearchSuggestions>>('/search/suggestions', { params: { q } });
    return res.data.data;
  },
};

// ============================================
// Coupon API
// ============================================
export const couponApi = {
  verify: async (code: string, amount: number) => {
    const res = await axios.post('/coupons/verify', { code, amount });
    return res.data;
  },
};

// ============================================
// Admin API
// ============================================
export const adminApi = {
  getDashboard: async () => {
    const res = await axios.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return res.data.data;
  },

  getUsers: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get('/admin/users', { params });
    return res.data;
  },

  getUser: async (id: number) => {
    const res = await axios.get(`/admin/users/${id}`);
    return res.data.data;
  },

  updateUserRole: async (id: number, role: string) => {
    const res = await axios.put(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  toggleUser: async (id: number) => {
    const res = await axios.put(`/admin/users/${id}/toggle`);
    return res.data;
  },

  deleteUser: async (id: number) => {
    await axios.delete(`/admin/users/${id}`);
  },

  getOrders: async (params?: { per_page?: number; page?: number; status?: string }) => {
    const res = await axios.get<PaginatedResponse<Order>>('/admin/orders', { params });
    return res.data;
  },

  updateOrderStatus: async (id: number, data: { status: string; comment?: string }) => {
    const res = await axios.put(`/admin/orders/${id}/status`, data);
    return res.data;
  },

  getProducts: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get('/admin/products', { params });
    return res.data;
  },

  toggleProduct: async (id: number) => {
    const res = await axios.put(`/admin/products/${id}/toggle`);
    return res.data;
  },

  deleteProduct: async (id: number) => {
    await axios.delete(`/admin/products/${id}`);
  },

  getCategories: async () => {
    const res = await axios.get<ApiResponse<Category[]>>('/admin/categories');
    return res.data.data;
  },

  createCategory: async (data: { name: string; description?: string; image?: string }) => {
    const res = await axios.post<ApiResponse<Category>>('/admin/categories', data);
    return res.data;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string; image?: string }) => {
    const res = await axios.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: number) => {
    await axios.delete(`/admin/categories/${id}`);
  },

  getCoupons: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get('/admin/coupons', { params });
    return res.data;
  },

  createCoupon: async (data: Partial<Coupon>) => {
    const res = await axios.post('/admin/coupons', data);
    return res.data;
  },

  updateCoupon: async (id: number, data: Partial<Coupon>) => {
    const res = await axios.put(`/admin/coupons/${id}`, data);
    return res.data;
  },

  deleteCoupon: async (id: number) => {
    await axios.delete(`/admin/coupons/${id}`);
  },

  getPayments: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get('/admin/payments', { params });
    return res.data;
  },

  refundOrder: async (orderId: number, reason?: string) => {
    const res = await axios.post(`/admin/orders/${orderId}/refund`, { reason });
    return res.data;
  },

  getReviews: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get('/admin/reviews', { params });
    return res.data;
  },

  deleteReview: async (id: number) => {
    await axios.delete(`/admin/reviews/${id}`);
  },

  // Sellers management
  getSellers: async (params?: { per_page?: number; page?: number; seller_status?: string }) => {
    const res = await axios.get<PaginatedResponse<User & { shop?: Shop }>>('/admin/sellers', { params });
    return res.data;
  },

  approveSeller: async (id: number) => {
    const res = await axios.put(`/admin/sellers/${id}/approve`);
    return res.data;
  },

  rejectSeller: async (id: number) => {
    const res = await axios.put(`/admin/sellers/${id}/reject`);
    return res.data;
  },

  banSeller: async (id: number) => {
    const res = await axios.put(`/admin/sellers/${id}/ban`);
    return res.data;
  },

  // Commissions
  getCommissions: async (params?: { per_page?: number; page?: number; seller_id?: number; status?: string; date_from?: string; date_to?: string }) => {
    const res = await axios.get<PaginatedResponse<Commission>>('/admin/commissions', { params });
    return res.data;
  },

  getCommissionStats: async (period?: string) => {
    const res = await axios.get<ApiResponse<{ total: number; pending: number; paid: number; period_total: number; rate: number }>>('/admin/commissions/stats', { params: { period } });
    return res.data.data;
  },

  updateCommissionRate: async (rate: number) => {
    const res = await axios.put('/admin/settings/commission-rate', { rate });
    return res.data;
  },

  // Disputes (admin)
  getDisputes: async (params?: { per_page?: number; page?: number; status?: string }) => {
    const res = await axios.get<PaginatedResponse<Dispute>>('/admin/disputes', { params });
    return res.data;
  },

  getDispute: async (id: number) => {
    const res = await axios.get<ApiResponse<Dispute>>(`/admin/disputes/${id}`);
    return res.data.data;
  },

  addDisputeMessage: async (disputeId: number, message: string) => {
    const res = await axios.post(`/admin/disputes/${disputeId}/messages`, { message });
    return res.data;
  },

  updateDisputeStatus: async (disputeId: number, data: { status: string; resolution?: string }) => {
    const res = await axios.put(`/admin/disputes/${disputeId}/status`, data);
    return res.data;
  },

  // Withdrawals (admin)
  getWithdrawals: async (params?: { per_page?: number; page?: number; status?: string }) => {
    const res = await axios.get<PaginatedResponse<Withdrawal>>('/admin/withdrawals', { params });
    return res.data;
  },

  processWithdrawal: async (id: number, data: { action: 'complete' | 'reject'; transaction_id?: string }) => {
    const res = await axios.put(`/admin/withdrawals/${id}/process`, data);
    return res.data;
  },
};

// ============================================
// Seller API
// ============================================
export const sellerApi = {
  getDashboard: async () => {
    const res = await axios.get<ApiResponse<SellerDashboard>>('/seller/dashboard');
    return res.data.data;
  },

  getOrders: async (params?: { per_page?: number; page?: number; status?: string }) => {
    const res = await axios.get<PaginatedResponse<Order>>('/seller/orders', { params });
    return res.data;
  },

  getOrder: async (id: number) => {
    const res = await axios.get<ApiResponse<Order>>(`/seller/orders/${id}`);
    return res.data.data;
  },

  updateOrderStatus: async (id: number, data: { status: string; comment?: string }) => {
    const res = await axios.put(`/seller/orders/${id}/status`, data);
    return res.data;
  },

  updateTracking: async (id: number, data: { tracking_number: string; estimated_delivery?: string }) => {
    const res = await axios.put(`/seller/orders/${id}/tracking`, data);
    return res.data;
  },

  // Shop
  getMyShop: async () => {
    const res = await axios.get<ApiResponse<Shop>>('/seller/shop');
    return res.data.data;
  },

  upsertShop: async (data: FormData) => {
    const res = await axios.post<ApiResponse<Shop>>('/seller/shop', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // Wallet
  getWallet: async () => {
    const res = await axios.get<ApiResponse<Wallet>>('/seller/wallet');
    return res.data.data;
  },

  getWithdrawals: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Withdrawal>>('/seller/withdrawals', { params });
    return res.data;
  },

  requestWithdrawal: async (data: { amount: number; method: string; phone_number: string }) => {
    const res = await axios.post<ApiResponse<Withdrawal>>('/seller/withdrawals', data);
    return res.data;
  },

  // Shipping Zones
  getShippingZones: async () => {
    const res = await axios.get<ApiResponse<ShippingZone[]>>('/seller/shipping-zones');
    return res.data.data;
  },

  createShippingZone: async (data: { name: string; price: number; estimated_days: number; is_active?: boolean }) => {
    const res = await axios.post<ApiResponse<ShippingZone>>('/seller/shipping-zones', data);
    return res.data.data;
  },

  updateShippingZone: async (id: number, data: Partial<ShippingZone>) => {
    const res = await axios.put<ApiResponse<ShippingZone>>(`/seller/shipping-zones/${id}`, data);
    return res.data.data;
  },

  deleteShippingZone: async (id: number) => {
    await axios.delete(`/seller/shipping-zones/${id}`);
  },
};

// ============================================
// Delivery API
// ============================================
export const deliveryApi = {
  getDashboard: async () => {
    const res = await axios.get<ApiResponse<{
      assigned_orders: number;
      delivered_orders: number;
      in_progress_orders: number;
      total_deliveries: number;
      recent_orders: Order[];
    }>>('/delivery/dashboard');
    return res.data.data;
  },

  getOrders: async (params?: { per_page?: number; page?: number; status?: string }) => {
    const res = await axios.get<PaginatedResponse<Order>>('/delivery/orders', { params });
    return res.data;
  },

  updateOrderStatus: async (id: number, data: { status: string; comment?: string }) => {
    const res = await axios.put(`/delivery/orders/${id}/status`, data);
    return res.data;
  },

  getHistory: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Order>>('/delivery/history', { params });
    return res.data;
  },
};

// ============================================
// Shop API (public)
// ============================================
export const shopApi = {
  getBySlug: async (slug: string) => {
    const res = await axios.get<ApiResponse<Shop & { products: Product[] }>>(`/shops/${slug}`);
    return res.data.data;
  },
};

// ============================================
// Disputes API (buyer)
// ============================================
export const disputeApi = {
  getAll: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Dispute>>('/disputes', { params });
    return res.data;
  },

  create: async (data: { order_id: number; subject: string; description: string }) => {
    const res = await axios.post<ApiResponse<Dispute>>('/disputes', data);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<Dispute>>(`/disputes/${id}`);
    return res.data.data;
  },

  addMessage: async (disputeId: number, message: string) => {
    const res = await axios.post(`/disputes/${disputeId}/messages`, { message });
    return res.data;
  },
};

// ============================================
// Conversations API
// ============================================
export const conversationApi = {
  getAll: async (params?: { per_page?: number; page?: number }) => {
    const res = await axios.get<PaginatedResponse<Conversation>>('/conversations', { params });
    return res.data;
  },

  create: async (data: { seller_id: number; product_id?: number }) => {
    const res = await axios.post<ApiResponse<Conversation>>('/conversations', data);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axios.get<ApiResponse<Conversation & { messages: Message[] }>>(`/conversations/${id}`);
    return res.data.data;
  },

  sendMessage: async (conversationId: number, content: string) => {
    const res = await axios.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, { content });
    return res.data;
  },
};
