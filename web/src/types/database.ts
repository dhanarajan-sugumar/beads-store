/**
 * Database type definitions for beads-store.
 * Matches Supabase 0001_init.sql and 0002_add_sku_and_category.sql schema.
 * Note: Must use type aliases rather than interfaces so TypeScript can satisfy
 * PostgREST GenericSchema / Record<string, unknown> index signature checks.
 */

export type ProductCategory = 'necklace' | 'bracelet' | 'other';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  image_url: string | null;
  images?: string[];
  active: boolean;
  sort_order: number;
  category: ProductCategory;
  sku: string | null;
  created_at: string;
  updated_at: string;
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
