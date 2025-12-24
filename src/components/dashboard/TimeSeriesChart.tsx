import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  date: string;
  value: number;
  secondaryValue?: number;
}

interface TimeSeriesChartProps {
  title: string;
  data: DataPoint[];
  isLoading?: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showBar?: boolean;
  formatValue?: (value: number) => string;
}

const TimeSeriesChart = ({
  title,
  data,
  isLoading = false,
  primaryLabel,
  secondaryLabel,
  primaryColor = 'hsl(173, 80%, 45%)',
  secondaryColor = 'hsl(199, 89%, 55%)',
  showBar = false,
  formatValue = (v) => v.toLocaleString(),
}: TimeSeriesChartProps) => {
  const chartRef = useRef<ChartJS>(null);

  const chartData: ChartData<'line' | 'bar'> = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        type: 'line' as const,
        label: primaryLabel,
        data: data.map((d) => d.value),
        borderColor: primaryColor,
        backgroundColor: primaryColor.replace(')', ', 0.1)').replace('hsl', 'hsla'),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: primaryColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      ...(secondaryLabel && showBar
        ? [
            {
              type: 'bar' as const,
              label: secondaryLabel,
              data: data.map((d) => d.secondaryValue || 0),
              backgroundColor: secondaryColor.replace(')', ', 0.6)').replace('hsl', 'hsla'),
              borderColor: secondaryColor,
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.6,
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: 'hsl(215, 20%, 60%)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'hsl(222, 47%, 11%)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(215, 20%, 70%)',
        borderColor: 'hsl(220, 30%, 20%)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Space Grotesk', sans-serif",
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = formatValue(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'hsl(215, 20%, 50%)',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        position: 'left',
        grid: {
          color: 'hsl(220, 30%, 15%)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'hsl(215, 20%, 50%)',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          callback: (value) => formatValue(Number(value)),
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card transition-all duration-300 hover:border-primary/20 hover:glow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold font-display text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Chart ref={chartRef} type="line" data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;
