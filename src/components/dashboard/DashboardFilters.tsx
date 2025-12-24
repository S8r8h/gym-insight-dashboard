import { useState } from 'react';
import { Calendar, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export interface FilterState {
  dateRange: DateRange | undefined;
  region: string;
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const regions = [
  { value: 'all', label: 'All Regions' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
];

const datePresets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const DashboardFilters = ({ filters, onFiltersChange }: DashboardFiltersProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDatePreset = (days: number) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        from: subDays(new Date(), days),
        to: new Date(),
      },
    });
    setIsCalendarOpen(false);
  };

  const handleRegionChange = (value: string) => {
    onFiltersChange({
      ...filters,
      region: value,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: undefined,
      region: 'all',
    });
  };

  const hasActiveFilters = filters.region !== 'all' || filters.dateRange?.from;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Date Range Picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-9 gap-2 border-border bg-card hover:bg-secondary"
          >
            <Calendar className="h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <span>
                  {format(filters.dateRange.from, 'MMM d')} - {format(filters.dateRange.to, 'MMM d')}
                </span>
              ) : (
                format(filters.dateRange.from, 'MMM d, yyyy')
              )
            ) : (
              <span>Select Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r border-border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Select</p>
              {datePresets.map((preset) => (
                <Button
                  key={preset.days}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handleDatePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3">
              <CalendarComponent
                mode="range"
                selected={filters.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                initialFocus
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Region Selector */}
      <Select value={filters.region} onValueChange={handleRegionChange}>
        <SelectTrigger className="w-[150px] h-9 border-border bg-card">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Filters Badge & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {filters.region !== 'all' && (
              <span className="capitalize">{filters.region}</span>
            )}
            {filters.dateRange?.from && filters.region !== 'all' && ' • '}
            {filters.dateRange?.from && 'Date filtered'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
