'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, FileText } from 'lucide-react';

type Transaction = {
  id: string;
  created_at: string;
  customer_id: string;
  cashier_id: string;
  total_amount: number;
  payment_method: string;
  customer: {
    name: string;
  };
  cashier: {
    name: string;
  };
  services: {
    id: string;
    name: string;
    price: number;
  }[];
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:customers(name),
        cashier:profiles(name)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    // Fetch services for each transaction
    const transactionsWithServices = await Promise.all(
      data.map(async (transaction) => {
        const { data: serviceData, error: serviceError } = await supabase
          .from('transaction_services')
          .select(`
            service_id,
            services(id, name, price)
          `)
          .eq('transaction_id', transaction.id);
          
        if (serviceError) {
          console.error('Error fetching transaction services:', serviceError);
          return {
            ...transaction,
            services: []
          };
        }
        
        return {
          ...transaction,
          services: serviceData.map(item => item.services)
        };
      })
    );
    
    setTransactions(transactionsWithServices as Transaction[]);
  };

  // Filter transactions based on search query and date
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.cashier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCurrency(transaction.total_amount).includes(searchQuery);
      
    const matchesDate = dateFilter ? 
      new Date(transaction.created_at).toISOString().split('T')[0] === dateFilter : 
      true;
      
    return matchesSearch && matchesDate;
  });

  // View transaction details
  const handleViewDetails = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setShowDetailsDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by customer, cashier, or payment method..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transactions List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                {searchQuery || dateFilter ? 'No transactions found matching your search' : 'No transactions found'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Cashier</th>
                      <th className="text-left py-3 px-4">Payment Method</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(transaction.created_at)}</td>
                        <td className="py-3 px-4">{transaction.customer?.name}</td>
                        <td className="py-3 px-4">{transaction.cashier?.name}</td>
                        <td className="py-3 px-4 capitalize">{transaction.payment_method}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(transaction.total_amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(transaction)}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {currentTransaction && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p>{formatDate(currentTransaction.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-mono text-sm">{currentTransaction.id}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p>{currentTransaction.customer?.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Cashier</p>
                  <p>{currentTransaction.cashier?.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="capitalize">{currentTransaction.payment_method}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Services</p>
                  <div className="mt-2 space-y-2">
                    {currentTransaction.services.map((service, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{service.name}</span>
                        <span>{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(currentTransaction.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}