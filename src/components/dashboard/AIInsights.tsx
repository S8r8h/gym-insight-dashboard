import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign,
  Clock,
  Activity,
  Brain,
  X
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMetrics } from '@/hooks/useMetrics';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { toast } from '@/hooks/use-toast';

interface InsightResult {
  query: string;
  response: string;
  timestamp: Date;
}

const commonQueries = [
  { label: "Peak Hours", query: "Analyze the transaction data to identify peak business hours and days. What patterns do you see in when customers are most active?", icon: Clock },
  { label: "Retention Predictions", query: "Based on customer purchasing patterns, predict member retention trends. Which customer segments are at risk of churn?", icon: Users },
  { label: "Activity Recommendations", query: "What actionable recommendations can you provide to improve business performance based on current activity patterns?", icon: Activity },
  { label: "Revenue Trends", query: "What are the key revenue trends over the past period and what's driving them?", icon: TrendingUp },
  { label: "Risk Analysis", query: "Identify potential risks or anomalies in the current transaction data.", icon: AlertTriangle },
  { label: "Growth Opportunities", query: "What growth opportunities can you identify from the sales patterns?", icon: Target },
  { label: "Margin Analysis", query: "Evaluate gross margins across categories and suggest optimization strategies.", icon: DollarSign },
];

export const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightResult[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: transactions } = useTransactions();
  const { data: metrics } = useMetrics();
  const { stats } = useDashboardStats();

  const generateInsight = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    
    setIsLoading(true);
    setIsDrawerOpen(true);
    
    // Prepare context from actual data including KPIs
    const transactionSummary = transactions?.slice(0, 50).map(t => ({
      date: t.date,
      product: t.product_name,
      category: t.category,
      region: t.region,
      amount: t.sales_amount,
      quantity: t.sales_quantity,
      customer: t.customer_name
    }));
    
    const metricsSummary = metrics?.slice(0, 20).map(m => ({
      date: m.date,
      metric: m.metric_name,
      category: m.category,
      value: m.value,
      grossMargin: m.gross_margin
    }));

    // Add KPI summary
    const kpiSummary = {
      totalSales: stats.totalSales,
      transactionCount: stats.transactionCount,
      avgGrossMargin: stats.avgGrossMargin,
      topRegion: stats.topRegion
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          query: userQuery,
          context: {
            transactions: transactionSummary,
            metrics: metricsSummary,
            kpis: kpiSummary,
            totalTransactions: transactions?.length || 0,
            totalMetrics: metrics?.length || 0
          }
        }),
      });

      if (response.status === 429) {
        toast({
          title: "Rate Limited",
          description: "Too many requests. Please try again in a moment.",
          variant: "destructive"
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: "AI Credits Depleted",
          description: "Please add credits to continue using AI insights.",
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to get AI insights');
      }

      const data = await response.json();
      
      setInsights(prev => [{
        query: userQuery,
        response: data.insight,
        timestamp: new Date()
      }, ...prev]);
      
      setQuery('');
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "Error",
        description: "Unable to generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateInsight(query);
  };

  const handleCommonQuery = (queryText: string) => {
    setQuery(queryText);
    generateInsight(queryText);
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Reasoning Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common Queries */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick insights:</p>
            <div className="flex flex-wrap gap-2">
              {commonQueries.slice(0, 4).map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCommonQuery(q.query)}
                  disabled={isLoading}
                  className="text-xs h-8 gap-1.5"
                >
                  <q.icon className="h-3.5 w-3.5" />
                  {q.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Query Input */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Ask a reasoning question about your data... (e.g., 'Why did sales drop in the North region last week?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with AI Reasoning...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Insight
                </>
              )}
            </Button>
          </form>

          {/* Show recent insight preview */}
          {insights.length > 0 && (
            <div 
              className="rounded-lg border bg-card/50 p-4 cursor-pointer hover:bg-card/80 transition-colors"
              onClick={() => setIsDrawerOpen(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Latest Insight
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {insights[0].timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {insights[0].response.slice(0, 150)}...
              </p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs">
                View all insights →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-out Drawer for Full Insights */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <DrawerTitle>AI Reasoning Insights</DrawerTitle>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              Deep analysis of your dashboard data using AI reasoning
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="flex-1 p-4 max-h-[60vh]">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    AI is reasoning through your data...
                  </p>
                </div>
              </div>
            )}
            
            {insights.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No insights yet. Ask a question to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {insights.map((insight, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          Query
                        </Badge>
                        <p className="text-sm font-medium">{insight.query}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {insight.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t space-y-3">
                      <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Reasoning Response
                      </Badge>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                            p: ({ children }) => <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mb-2">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{children}</code>,
                          }}
                        >
                          {insight.response}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DrawerFooter className="border-t">
            <div className="flex flex-wrap gap-2">
              {commonQueries.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCommonQuery(q.query)}
                  disabled={isLoading}
                  className="text-xs h-7 gap-1"
                >
                  <q.icon className="h-3 w-3" />
                  {q.label}
                </Button>
              ))}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
