export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Metrics: {
        Row: {
          id: string;
          name: string;
          value: number;
          category: string | null;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          value: number;
          category?: string | null;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          value?: number;
          category?: string | null;
          recorded_at?: string;
          created_at?: string;
        };
      };
      Transactions: {
        Row: {
          id: string;
          amount: number;
          type: string;
          description: string | null;
          member_id: string | null;
          status: string;
          transaction_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          type: string;
          description?: string | null;
          member_id?: string | null;
          status?: string;
          transaction_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          type?: string;
          description?: string | null;
          member_id?: string | null;
          status?: string;
          transaction_date?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Helper types for easier usage
export type Metric = Database['public']['Tables']['Metrics']['Row'];
export type Transaction = Database['public']['Tables']['Transactions']['Row'];
