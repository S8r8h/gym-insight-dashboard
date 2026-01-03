import { useState } from 'react';
import { DollarSign, Hash, Percent, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICard from '@/components/dashboard/KPICard';
import { KPIDrilldown, DrilldownType } from '@/components/dashboard/KPIDrilldown';
import DashboardFilters, { FilterState } from '@/components/dashboard/DashboardFilters';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useFilteredChartData } from '@/hooks/useFilteredChartData';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { toast } from '@/hooks/use-toast';
import type { Transaction } from '@/types/database';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const KPISkeletons = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const Index = () => {
  const { stats, isLoading, refetch } = useDashboardStats();
  const { data: transactions } = useTransactions();
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    region: 'all',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { dailyData, isLoading: isChartLoading } = useFilteredChartData(filters);
  
  // Drilldown state
  const [drilldownType, setDrilldownType] = useState<DrilldownType>(null);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownValue, setDrilldownValue] = useState('');

  const openDrilldown = (type: DrilldownType, title: string, value: string) => {
    setDrilldownType(type);
    setDrilldownTitle(title);
    setDrilldownValue(value);
  };

  const closeDrilldown = () => {
    setDrilldownType(null);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (selectedTransaction?.transaction_id === transaction.transaction_id) {
      setSelectedTransaction(null);
      setFilters({ dateRange: undefined, region: 'all' });
    } else {
      setSelectedTransaction(transaction);
      setFilters({
        ...filters,
        region: transaction.region.toLowerCase(),
      });
    }
  };

  const clearTransactionFilter = () => {
    setSelectedTransaction(null);
    setFilters({ dateRange: filters.dateRange, region: 'all' });
  };

  const handleExport = () => {
    // Export daily trends data
    if (dailyData.length > 0) {
      exportToCsv(
        {
          headers: ['Date', 'Visitors', 'Customers', 'Revenue'],
          rows: dailyData.map((d) => [d.date, d.visitors, d.customers, d.revenue]),
        },
        `dashboard-trends-${new Date().toISOString().split('T')[0]}`
      );
    }

    // Export transactions data
    if (transactions && transactions.length > 0) {
      const filteredTransactions = filters.region !== 'all'
        ? transactions.filter((t) => t.region.toLowerCase() === filters.region)
        : transactions;

      exportToCsv(
        {
          headers: ['Customer', 'Product', 'Quantity', 'Rate', 'Amount', 'Date', 'Region'],
          rows: filteredTransactions.map((t) => [
            t.customer_name,
            t.product_name,
            t.sales_quantity,
            t.sales_rate,
            t.sales_amount,
            t.recorded_at,
            t.region,
          ]),
        },
        `transactions-${new Date().toISOString().split('T')[0]}`
      );
    }

    toast({
      title: 'Export Complete',
      description: 'Your data has been exported to CSV files.',
    });
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Overview of your business metrics"
        onRefresh={refetch}
        onExport={handleExport}
        isLoading={isLoading}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* KPI Cards */}
          <section>
            <h2 className="mb-6 text-lg font-semibold font-display text-foreground">
              Key Performance Indicators
            </h2>
            
            {isLoading ? (
              <KPISkeletons />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  title="Total Sales"
                  value={formatCurrency(stats.totalSales)}
                  icon={<DollarSign className="h-6 w-6" />}
                  trend={{ value: 12.5, isPositive: true }}
                  delay={0}
                  onClick={() => openDrilldown('sales', 'Total Sales', formatCurrency(stats.totalSales))}
                />
                <KPICard
                  title="Transactions"
                  value={formatNumber(stats.transactionCount)}
                  icon={<Hash className="h-6 w-6" />}
                  trend={{ value: 8.2, isPositive: true }}
                  delay={100}
                  onClick={() => openDrilldown('transactions', 'Transactions', formatNumber(stats.transactionCount))}
                />
                <KPICard
                  title="Avg Gross Margin"
                  value={formatPercent(stats.avgGrossMargin)}
                  icon={<Percent className="h-6 w-6" />}
                  trend={{ value: 2.1, isPositive: true }}
                  delay={200}
                  onClick={() => openDrilldown('margin', 'Avg Gross Margin', formatPercent(stats.avgGrossMargin))}
                />
                <KPICard
                  title="Top Region"
                  value={stats.topRegion}
                  icon={<MapPin className="h-6 w-6" />}
                  subtitle="Highest sales volume"
                  delay={300}
                  onClick={() => openDrilldown('region', 'Top Region', stats.topRegion)}
                />
              </div>
            )}
          </section>

          {/* Filters Section */}
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <DashboardFilters filters={filters} onFiltersChange={setFilters} />
              {selectedTransaction && (
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="outline" className="gap-2 py-1.5 px-3">
                    Filtered by: {selectedTransaction.customer_name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTransactionFilter}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Time Series Charts */}
          <section>
            <h2 className="mb-6 text-lg font-semibold font-display text-foreground">
              Trends Over Time
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <TimeSeriesChart
                title="Visitors by Day"
                data={dailyData.map((d) => ({ date: d.date, value: d.visitors }))}
                isLoading={isChartLoading}
                primaryLabel="Visitors"
                primaryColor="hsl(173, 80%, 45%)"
                formatValue={formatNumber}
              />
              <TimeSeriesChart
                title="Customers by Day"
                data={dailyData.map((d) => ({ date: d.date, value: d.customers }))}
                isLoading={isChartLoading}
                primaryLabel="Unique Customers"
                primaryColor="hsl(199, 89%, 55%)"
                formatValue={formatNumber}
              />
              <TimeSeriesChart
                title="Revenue by Day"
                data={dailyData.map((d) => ({ date: d.date, value: d.revenue }))}
                isLoading={isChartLoading}
                primaryLabel="Revenue"
                primaryColor="hsl(142, 70%, 45%)"
                formatValue={formatCurrency}
              />
            </div>
          </section>

          {/* AI Insights Section */}
          <section>
            <h2 className="mb-6 text-lg font-semibold font-display text-foreground">
              AI Reasoning Insights
            </h2>
            <AIInsights />
          </section>

          {/* Transactions Table */}
          <section>
            <h2 className="mb-6 text-lg font-semibold font-display text-foreground">
              Transactions
            </h2>
            <TransactionsTable
              onRowClick={handleTransactionClick}
              selectedTransactionId={selectedTransaction?.transaction_id}
            />
          </section>
        </div>
      </div>
      {/* KPI Drilldown Drawer */}
      <KPIDrilldown
        isOpen={drilldownType !== null}
        onClose={closeDrilldown}
        type={drilldownType}
        title={drilldownTitle}
        value={drilldownValue}
      />
    </DashboardLayout>
  );
};

export default Index;
