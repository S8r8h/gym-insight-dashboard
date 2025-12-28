import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Metric, Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

// Cast supabase client to use our custom database types
const typedSupabase = supabase as unknown as SupabaseClient<Database>;

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: async (): Promise<Metric[]> => {
      const { data, error } = await typedSupabase
        .from('Metrics')
        .select('*')
        .order('recorder_at', { ascending: false });

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
      const { data, error } = await typedSupabase
        .from('Metrics')
        .select('*')
        .eq('category', category)
        .order('recorder_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics by category:', error);
        throw error;
      }

      return data || [];
    },
  });
};
