import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useMetrics } from './useMetrics';

export const useDashboardStats = () => {
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useMetrics();

  const stats = useMemo(() => {
    if (!transactions || !metrics) {
      return {
        totalSales: 0,
        transactionCount: 0,
        avgGrossMargin: 0,
        topRegion: 'N/A',
      };
    }

    // Calculate total sales from transactions
    const totalSales = transactions.reduce((sum, t) => sum + (t.sales_amount || 0), 0);

    // Transaction count
    const transactionCount = transactions.length;

    // Calculate average gross margin from metrics
    const grossMarginMetrics = metrics.filter(m => m.gross_margin !== null && m.gross_margin !== undefined);
    const avgGrossMargin = grossMarginMetrics.length > 0
      ? grossMarginMetrics.reduce((sum, m) => sum + (m.gross_margin || 0), 0) / grossMarginMetrics.length
      : 0;

    // Find top performing region by sales
    const salesByRegion = transactions.reduce((acc, t) => {
      const region = t.region || 'Unknown';
      acc[region] = (acc[region] || 0) + (t.sales_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const topRegion = Object.entries(salesByRegion).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalSales,
      transactionCount,
      avgGrossMargin,
      topRegion,
    };
  }, [transactions, metrics]);

  const refetch = () => {
    refetchTransactions();
    refetchMetrics();
  };

  return {
    stats,
    isLoading: transactionsLoading || metricsLoading,
    refetch,
  };
};
