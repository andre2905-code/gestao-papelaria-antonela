export interface Category {
  id: number;
  name: string;
  products_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Deposit {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type CategoryFormData = {
  name: string;
  is_active?: boolean;
};