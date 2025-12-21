import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction } from '@/types/database';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useTransactionsByStatus = (status: string) => {
  return useQuery({
    queryKey: ['transactions', 'status', status],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .eq('status', status)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by status:', error);
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
      const { data, error } = await supabase
        .from('Transactions')
        .select('*')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by date range:', error);
        throw error;
      }

      return data || [];
    },
  });
};
