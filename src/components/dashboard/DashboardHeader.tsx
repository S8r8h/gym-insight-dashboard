import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const DashboardHeader = ({ title, subtitle, onRefresh, onExport, isLoading }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9" />
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
