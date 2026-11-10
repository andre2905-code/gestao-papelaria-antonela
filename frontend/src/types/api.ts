
export interface Category {
  id: number;
  name: string;
  products_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type DepositItem = {
  id: number;
  product_id: number;
  deposit_id: number;
  quantity: number;
  product?: Product;
};

export type Deposit = {
  id: number;
  name: string;
  is_active: boolean;
  items: DepositItem[];
};

export interface ProductDeposit {
  id: number;
  name?: string;
  pivot?: {
    quantity: number;
  };
  quantity?: number;
}

export interface Product {
  id: number;
  title: string;
  price: number | string;
  promo_price: number | string | null;
  sku: string | null;
  category_id: number;
  category?: Category;
  deposits?: ProductDeposit[];
  stock_total?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled';

export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'cash';

export interface OrderItem {
  id: number;
  product_id: number;
  deposit_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  product?: Product;
  deposit?: Deposit;
}

export interface OrderFormItem {
  product_id: number;
  deposit_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderFormData {
  customer_id: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes: string;
  items: OrderFormItem[];
}

export interface Order {
  id: number;
  customer_id: number;
  customer?: Customer;
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes: string | null;
  total: number | string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  is_active: boolean;
  orders_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  is_active?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  email_verified_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface UserRoleOption {
  value: UserRole;
  label: string;
}

export type CategoryFormData = {
  name: string;
  is_active?: boolean;
};
