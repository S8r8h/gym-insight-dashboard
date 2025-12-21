import { DollarSign, Hash, Percent, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICard from '@/components/dashboard/KPICard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Overview of your business metrics"
        onRefresh={refetch}
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
                />
                <KPICard
                  title="Transactions"
                  value={formatNumber(stats.transactionCount)}
                  icon={<Hash className="h-6 w-6" />}
                  trend={{ value: 8.2, isPositive: true }}
                  delay={100}
                />
                <KPICard
                  title="Avg Gross Margin"
                  value={formatPercent(stats.avgGrossMargin)}
                  icon={<Percent className="h-6 w-6" />}
                  trend={{ value: 2.1, isPositive: true }}
                  delay={200}
                />
                <KPICard
                  title="Top Region"
                  value={stats.topRegion}
                  icon={<MapPin className="h-6 w-6" />}
                  subtitle="Highest sales volume"
                  delay={300}
                />
              </div>
            )}
          </section>

          {/* Placeholder for Charts */}
          <section>
            <h2 className="mb-6 text-lg font-semibold font-display text-foreground">
              Charts & Analytics
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Sales Trends Chart</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Category Distribution Chart</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
