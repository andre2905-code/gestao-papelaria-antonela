// Resposta padrão das APIs
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]> | null;
}

// 1. Produtos
export interface DepositStock {
  id: number;
  stock: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  promo_price: number | null;
  sku: string | null;
  is_active: boolean;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  deposits: DepositStock[];
  stock_total: number;
  created_at: string;
  updated_at: string;
}

export type ProductFormData = {
  title: string;
  price: number;
  promo_price?: number | null;
  sku?: string | null;
  category_id: number;
  is_active: boolean;
};

// 2. Categorias
export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export type CategoryFormData = {
  name: string;
  is_active?: boolean;
};

// 3. Pedidos
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix';

export interface OrderItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    title: string;
    sku: string | null;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  deposit_id: number;
  deposit: {
    id: number;
    name: string;
  };
}

export interface Order {
  id: number;
  customer_id: number;
  customer: {
    id: number;
    name: string;
    email?: string;
  };
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes: string | null;
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type OrderFormData = {
  customer_id: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes?: string | null;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    deposit_id: number;
  }[];
};

// 4. Depósitos
export interface DepositStockItem {
  product_id: number;
  product: {
    id: number;
    title: string;
    sku: string | null;
  };
  quantity: number;
}

export interface Deposit {
  id: number;
  name: string;
  is_active: boolean;
  stock?: DepositStockItem[];
  created_at: string;
  updated_at: string;
}

export type DepositFormData = {
  name: string;
  is_active?: boolean;
};

// 5. Clientes
export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  is_active: boolean;
  orders_count: number;
  created_at: string;
  updated_at: string;
}

export type CustomerFormData = {
  name: string;
  phone?: string | null;
  cpf?: string | null;
  birth_date?: string | null;
  is_active?: boolean;
};

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}