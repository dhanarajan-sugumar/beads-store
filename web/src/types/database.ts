/**
 * Database type definitions for beads-store.
 * Matches Supabase 0001_init.sql schema.
 */

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  user_id: string;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: AdminUser;
        Update: Partial<AdminUser>;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
