'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Calendar, Clock } from 'lucide-react';

type Barber = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Attendance = {
  id: string;
  barber_id: string;
  check_in: string;
  check_out: string | null;
  date: string;
};

type BarberPerformance = {
  barber_id: string;
  barber_name: string;
  customer_count: number;
  service_count: number;
};

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [barberPerformance, setBarberPerformance] = useState<BarberPerformance[]>([]);
  const [activeTab, setActiveTab] = useState('barbers');

  // Load barbers on component mount
  useEffect(() => {
    fetchBarbers();
    fetchBarberPerformance();
  }, []);

  // Fetch barbers from Supabase
  const fetchBarbers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'barber')
      .order('name');
      
    if (error) {
      console.error('Error fetching barbers:', error);
      return;
    }
    
    setBarbers(data as Barber[]);
  };

  // Fetch barber performance metrics
  const fetchBarberPerformance = async () => {
    // Get the current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    // First, get all barbers
    const { data: barbersData, error: barbersError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'barber');
      
    if (barbersError) {
      console.error('Error fetching barbers for performance:', barbersError);
      return;
    }
    
    // For each barber, get their performance metrics
    const performanceData = await Promise.all(
      barbersData.map(async (barber) => {
        // Get transactions where this barber served the customer
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('id, customer_id')
          .eq('barber_id', barber.id)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);
          
        if (transactionError) {
          console.error(`Error fetching transactions for barber ${barber.id}:`, transactionError);
          return {
            barber_id: barber.id,
            barber_name: barber.name,
            customer_count: 0,
            service_count: 0
          };
        }
        
        // Get unique customer count
        const uniqueCustomers = new Set(transactionData.map(t => t.customer_id));
        
        // Get service count
        const { count: serviceCount, error: serviceError } = await supabase
          .from('transaction_services')
          .select('id', { count: 'exact' })
          .in('transaction_id', transactionData.map(t => t.id));
          
        if (serviceError) {
          console.error(`Error fetching services for barber ${barber.id}:`, serviceError);
          return {
            barber_id: barber.id,
            barber_name: barber.name,
            customer_count: uniqueCustomers.size,
            service_count: 0
          };
        }
        
        return {
          barber_id: barber.id,
          barber_name: barber.name,
          customer_count: uniqueCustomers.size,
          service_count: serviceCount || 0
        };
      })
    );
    
    setBarberPerformance(performanceData);
  };

  // Filter barbers based on search query
  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // View barber attendance
  const handleViewAttendance = async (barber: Barber) => {
    setCurrentBarber(barber);
    
    // Fetch attendance records
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .eq('barber_id', barber.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching attendance records:', error);
      return;
    }
    
    setAttendanceRecords(data as Attendance[]);
    setShowAttendanceDialog(true);
  };

  // Filter attendance records based on date
  const filteredAttendance = attendanceRecords.filter(record =>
    dateFilter ? record.date === dateFilter : true
  );

  // Format time from ISO string
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Barbers Management</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="barbers">Barbers List</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="barbers" className="mt-4">
            <div className="mb-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search barbers by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Barbers List</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredBarbers.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">
                    {searchQuery ? 'No barbers found matching your search' : 'No barbers found'}
                  </p>
                ) : (
                  <div className="divide-y">
                    {filteredBarbers.map((barber) => (
                      <div key={barber.id} className="flex justify-between items-center py-4">
                        <div>
                          <h3 className="font-medium">{barber.name}</h3>
                          <p className="text-sm text-gray-500">{barber.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewAttendance(barber)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Attendance
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Barber Performance (This Month)</CardTitle>
              </CardHeader>
              <CardContent>
                {barberPerformance.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No performance data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Barber</th>
                          <th className="text-center py-3 px-4">Customers Served</th>
                          <th className="text-center py-3 px-4">Services Performed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {barberPerformance.map((performance) => (
                          <tr key={performance.barber_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{performance.barber_name}</td>
                            <td className="py-3 px-4 text-center">{performance.customer_count}</td>
                            <td className="py-3 px-4 text-center">{performance.service_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Attendance Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Records: {currentBarber?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
            </div>
            
            {filteredAttendance.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                {dateFilter ? 'No attendance records found for this date' : 'No attendance records found'}
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {filteredAttendance.map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" /> Check In
                        </p>
                        <p>{formatTime(record.check_in)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" /> Check Out
                        </p>
                        <p>{formatTime(record.check_out)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAttendanceDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}