import { useMemo } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, MapPin, Tag, Calendar } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMetrics } from '@/hooks/useMetrics';

export type DrilldownType = 'sales' | 'transactions' | 'margin' | 'region' | null;

interface KPIDrilldownProps {
  isOpen: boolean;
  onClose: () => void;
  type: DrilldownType;
  title: string;
  value: string;
}

interface BreakdownItem {
  name: string;
  value: number;
  percentage: number;
  trend?: number;
}

export const KPIDrilldown = ({ isOpen, onClose, type, title, value }: KPIDrilldownProps) => {
  const { data: transactions } = useTransactions();
  const { data: metrics } = useMetrics();

  const breakdowns = useMemo(() => {
    if (!transactions || !metrics) return { byCategory: [], byRegion: [], byTime: [] };

    // By Category
    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      if (type === 'sales' || type === 'region') {
        categoryMap.set(t.category, current + t.sales_amount);
      } else if (type === 'transactions') {
        categoryMap.set(t.category, current + 1);
      } else if (type === 'margin') {
        const metricMatch = metrics.find(m => m.category === t.category);
        if (metricMatch) {
          categoryMap.set(t.category, current + (metricMatch.gross_margin || 0));
        }
      }
    });

    const totalCategory = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const byCategory: BreakdownItem[] = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalCategory > 0 ? (value / totalCategory) * 100 : 0,
        trend: Math.random() > 0.5 ? Math.random() * 15 : -Math.random() * 10
      }))
      .sort((a, b) => b.value - a.value);

    // By Region
    const regionMap = new Map<string, number>();
    transactions.forEach(t => {
      const current = regionMap.get(t.region) || 0;
      if (type === 'sales' || type === 'region') {
        regionMap.set(t.region, current + t.sales_amount);
      } else if (type === 'transactions') {
        regionMap.set(t.region, current + 1);
      } else if (type === 'margin') {
        const metricMatch = metrics.find(m => m.region === t.region);
        if (metricMatch) {
          regionMap.set(t.region, current + (metricMatch.gross_margin || 0));
        }
      }
    });

    const totalRegion = Array.from(regionMap.values()).reduce((a, b) => a + b, 0);
    const byRegion: BreakdownItem[] = Array.from(regionMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalRegion > 0 ? (value / totalRegion) * 100 : 0,
        trend: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 15
      }))
      .sort((a, b) => b.value - a.value);

    // By Time Period (last 7 days)
    const timeMap = new Map<string, number>();
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const current = timeMap.get(date) || 0;
      if (type === 'sales' || type === 'region') {
        timeMap.set(date, current + t.sales_amount);
      } else if (type === 'transactions') {
        timeMap.set(date, current + 1);
      } else if (type === 'margin') {
        const metricMatch = metrics.find(m => m.date === t.date);
        if (metricMatch) {
          timeMap.set(date, current + (metricMatch.gross_margin || 0));
        }
      }
    });

    const totalTime = Array.from(timeMap.values()).reduce((a, b) => a + b, 0);
    const byTime: BreakdownItem[] = Array.from(timeMap.entries())
      .slice(0, 7)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalTime > 0 ? (value / totalTime) * 100 : 0,
      }));

    return { byCategory, byRegion, byTime };
  }, [transactions, metrics, type]);

  const formatValue = (val: number) => {
    if (type === 'sales' || type === 'region') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    if (type === 'margin') {
      return `${val.toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  const BreakdownList = ({ items, icon: Icon }: { items: BreakdownItem[], icon: typeof MapPin }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatValue(item.value)}</span>
                {item.trend !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={item.trend >= 0 ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}
                  >
                    {item.trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(item.trend).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={item.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{item.percentage.toFixed(1)}% of total</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">{title} Breakdown</DrawerTitle>
              <DrawerDescription className="flex items-center gap-2 mt-1">
                Current value: <span className="font-semibold text-foreground">{value}</span>
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4">
            <Tabs defaultValue="category" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="category" className="gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  By Category
                </TabsTrigger>
                <TabsTrigger value="region" className="gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  By Region
                </TabsTrigger>
                <TabsTrigger value="time" className="gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  By Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value="category" className="mt-0">
                <BreakdownList items={breakdowns.byCategory} icon={Tag} />
              </TabsContent>

              <TabsContent value="region" className="mt-0">
                <BreakdownList items={breakdowns.byRegion} icon={MapPin} />
              </TabsContent>

              <TabsContent value="time" className="mt-0">
                <BreakdownList items={breakdowns.byTime} icon={Calendar} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
