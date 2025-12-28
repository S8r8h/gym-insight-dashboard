import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, TrendingUp, AlertTriangle, Target, Users, DollarSign } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMetrics } from '@/hooks/useMetrics';

interface InsightResult {
  query: string;
  response: string;
  timestamp: Date;
}

const commonQueries = [
  { label: "Revenue Trends", query: "What are the key revenue trends over the past period and what's driving them?", icon: TrendingUp },
  { label: "Risk Analysis", query: "Identify potential risks or anomalies in the current transaction data.", icon: AlertTriangle },
  { label: "Growth Opportunities", query: "What growth opportunities can you identify from the sales patterns?", icon: Target },
  { label: "Customer Insights", query: "Analyze customer purchasing behavior and identify top-performing segments.", icon: Users },
  { label: "Margin Analysis", query: "Evaluate gross margins across categories and suggest optimization strategies.", icon: DollarSign },
];

export const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightResult[]>([]);
  const { data: transactions } = useTransactions();
  const { data: metrics } = useMetrics();

  const generateInsight = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    
    setIsLoading(true);
    
    // Prepare context from actual data
    const transactionSummary = transactions?.slice(0, 50).map(t => ({
      date: t.date,
      product: t.product_name,
      category: t.category,
      region: t.region,
      amount: t.sales_amount,
      quantity: t.sales_quantity
    }));
    
    const metricsSummary = metrics?.slice(0, 20).map(m => ({
      date: m.date,
      metric: m.metric_name,
      category: m.category,
      value: m.value,
      grossMargin: m.gross_margin
    }));

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
            totalTransactions: transactions?.length || 0,
            totalMetrics: metrics?.length || 0
          }
        }),
      });

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
      setInsights(prev => [{
        query: userQuery,
        response: "Unable to generate insights at this time. Please try again later.",
        timestamp: new Date()
      }, ...prev]);
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Reasoning Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Common Queries */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick insights:</p>
          <div className="flex flex-wrap gap-2">
            {commonQueries.map((q, idx) => (
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
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Get AI Insight
              </>
            )}
          </Button>
        </form>

        {/* Insights Results */}
        {insights.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {insights.map((insight, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Query
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {insight.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm font-medium">{insight.query}</p>
                <div className="pt-2 border-t">
                  <Badge variant="outline" className="text-xs mb-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Response
                  </Badge>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {insight.response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
