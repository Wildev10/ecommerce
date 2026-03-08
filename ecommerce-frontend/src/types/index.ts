// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: number;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// User
// ============================================
export type UserRole = 'buyer' | 'seller' | 'admin' | 'delivery';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  avatar_url: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// Category
// ============================================
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  image_url: string | null;
  parent_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
  products_count?: number;
}

// ============================================
// Product
// ============================================
export interface Product {
  id: number;
  seller_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  stock: number;
  image: string | null;
  image_url: string | null;
  gallery: string[] | null;
  gallery_urls: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: User;
  reviews_count?: number;
  reviews_avg_rating?: number;
}

// ============================================
// Cart
// ============================================
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  coupon_id: number | null;
  created_at: string;
  updated_at: string;
  items: CartItem[];
  coupon?: Coupon | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

// ============================================
// Order
// ============================================
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'card' | 'mobile_money' | 'cash_on_delivery' | 'bank_transfer' | 'credit_card' | 'paypal' | 'mtn_momo' | 'moov_money';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'completed';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  transaction_id: string | null;
  shipping_address: string | null;
  billing_address: string | null;
  notes: string | null;
  coupon_id: number | null;
  address_id: number | null;
  delivery_person_id: number | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  items: OrderItem[];
  address?: Address;
  payment?: Payment;
  coupon?: Coupon | null;
  status_history?: OrderStatusHistory[];
  delivery_person?: User;
}

// ============================================
// Payment
// ============================================
export interface Payment {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  method: string;
  amount: number;
  status: PaymentStatus;
  transaction_id: string;
  phone_number?: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
  user?: User;
}

// ============================================
// Review
// ============================================
export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  product?: Product;
  reply?: ReviewReply;
}

// ============================================
// Wishlist
// ============================================
export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

// ============================================
// Coupon
// ============================================
export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  discount: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Search
// ============================================
export interface SearchResults {
  products: Product[];
  categories: Category[];
  query: string;
  counts: {
    products: number;
    categories: number;
  };
}

export interface SearchSuggestions {
  products: Array<{ id: number; name: string; slug: string; price: number; image: string | null }>;
  categories: Array<{ id: number; name: string; slug: string }>;
}

// ============================================
// Address
// ============================================
export interface Address {
  id: number;
  user_id: number;
  label: string | null;
  full_name: string;
  phone: string;
  city: string;
  quarter: string;
  street_address: string;
  landmark: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Order Status History
// ============================================
export interface OrderStatusHistory {
  id: number;
  order_id: number;
  old_status: string;
  new_status: string;
  note: string | null;
  changed_by: User | null;
  created_at: string;
}

// ============================================
// Dashboard Types
// ============================================
export interface AdminDashboard {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  recent_orders: Order[];
  new_users_today: number;
  orders_today: number;
  revenue_by_period: number;
  orders_by_period: number;
  active_sellers: number;
  active_buyers: number;
  top_sellers: Array<{
    seller_id: number;
    seller_name: string;
    total_revenue: number;
    total_orders: number;
  }>;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }>;
  monthly_sales: Array<{ month: number; year: number; revenue: number }>;
  commission: {
    total: number;
    pending: number;
    rate: number;
  };
}

export interface SellerDashboard {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_commission: number;
  net_revenue: number;
  wallet_balance: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }>;
  monthly_sales: Array<{
    month: number;
    year: number;
    revenue: number;
  }>;
}

// ============================================
// Delivery Dashboard Types
// ============================================
export type DeliveryStatus = 'assigned' | 'picked_up' | 'delivering' | 'delivered';

export interface DeliveryDashboard {
  total_deliveries: number;
  completed_deliveries: number;
  in_progress_deliveries: number;
  pending_deliveries: number;
  recent_deliveries: Order[];
}

// ============================================
// Shop
// ============================================
export interface Shop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  logo_url: string | null;
  banner: string | null;
  banner_url: string | null;
  phone: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seller?: User;
  products?: Product[];
}

// ============================================
// Commission
// ============================================
export type CommissionStatus = 'pending' | 'paid' | 'refunded';

export interface Commission {
  id: number;
  order_id: number;
  seller_id: number;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  seller_amount: number;
  status: CommissionStatus;
  created_at: string;
  updated_at: string;
  order?: Order;
  seller?: User;
}

// ============================================
// Dispute
// ============================================
export type DisputeStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface DisputeMessage {
  id: number;
  dispute_id: number;
  user_id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  user?: User;
}

export interface Dispute {
  id: number;
  order_id: number;
  user_id: number;
  subject: string;
  description: string;
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
  user?: User;
  messages?: DisputeMessage[];
}

// ============================================
// Conversation / Messaging
// ============================================
export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read_at: string | null;
  created_at: string;
  sender?: User;
}

export interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  product_id: number | null;
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: User;
  product?: Product;
  last_message?: Message;
  unread_count?: number;
}

// ============================================
// Wallet / Withdrawal
// ============================================
export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

export type WithdrawalStatus = 'pending' | 'completed' | 'rejected';
export type WithdrawalMethod = 'mtn_momo' | 'moov_money';

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  method: WithdrawalMethod;
  phone_number: string;
  status: WithdrawalStatus;
  transaction_id: string | null;
  processed_by: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

// ============================================
// Review Reply
// ============================================
export interface ReviewReply {
  id: number;
  review_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// ============================================
// Shipping Zone
// ============================================
export interface ShippingZone {
  id: number;
  seller_id: number;
  name: string;
  price: number;
  estimated_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
