'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, Line } from 'recharts';

export default function Dashboard() {
  const [dailyRevenue, setDailyRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalBarbers, setTotalBarbers] = useState<number>(0);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [barberPerformance, setBarberPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get daily revenue
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyData, error: dailyError } = await supabase
          .from('transactions')
          .select('total_amount')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`);

        if (dailyError) throw dailyError;
        const dailyTotal = dailyData?.reduce((sum, item) => sum + item.total_amount, 0) || 0;
        setDailyRevenue(dailyTotal);

        // Get monthly revenue
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('transactions')
          .select('total_amount')
          .gte('created_at', firstDayOfMonth);

        if (monthlyError) throw monthlyError;
        const monthlyTotal = monthlyData?.reduce((sum, item) => sum + item.total_amount, 0) || 0;
        setMonthlyRevenue(monthlyTotal);

        // Get total customers
        const { count: customerCount, error: customerError } = await supabase
          .from('customers')
          .select('id', { count: 'exact' });

        if (customerError) throw customerError;
        setTotalCustomers(customerCount || 0);

        // Get total barbers
        const { data: barbers, error: barberError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'barber');

        if (barberError) throw barberError;
        setTotalBarbers(barbers?.length || 0);

        // Get revenue data for chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const revenuePromises = last7Days.map(async (date) => {
          const { data, error } = await supabase
            .from('transactions')
            .select('total_amount')
            .gte('created_at', `${date}T00:00:00`)
            .lte('created_at', `${date}T23:59:59`);

          if (error) throw error;
          const total = data?.reduce((sum, item) => sum + item.total_amount, 0) || 0;
          return {
            date,
            revenue: total,
          };
        });

        const revenueResults = await Promise.all(revenuePromises);
        setRevenueData(revenueResults);

        // Get barber performance
        const { data: barberData, error: barberPerfError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'barber');

        if (barberPerfError) throw barberPerfError;

        const barberPerfPromises = barberData?.map(async (barber) => {
          const { data: transactions, error } = await supabase
            .from('transactions')
            .select('id')
            .eq('barber_id', barber.id)
            .gte('created_at', firstDayOfMonth);

          if (error) throw error;
          return {
            name: barber.name,
            customers: transactions?.length || 0,
          };
        }) || [];

        const barberPerfResults = await Promise.all(barberPerfPromises);
        setBarberPerformance(barberPerfResults);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pendapatan Hari Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dailyRevenue)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pendapatan Bulan Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Pelanggan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Capster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBarbers}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
                <TabsTrigger value="barbers">Performa Capster</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="barbers" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performa Capster Bulan Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barberPerformance}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="customers" fill="#0284c7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}