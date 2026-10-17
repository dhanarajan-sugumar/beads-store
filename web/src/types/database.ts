/**
 * Database type definitions for beads-store.
 * Matches Supabase 0001_init.sql and 0002_add_sku_and_category.sql schema.
 * Note: Must use type aliases rather than interfaces so TypeScript can satisfy
 * PostgREST GenericSchema / Record<string, unknown> index signature checks.
 */

export type ProductCategory = 'necklace' | 'bracelet' | 'other';
export type StockStatus = 'in_stock' | 'made_to_order' | 'out_of_stock';
export type OrderStatus = 'new' | 'contacted' | 'paid' | 'shipped' | 'cancelled';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  image_url: string | null;
  images?: string[];
  active: boolean;
  stock_status?: StockStatus;
  sort_order: number;
  category: ProductCategory;
  sku: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};

export type AdminUser = {
  user_id: string;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_inr: number;
          image_url?: string | null;
          images?: string[];
          active?: boolean;
          stock_status?: StockStatus;
          sort_order?: number;
          category?: ProductCategory;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_inr?: number;
          image_url?: string | null;
          images?: string[];
          active?: boolean;
          stock_status?: StockStatus;
          sort_order?: number;
          category?: ProductCategory;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: {
          user_id: string;
        };
        Update: {
          user_id?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          order_ref: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string;
          total_amount: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_ref?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string;
          total_amount?: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_title: string;
          product_sku?: string | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_title?: string;
          product_sku?: string | null;
          unit_price?: number;
          quantity?: number;
          subtotal?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
