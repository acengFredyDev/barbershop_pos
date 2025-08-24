'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Customer, Attendance, CustomerNote, Transaction } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import BarberLayout from '@/components/layout/barber-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Search, Clock, Users, FileText, Plus, Check, X } from 'lucide-react';

export default function BarberPage() {
  // State for attendance
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  // State for customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // State for customer notes
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  
  // State for today's appointments
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  
  // Load data on component mount
  useEffect(() => {
    checkAttendance();
    fetchCustomers();
    fetchTodayTransactions();
  }, []);
  
  // Check if barber is already checked in today
  const checkAttendance = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;
    
    const { data } = await supabase
      .from('attendances')
      .select('*')
      .eq('barber_id', session.user.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (data && data.length > 0) {
      setTodayAttendance(data[0] as Attendance);
      setIsCheckedIn(true);
    }
  };
  
  // Handle check in
  const handleCheckIn = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: 'Error',
        description: 'Session expired. Please login again',
        variant: 'destructive',
      });
      return;
    }
    
    const { data, error } = await supabase
      .from('attendances')
      .insert([
        { 
          barber_id: session.user.id,
          check_in: new Date().toISOString(),
        }
      ])
      .select();
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      });
      return;
    }
    
    setTodayAttendance(data[0] as Attendance);
    setIsCheckedIn(true);
    
    toast({
      title: 'Success',
      description: 'You have checked in successfully',
    });
  };
  
  // Handle check out
  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    
    const { error } = await supabase
      .from('attendances')
      .update({ check_out: new Date().toISOString() })
      .eq('id', todayAttendance.id);
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out',
        variant: 'destructive',
      });
      return;
    }
    
    // Update local state
    setTodayAttendance({
      ...todayAttendance,
      check_out: new Date().toISOString()
    });
    
    toast({
      title: 'Success',
      description: 'You have checked out successfully',
    });
  };
  
  // Fetch customers
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
  
  // Fetch today's transactions
  const fetchTodayTransactions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*, customer:customers(*)')
      .eq('barber_id', session.user.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load today\'s appointments',
        variant: 'destructive',
      });
      return;
    }
    
    setTodayTransactions(data as Transaction[]);
  };
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchCustomer))
  );
  
  // Load customer notes when a customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerNotes(selectedCustomer.id);
    } else {
      setCustomerNotes([]);
    }
  }, [selectedCustomer]);
  
  // Fetch customer notes
  const fetchCustomerNotes = async (customerId: string) => {
    const { data, error } = await supabase
      .from('customer_notes')
      .select('*, barber:profiles(*)')
      .eq('customer_id', customerId)
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
  };
  
  // Add customer note
  const addCustomerNote = async () => {
    if (!selectedCustomer || !noteText.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a customer and enter a note',
        variant: 'destructive',
      });
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: 'Error',
        description: 'Session expired. Please login again',
        variant: 'destructive',
      });
      return;
    }
    
    const { data, error } = await supabase
      .from('customer_notes')
      .insert([
        { 
          customer_id: selectedCustomer.id,
          barber_id: session.user.id,
          note: noteText.trim()
        }
      ])
      .select();
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
      return;
    }
    
    // Get barber info
    const { data: barberData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    const newNote = {
      ...data[0],
      barber: barberData
    } as CustomerNote;
    
    setCustomerNotes([newNote, ...customerNotes]);
    setNoteText('');
    setShowNoteDialog(false);
    
    toast({
      title: 'Success',
      description: 'Note added successfully',
    });
  };
  
  return (
    <BarberLayout>
      <div className="container mx-auto p-4">
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">
              <Clock className="mr-2 h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="mr-2 h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="mr-2 h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>
          
          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Status</p>
                      <p className={`text-sm ${isCheckedIn ? 'text-green-600' : 'text-red-600'}`}>
                        {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                      </p>
                    </div>
                    {isCheckedIn && todayAttendance && (
                      <div>
                        <p className="font-medium">Check-in Time</p>
                        <p className="text-sm">
                          {formatTime(todayAttendance.check_in)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {isCheckedIn && todayAttendance?.check_out && (
                    <div>
                      <p className="font-medium">Check-out Time</p>
                      <p className="text-sm">
                        {formatTime(todayAttendance.check_out)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {!isCheckedIn ? (
                  <Button className="w-full" onClick={handleCheckIn}>
                    <Check className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                ) : todayAttendance && !todayAttendance.check_out ? (
                  <Button className="w-full" variant="outline" onClick={handleCheckOut}>
                    <X className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Attendance Completed
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {todayTransactions.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No appointments for today</p>
                ) : (
                  <div className="space-y-4">
                    {todayTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{transaction.customer?.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatTime(transaction.created_at)}
                          </p>
                        </div>
                        <p className="text-sm mt-1">
                          Services: {transaction.services.length}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search customers..."
                className="pl-8"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
              />
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
          
          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {selectedCustomer ? `Notes for ${selectedCustomer.name}` : 'Select a customer to view notes'}
              </h3>
              {selectedCustomer && (
                <Button onClick={() => setShowNoteDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              )}
            </div>
            
            <Card>
              <CardContent className="p-0">
                {!selectedCustomer ? (
                  <p className="p-4 text-center text-gray-500">Select a customer to view notes</p>
                ) : customerNotes.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No notes for this customer</p>
                ) : (
                  <div className="divide-y">
                    {customerNotes.map((note) => (
                      <div key={note.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <p className="whitespace-pre-wrap">{note.note}</p>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                          <span>By: {note.barber?.name}</span>
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">Note</label>
              <textarea
                id="note"
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter customer note here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button onClick={addCustomerNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BarberLayout>
  );
}