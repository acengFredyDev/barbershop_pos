'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Customer, Service, Transaction, TransactionService } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import PosLayout from '@/components/layout/pos-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Search, Plus, User, ShoppingCart, CreditCard, Trash2, Receipt } from 'lucide-react';

export default function PosPage() {
  // State for customer
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  
  // State for services
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<TransactionService[]>([]);
  
  // State for payment
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr' | 'ewallet'>('cash');
  const [tipAmount, setTipAmount] = useState(0);
  const [notes, setNotes] = useState('');
  
  // State for receipt
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  
  // Load customers and services on component mount
  useEffect(() => {
    fetchCustomers();
    fetchServices();
  }, []);
  
  // Fetch customers from Supabase
  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
      return;
    }
    
    setCustomers(data as Customer[]);
  };
  
  // Fetch services from Supabase
  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
      return;
    }
    
    setServices(data as Service[]);
  };
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchCustomer))
  );
  
  // Add new customer
  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      toast({
        title: 'Error',
        description: 'Customer name is required',
        variant: 'destructive',
      });
      return;
    }
    
    const { data, error } = await supabase
      .from('customers')
      .insert([
        { 
          name: newCustomer.name,
          phone: newCustomer.phone,
          visit_count: 1
        }
      ])
      .select();
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add customer',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Success',
      description: 'Customer added successfully',
    });
    
    setCustomers([...customers, data[0] as Customer]);
    setSelectedCustomer(data[0] as Customer);
    setNewCustomer({ name: '', phone: '' });
    setShowCustomerDialog(false);
  };
  
  // Add service to cart
  const addServiceToCart = (service: Service) => {
    const existingService = selectedServices.find(s => s.service_id === service.id);
    
    if (existingService) {
      toast({
        title: 'Info',
        description: 'Service already added to cart',
      });
      return;
    }
    
    const newTransactionService: TransactionService = {
      id: `temp-${Date.now()}`,
      transaction_id: '',
      service_id: service.id,
      service: service,
      price: service.price
    };
    
    setSelectedServices([...selectedServices, newTransactionService]);
  };
  
  // Remove service from cart
  const removeServiceFromCart = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.service_id !== serviceId));
  };
  
  // Calculate total amount
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };
  
  // Calculate final amount including tip
  const calculateFinalAmount = () => {
    return calculateTotal() + tipAmount;
  };
  
  // Process payment
  const processPayment = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedServices.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one service',
        variant: 'destructive',
      });
      return;
    }
    
    // Get current user (cashier)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: 'Error',
        description: 'Session expired. Please login again',
        variant: 'destructive',
      });
      return;
    }
    
    // Create transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          customer_id: selectedCustomer.id,
          cashier_id: session.user.id,
          barber_id: '', // Will be assigned later
          total_amount: calculateFinalAmount(),
          payment_method: paymentMethod,
          status: 'completed',
          tip_amount: tipAmount,
          notes: notes
        }
      ])
      .select();
      
    if (transactionError) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
      return;
    }
    
    const transaction = transactionData[0] as Transaction;
    
    // Add transaction services
    const transactionServices = selectedServices.map(service => ({
      transaction_id: transaction.id,
      service_id: service.service_id,
      price: service.price
    }));
    
    const { error: servicesError } = await supabase
      .from('transaction_services')
      .insert(transactionServices);
      
    if (servicesError) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction services',
        variant: 'destructive',
      });
      return;
    }
    
    // Update customer visit count
    await supabase
      .from('customers')
      .update({ visit_count: selectedCustomer.visit_count + 1 })
      .eq('id', selectedCustomer.id);
    
    // Show receipt
    setCurrentTransaction({
      ...transaction,
      customer: selectedCustomer,
      services: selectedServices
    });
    
    setShowPaymentDialog(false);
    setShowReceiptDialog(true);
    
    toast({
      title: 'Success',
      description: 'Payment processed successfully',
    });
  };
  
  // Reset transaction
  const resetTransaction = () => {
    setSelectedCustomer(null);
    setSelectedServices([]);
    setPaymentMethod('cash');
    setTipAmount(0);
    setNotes('');
    setCurrentTransaction(null);
    setShowReceiptDialog(false);
  };
  
  return (
    <PosLayout>
      <div className="container mx-auto p-4">
        <Tabs defaultValue="cart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
            </TabsTrigger>
            <TabsTrigger value="customers">
              <User className="mr-2 h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="services">
              <CreditCard className="mr-2 h-4 w-4" />
              Services
            </TabsTrigger>
          </TabsList>
          
          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Current Transaction</span>
                  {selectedCustomer && (
                    <div className="text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Customer: {selectedCustomer.name}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">No services added yet</p>
                    <p className="text-sm">Go to Services tab to add services</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedServices.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border-b">
                        <div>
                          <p className="font-medium">{item.service?.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p>{formatCurrency(item.price)}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeServiceFromCart(item.service_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!selectedCustomer || selectedServices.length === 0}
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                />
              </div>
              <Button onClick={() => setShowCustomerDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredCustomers.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No customers found</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div 
                        key={customer.id} 
                        className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.visit_count} visits
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {services.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No services found</p>
                  ) : (
                    services.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-4">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500">{service.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">{formatCurrency(service.price)}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => addServiceToCart(service)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone (optional)</label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('cash')}
                >
                  Cash
                </Button>
                <Button 
                  variant={paymentMethod === 'qr' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('qr')}
                >
                  QR Code
                </Button>
                <Button 
                  variant={paymentMethod === 'ewallet' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setPaymentMethod('ewallet')}
                >
                  E-Wallet
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tip" className="text-sm font-medium">Tip Amount (optional)</label>
              <Input
                id="tip"
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes (optional)</label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span>Tip</span>
                  <span>{formatCurrency(tipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(calculateFinalAmount())}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={processPayment}>Complete Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Payment Receipt</DialogTitle>
          </DialogHeader>
          {currentTransaction && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <h2 className="text-xl font-bold">Barbershop POS</h2>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="border-t border-b py-2">
                <p><strong>Customer:</strong> {currentTransaction.customer?.name}</p>
                <p><strong>Transaction ID:</strong> {currentTransaction.id.slice(0, 8)}</p>
                <p><strong>Payment Method:</strong> {currentTransaction.payment_method}</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Services:</p>
                {currentTransaction.services.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.service?.name}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  {currentTransaction.tip_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tip</span>
                      <span>{formatCurrency(currentTransaction.tip_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(currentTransaction.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              {currentTransaction.notes && (
                <div className="text-sm">
                  <p><strong>Notes:</strong> {currentTransaction.notes}</p>
                </div>
              )}
              
              <div className="text-center text-sm text-gray-500 pt-4">
                <p>Thank you for your business!</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // In a real app, we would print the receipt here
                toast({
                  title: 'Print Receipt',
                  description: 'Receipt sent to printer',
                });
              }}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
            <Button 
              className="w-full"
              onClick={resetTransaction}
            >
              New Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PosLayout>
  );
}