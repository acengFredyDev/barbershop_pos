'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar } from 'lucide-react';

type ReportData = {
  date: string;
  total: number;
  count: number;
};

type ServiceData = {
  name: string;
  count: number;
  total: number;
};

type BarberData = {
  name: string;
  count: number;
  total: number;
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [dailyData, setDailyData] = useState<ReportData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [barberData, setBarberData] = useState<BarberData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [averageTransaction, setAverageTransaction] = useState(0);

  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Fetch report data when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate, reportType]);

  // Fetch report data from Supabase
  const fetchReportData = async () => {
    // Fetch transactions within date range
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    // Calculate total revenue and transactions
    const total = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    setTotalRevenue(total);
    setTotalTransactions(transactions.length);
    setAverageTransaction(transactions.length > 0 ? total / transactions.length : 0);
    
    // Process daily data
    const dailyMap = new Map<string, ReportData>();
    
    transactions.forEach(transaction => {
      const date = transaction.created_at.split('T')[0];
      const existing = dailyMap.get(date);
      
      if (existing) {
        existing.total += transaction.total_amount;
        existing.count += 1;
      } else {
        dailyMap.set(date, {
          date,
          total: transaction.total_amount,
          count: 1
        });
      }
    });
    
    const sortedDailyData = Array.from(dailyMap.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
    
    setDailyData(sortedDailyData);
    
    // Fetch service data
    const { data: transactionServices, error: servicesError } = await supabase
      .from('transaction_services')
      .select(`
        service_id,
        services(id, name, price),
        transaction_id
      `)
      .in('transaction_id', transactions.map(t => t.id));
      
    if (servicesError) {
      console.error('Error fetching transaction services:', servicesError);
      return;
    }
    
    // Process service data
    const serviceMap = new Map<string, ServiceData>();
    
    transactionServices.forEach(ts => {
      const serviceName = ts.services.name;
      const servicePrice = ts.services.price;
      const existing = serviceMap.get(serviceName);
      
      if (existing) {
        existing.count += 1;
        existing.total += servicePrice;
      } else {
        serviceMap.set(serviceName, {
          name: serviceName,
          count: 1,
          total: servicePrice
        });
      }
    });
    
    const sortedServiceData = Array.from(serviceMap.values()).sort((a, b) => 
      b.count - a.count
    );
    
    setServiceData(sortedServiceData);
    
    // Fetch barber data
    const { data: barberTransactions, error: barberError } = await supabase
      .from('transactions')
      .select(`
        barber_id,
        total_amount,
        barber:profiles(name)
      `)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);
      
    if (barberError) {
      console.error('Error fetching barber transactions:', barberError);
      return;
    }
    
    // Process barber data
    const barberMap = new Map<string, BarberData>();
    
    barberTransactions.forEach(bt => {
      if (!bt.barber_id || !bt.barber) return;
      
      const barberName = bt.barber.name;
      const existing = barberMap.get(barberName);
      
      if (existing) {
        existing.count += 1;
        existing.total += bt.total_amount;
      } else {
        barberMap.set(barberName, {
          name: barberName,
          count: 1,
          total: bt.total_amount
        });
      }
    });
    
    const sortedBarberData = Array.from(barberMap.values()).sort((a, b) => 
      b.total - a.total
    );
    
    setBarberData(sortedBarberData);
  };

  // Generate CSV data for export
  const generateCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Date,Total Revenue,Transaction Count\n';
    
    // Add data rows
    dailyData.forEach(day => {
      csvContent += `${day.date},${day.total},${day.count}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `barbershop-report-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <Button onClick={generateCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col">
              <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageTransaction)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="mb-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="barbers">Barbers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        tick={{ fontSize: 12 }}
                        height={70}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)}
                        labelFormatter={(label) => formatDate(label)}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Revenue" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Services by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => entry.name}
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Services by Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={serviceData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={90}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="barbers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Barber Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barberData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'Revenue') return formatCurrency(value as number);
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total" name="Revenue" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="count" name="Transactions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}