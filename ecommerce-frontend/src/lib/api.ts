import axios from './axios';

// Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  category_id?: number;
  seller_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Products API
export const productsApi = {
  getAll: async (params?: { search?: string; category_id?: number }): Promise<Product[]> => {
    const { data } = await axios.get('/products', { params });
    return data.data || data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await axios.get(`/products/${id}`);
    return data.data || data;
  },

  create: async (product: FormData): Promise<Product> => {
    const { data } = await axios.post('/products', product, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data || data;
  },

  update: async (id: number, product: FormData): Promise<Product> => {
    const { data } = await axios.post(`/products/${id}`, product, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data || data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/products/${id}`);
  },

  getMyProducts: async (): Promise<Product[]> => {
    const { data } = await axios.get('/seller/products');
    return data.data || data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await axios.get('/categories');
    return data.data || data;
  },
};

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await axios.get('/orders');
    return data.data || data;
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await axios.get(`/orders/${id}`);
    return data.data || data;
  },

  create: async (items: { product_id: number; quantity: number }[]): Promise<Order> => {
    const { data } = await axios.post('/orders', { items });
    return data.data || data;
  },

  cancel: async (id: number): Promise<void> => {
    await axios.put(`/orders/${id}/cancel`);
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await axios.post('/login', { email, password });
    return data;
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const { data } = await axios.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    return data;
  },

  logout: async () => {
    await axios.post('/logout');
  },

  getProfile: async (): Promise<User> => {
    const { data } = await axios.get('/user');
    return data.data || data;
  },
};
