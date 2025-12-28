import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction, Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

// Cast supabase client to use our custom database types
const typedSupabase = supabase as unknown as SupabaseClient<Database>;

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await typedSupabase
        .from('Transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useTransactionsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['transactions', 'category', category],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await typedSupabase
        .from('Transactions')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by category:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useTransactionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['transactions', 'dateRange', startDate, endDate],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await typedSupabase
        .from('Transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by date range:', error);
        throw error;
      }

      return data || [];
    },
  });
};
