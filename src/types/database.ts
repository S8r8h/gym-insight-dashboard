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
          Id: string;
          date: string;
          region: string;
          metric_name: string;
          category: string;
          unit: string;
          value: number;
          product_cost: number;
          gross_margin: number;
          recorder_at: string;
        };
        Insert: {
          Id?: string;
          date: string;
          region: string;
          metric_name: string;
          category: string;
          unit: string;
          value: number;
          product_cost: number;
          gross_margin: number;
          recorder_at?: string;
        };
        Update: {
          Id?: string;
          date?: string;
          region?: string;
          metric_name?: string;
          category?: string;
          unit?: string;
          value?: number;
          product_cost?: number;
          gross_margin?: number;
          recorder_at?: string;
        };
      };
      Transactions: {
        Row: {
          transaction_id: string;
          date: string;
          metrics_id: string;
          customer_id: string;
          customer_name: string;
          product_name: string;
          category: string;
          region: string;
          sales_quantity: number;
          sales_rate: number;
          sales_amount: number;
          recorded_at: string;
        };
        Insert: {
          transaction_id?: string;
          date: string;
          metrics_id: string;
          customer_id: string;
          customer_name: string;
          product_name: string;
          category: string;
          region: string;
          sales_quantity: number;
          sales_rate: number;
          sales_amount: number;
          recorded_at?: string;
        };
        Update: {
          transaction_id?: string;
          date?: string;
          metrics_id?: string;
          customer_id?: string;
          customer_name?: string;
          product_name?: string;
          category?: string;
          region?: string;
          sales_quantity?: number;
          sales_rate?: number;
          sales_amount?: number;
          recorded_at?: string;
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
