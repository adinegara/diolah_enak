export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          phone: string | null
          address: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          phone?: string | null
          address?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          phone?: string | null
          address?: string | null
        }
        Relationships: []
      }
      product: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string | null
          price: number | null
          customer_price: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description?: string | null
          price?: number | null
          customer_price?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string | null
          price?: number | null
          customer_price?: number | null
        }
        Relationships: []
      }
      transaction: {
        Row: {
          id: number
          created_at: string
          order_qty: number | null
          return_qty: number | null
          date: string | null
          zone_id: string | null
          product_id: number | null
          status: string | null
          created_by: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          order_qty?: number | null
          return_qty?: number | null
          date?: string | null
          zone_id?: string | null
          product_id?: number | null
          status?: string | null
          created_by?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          order_qty?: number | null
          return_qty?: number | null
          date?: string | null
          zone_id?: string | null
          product_id?: number | null
          status?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Customer = Database['public']['Tables']['customer']['Row']
export type Product = Database['public']['Tables']['product']['Row']
export type Transaction = Database['public']['Tables']['transaction']['Row']

export type CustomerInsert = Database['public']['Tables']['customer']['Insert']
export type ProductInsert = Database['public']['Tables']['product']['Insert']
export type TransactionInsert = Database['public']['Tables']['transaction']['Insert']

// User profile type from public.profiles table
export type UserProfile = Database['public']['Tables']['profiles']['Row']

// Transaction with joined data
export type TransactionWithDetails = Transaction & {
  customer: Customer | null
  product: Product | null
  creator: UserProfile | null
}
