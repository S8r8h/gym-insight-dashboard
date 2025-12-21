import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Metric } from '@/types/database';

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: async (): Promise<Metric[]> => {
      const { data, error } = await supabase
        .from('Metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useMetricsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['metrics', 'category', category],
    queryFn: async (): Promise<Metric[]> => {
      const { data, error } = await supabase
        .from('Metrics')
        .select('*')
        .eq('category', category)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics by category:', error);
        throw error;
      }

      return data || [];
    },
  });
};
