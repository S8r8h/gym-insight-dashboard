import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { format, parseISO, isWithinInterval } from 'date-fns';
import type { FilterState } from '@/components/dashboard/DashboardFilters';

interface DailyData {
  date: string;
  visitors: number;
  customers: number;
  revenue: number;
}

export const useFilteredChartData = (filters: FilterState) => {
  const { data: transactions, isLoading, error } = useTransactions();

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        dailyData: [],
        totalVisitors: 0,
        totalCustomers: 0,
        totalRevenue: 0,
      };
    }

    // Filter transactions based on filters
    let filteredTransactions = transactions;

    // Apply region filter
    if (filters.region && filters.region !== 'all') {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.region.toLowerCase() === filters.region.toLowerCase()
      );
    }

    // Apply date range filter
    if (filters.dateRange?.from) {
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = parseISO(t.date);
        if (filters.dateRange?.to) {
          return isWithinInterval(transactionDate, {
            start: filters.dateRange.from!,
            end: filters.dateRange.to,
          });
        }
        return transactionDate >= filters.dateRange!.from!;
      });
    }

    // Aggregate by day
    const dailyMap = new Map<string, { visitors: Set<string>; customers: Set<string>; revenue: number }>();

    filteredTransactions.forEach((t) => {
      const dateKey = format(parseISO(t.date), 'MMM d');
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          visitors: new Set(),
          customers: new Set(),
          revenue: 0,
        });
      }

      const day = dailyMap.get(dateKey)!;
      // Use transaction_id as a proxy for visitors (each transaction = unique visit)
      day.visitors.add(t.transaction_id);
      // Use customer_id for unique customers
      day.customers.add(t.customer_id);
      day.revenue += t.sales_amount;
    });

    // Convert to array and sort by date
    const dailyData: DailyData[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        visitors: data.visitors.size,
        customers: data.customers.size,
        revenue: data.revenue,
      }))
      .slice(-30); // Last 30 days for readability

    // Calculate totals
    const totalVisitors = dailyData.reduce((sum, d) => sum + d.visitors, 0);
    const totalCustomers = new Set(filteredTransactions.map((t) => t.customer_id)).size;
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.sales_amount, 0);

    return {
      dailyData,
      totalVisitors,
      totalCustomers,
      totalRevenue,
    };
  }, [transactions, filters]);

  return {
    ...chartData,
    isLoading,
    error,
  };
};
