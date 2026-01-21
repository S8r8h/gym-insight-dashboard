# Product Requirements Document (PRD)
## Business Analytics Dashboard

**Version:** 1.0  
**Last Updated:** January 21, 2026  
**Status:** Active Development

---

## 1. Executive Summary

The Business Analytics Dashboard is a modern, interactive web application designed to provide real-time insights into business performance metrics. It combines traditional KPI visualization with AI-powered analysis to help decision-makers understand trends, identify opportunities, and mitigate risks.

---

## 2. Product Overview

### 2.1 Vision
Empower businesses with actionable insights through an intuitive, AI-enhanced analytics platform that transforms raw transaction data into strategic intelligence.

### 2.2 Target Users
- Business Analysts
- Operations Managers
- Executive Leadership
- Sales Teams

### 2.3 Core Value Proposition
- **Real-time Metrics:** Live dashboard with key performance indicators
- **AI-Powered Insights:** Intelligent analysis using advanced reasoning models
- **Flexible Filtering:** Date range and region-based data exploration
- **Export Capabilities:** CSV export for external analysis

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | TanStack Query (React Query) |
| Charts | Recharts |
| Backend | Lovable Cloud (Supabase) |
| AI Integration | Lovable AI Gateway |
| Routing | React Router v6 |

### 3.2 Project Structure

```
src/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   │   ├── AIInsights.tsx
│   │   ├── DashboardFilters.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── KPICard.tsx
│   │   ├── KPIDrilldown.tsx
│   │   ├── TimeSeriesChart.tsx
│   │   └── TransactionsTable.tsx
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
│   ├── useDashboardStats.ts
│   ├── useFilteredChartData.ts
│   ├── useMetrics.ts
│   └── useTransactions.ts
├── integrations/        # External service integrations
├── pages/               # Route components
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

---

## 4. Features

### 4.1 Dashboard Overview (Implemented ✅)

#### 4.1.1 KPI Cards
Four key performance indicators displayed as interactive cards:

| KPI | Description | Data Source |
|-----|-------------|-------------|
| Total Sales | Sum of all transaction amounts | `Transactions.sales_amount` |
| Transactions | Count of all transactions | `Transactions` count |
| Avg Gross Margin | Average margin percentage | `Metrics.gross_margin` |
| Top Region | Region with highest sales | Aggregated from `Transactions` |

**Features:**
- Skeleton loading states during data fetch
- Trend indicators showing percentage change
- Click-to-drill-down functionality
- Animated entrance effects

#### 4.1.2 KPI Drilldown (Implemented ✅)
Slide-out drawer providing detailed breakdowns when clicking KPI cards:

- **Sales Drilldown:** Breakdown by product category with progress bars
- **Transactions Drilldown:** Distribution by transaction type
- **Margin Drilldown:** Margin analysis by business segment
- **Region Drilldown:** Regional performance comparison

### 4.2 Data Visualization (Implemented ✅)

#### 4.2.1 Time Series Charts
Three trend charts displayed in a responsive grid:

| Chart | Metric | Color |
|-------|--------|-------|
| Visitors by Day | Daily visitor count | Teal (#14b8a6) |
| Customers by Day | Unique customers | Blue (#3b82f6) |
| Revenue by Day | Daily revenue | Green (#22c55e) |

**Features:**
- Responsive Recharts implementation
- Tooltip on hover with formatted values
- Loading skeleton states
- Filter-aware data updates

### 4.3 Filtering System (Implemented ✅)

#### 4.3.1 Date Range Filter
- Calendar-based date picker with range selection
- Preset options: Last 7 days, Last 30 days, Last 90 days, Year to Date
- Visual feedback with active filter badges

#### 4.3.2 Region Filter
- Dropdown selector with regions: North, South, East, West
- "All Regions" default option
- Filter state syncs with charts and tables

#### 4.3.3 Transaction-Based Filtering
- Click table row to filter by that transaction's region
- Visual indicator showing active transaction filter
- One-click clear filter functionality

### 4.4 AI Insights Panel (Implemented ✅)

#### 4.4.1 Overview
AI-powered analysis using Lovable AI Gateway with reasoning capabilities.

#### 4.4.2 Common Queries
Pre-defined insight categories:

| Query | Icon | Purpose |
|-------|------|---------|
| Revenue Trends | TrendingUp | Analyze sales patterns |
| Risk Analysis | AlertTriangle | Identify potential issues |
| Growth Opportunities | Target | Find expansion areas |
| Customer Insights | Users | Understand customer behavior |
| Margin Analysis | PieChart | Profitability analysis |
| Peak Hours | Clock | Optimal business timing |
| Retention Predictions | UserCheck | Customer retention forecast |
| Activity Recommendations | Lightbulb | Actionable suggestions |

#### 4.4.3 Custom Queries
- Free-text input for custom analysis requests
- Context-aware responses using current dashboard data
- Markdown-formatted responses with syntax highlighting

#### 4.4.4 Technical Implementation
- Edge function: `supabase/functions/ai-insights/`
- Model: OpenAI o3 via Lovable AI Gateway
- Rate limiting with graceful error handling
- Insight history maintained in session

### 4.5 Transactions Table (Implemented ✅)

#### 4.5.1 Features
- Sortable columns (click headers to sort)
- Search by customer or product name
- Pagination (10 items per page)
- Row click to filter dashboard
- Visual highlighting of selected row

#### 4.5.2 Columns
| Column | Type | Sortable |
|--------|------|----------|
| Customer | String | Yes |
| Product | String | Yes |
| Qty | Number | Yes |
| Rate | Currency | Yes |
| Amount | Currency | Yes |
| Date | DateTime | Yes |
| Region | String | Yes |

### 4.6 Export Functionality (Implemented ✅)

#### 4.6.1 CSV Export
- Export daily trends data (date, visitors, customers, revenue)
- Export transactions data (all columns)
- Respects current filter state
- Toast notification on completion

---

## 5. Database Schema

### 5.1 Tables

#### Transactions
```sql
CREATE TABLE Transactions (
  transaction_id UUID PRIMARY KEY,
  date DATE,
  customer_name TEXT,
  product_name TEXT,
  sales_quantity INTEGER,
  sales_rate DECIMAL,
  sales_amount DECIMAL,
  recorded_at TIMESTAMP,
  region TEXT
);
```

#### Metrics
```sql
CREATE TABLE Metrics (
  Id UUID PRIMARY KEY,
  date DATE,
  region TEXT,
  metric_name TEXT,
  value DECIMAL,
  gross_margin DECIMAL
);
```

---

## 6. User Interface

### 6.1 Layout
- **Sidebar:** Collapsible navigation with main links
- **Header:** Title, refresh button, export button
- **Main Content:** Scrollable area with dashboard sections

### 6.2 Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Grid layouts adapt from 1 to 4 columns
- Drawer components for mobile-friendly interactions

### 6.3 Design System
- shadcn/ui component library
- CSS custom properties for theming
- Dark/light mode support via `next-themes`
- Semantic color tokens (primary, secondary, muted, accent)

---

## 7. Performance Considerations

### 7.1 Data Fetching
- TanStack Query for caching and background updates
- Stale time: 5 minutes for dashboard stats
- Refetch on window focus disabled for stability

### 7.2 Rendering Optimization
- Skeleton loaders for perceived performance
- Memoized calculations with `useMemo`
- Lazy loading for heavy components

---

## 8. Future Roadmap

### 8.1 Planned Features
- [ ] Real-time data updates via Supabase Realtime
- [ ] Email/Slack notifications for anomalies
- [ ] Comparison view (week-over-week, month-over-month)
- [ ] Custom dashboard layouts
- [ ] User authentication and role-based access
- [ ] Saved filter presets
- [ ] Scheduled report generation

### 8.2 Technical Improvements
- [ ] Unit test coverage
- [ ] E2E testing with Playwright
- [ ] Performance monitoring
- [ ] Error boundary implementation
- [ ] Offline support with service workers

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | < 2s | Lighthouse |
| Time to Interactive | < 3s | Web Vitals |
| AI Response Time | < 5s | Edge function logs |
| User Engagement | > 5 min/session | Analytics |

---

## 10. Appendix

### 10.1 Environment Variables
```
VITE_SUPABASE_URL - Backend API URL
VITE_SUPABASE_PUBLISHABLE_KEY - Public API key
VITE_SUPABASE_PROJECT_ID - Project identifier
```

### 10.2 Edge Functions
| Function | Purpose | Endpoint |
|----------|---------|----------|
| ai-insights | AI analysis | `/functions/v1/ai-insights` |

### 10.3 Dependencies
Key production dependencies:
- `@tanstack/react-query` - Server state management
- `recharts` - Chart visualization
- `react-markdown` - Markdown rendering
- `date-fns` - Date manipulation
- `lucide-react` - Icon library
