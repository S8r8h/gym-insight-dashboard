import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import type { Transaction } from '@/types/database';

interface TransactionsTableProps {
  onRowClick?: (transaction: Transaction) => void;
  selectedTransactionId?: string;
}

const ITEMS_PER_PAGE = 10;

const TransactionsTable = ({ onRowClick, selectedTransactionId }: TransactionsTableProps) => {
  const { data: transactions, isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSort = (key: keyof Transaction) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filter and sort transactions
  const filteredTransactions = (transactions || [])
    .filter((t) =>
      t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Transaction }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => handleSort(sortKey)}
      >
        {label}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    </TableHead>
  );

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card transition-all duration-300 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold font-display text-foreground">
            Recent Transactions
          </CardTitle>
          <Input
            placeholder="Search by customer or product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-xs h-9 text-sm bg-background border-border"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <SortableHeader label="Customer" sortKey="customer_name" />
                <SortableHeader label="Product" sortKey="product_name" />
                <SortableHeader label="Qty" sortKey="sales_quantity" />
                <SortableHeader label="Rate" sortKey="sales_rate" />
                <SortableHeader label="Amount" sortKey="sales_amount" />
                <SortableHeader label="Date" sortKey="recorded_at" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.transaction_id}
                    className={`cursor-pointer transition-colors ${
                      selectedTransactionId === transaction.transaction_id
                        ? 'bg-primary/10 hover:bg-primary/15'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => onRowClick?.(transaction)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {transaction.customer_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.product_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.sales_quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(transaction.sales_rate)}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(transaction.sales_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(parseISO(transaction.recorded_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;
