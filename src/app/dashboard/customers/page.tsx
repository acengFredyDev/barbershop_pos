'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Customer, CustomerNote } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Search, Plus, Pencil, Trash2, FileText, X } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
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

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchQuery)) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open dialog for adding new customer
  const handleAddCustomer = () => {
    setIsEditing(false);
    setCurrentCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
    setShowCustomerDialog(true);
  };

  // Open dialog for editing customer
  const handleEditCustomer = (customer: Customer) => {
    setIsEditing(true);
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || ''
    });
    setShowCustomerDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save customer (create or update)
  const handleSaveCustomer = async () => {
    // Validate form
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Customer name is required',
        variant: 'destructive',
      });
      return;
    }

    const customerData = {
      name: formData.name,
      phone: formData.phone || null,
      email: formData.email || null,
      notes: formData.notes || null
    };

    if (isEditing && currentCustomer) {
      // Update existing customer
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', currentCustomer.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update customer',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === currentCustomer.id ? { ...customer, ...customerData } : customer
      ));

      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
    } else {
      // Create new customer
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          visit_count: 0
        }])
        .select();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create customer',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setCustomers([...customers, data[0] as Customer]);

      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });
    }

    // Close dialog and reset form
    setShowCustomerDialog(false);
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
      return;
    }

    // Update local state
    setCustomers(customers.filter(customer => customer.id !== customerId));

    toast({
      title: 'Success',
      description: 'Customer deleted successfully',
    });
  };

  // View customer notes
  const handleViewNotes = async (customer: Customer) => {
    setCurrentCustomer(customer);
    
    // Fetch customer notes
    const { data, error } = await supabase
      .from('customer_notes')
      .select('*, barber:profiles(*)')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customer notes',
        variant: 'destructive',
      });
      return;
    }
    
    setCustomerNotes(data as CustomerNote[]);
    setShowNotesDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button onClick={handleAddCustomer}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customers List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                {searchQuery ? 'No customers found matching your search' : 'No customers found'}
              </p>
            ) : (
              <div className="divide-y">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="flex justify-between items-center py-4">
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      {customer.phone && <p className="text-sm text-gray-500">Phone: {customer.phone}</p>}
                      {customer.email && <p className="text-sm text-gray-500">Email: {customer.email}</p>}
                      <p className="text-sm text-gray-500 mt-1">Visits: {customer.visit_count}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewNotes(customer)}>
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Notes</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteCustomer(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone (optional)</label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email (optional)</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes (optional)</label>
              <textarea
                id="notes"
                name="notes"
                className="w-full min-h-[80px] p-2 border rounded-md"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCustomer}>{isEditing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notes for {currentCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {customerNotes.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No notes found for this customer</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {customerNotes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg">
                    <p className="whitespace-pre-wrap">{note.note}</p>
                    <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                      <span>By: {note.barber?.name}</span>
                      <span>{formatDate(note.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowNotesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}