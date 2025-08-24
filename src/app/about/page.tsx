'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Scissors, Users, CreditCard, BarChart, User, Calendar } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Scissors className="h-6 w-6" />
              <span className="inline-block font-bold">Barbershop POS</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Barbershop POS System
          </h1>
          <p className="mt-4 text-muted-foreground max-w-[700px] text-lg">
            A complete point of sale and management system for barbershops with multi-user roles
          </p>
        </div>

        <Tabs defaultValue="overview" className="max-w-4xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="guide">User Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About Barbershop POS</CardTitle>
                <CardDescription>
                  A comprehensive solution for barbershop management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Barbershop POS is a complete point of sale and management system designed specifically for barbershops. 
                  It provides a comprehensive solution for managing customers, services, transactions, and staff.
                </p>
                <p>
                  The system features three distinct user roles - Owner, Cashier, and Barber - each with tailored 
                  interfaces and permissions to streamline operations and improve efficiency.
                </p>
                <p>
                  Built with modern web technologies including Next.js, Tailwind CSS, and Supabase, 
                  the application offers a responsive and intuitive user experience across devices.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mb-2" />
                    <h3 className="font-medium">Multi-User Roles</h3>
                    <p className="text-sm text-muted-foreground">Owner, Cashier, and Barber interfaces</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <CreditCard className="h-8 w-8 mb-2" />
                    <h3 className="font-medium">Point of Sale</h3>
                    <p className="text-sm text-muted-foreground">Easy transaction processing</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <BarChart className="h-8 w-8 mb-2" />
                    <h3 className="font-medium">Reporting</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive business analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>
                  Comprehensive tools for barbershop management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Owner Dashboard</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive dashboard with sales reports, barber performance metrics, 
                        service popularity, and revenue trends. Manage services, users, and customers.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Cashier POS</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Streamlined point of sale interface for cashiers to process transactions, 
                        add new customers, select services, assign barbers, and generate receipts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Barber Tools</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Specialized interface for barbers to track attendance, view customer history, 
                        add customer notes, and manage their daily appointments.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Customer Management</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive customer database with visit history, preferences, and notes. 
                        Track customer loyalty and personalize service.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Attendance Tracking</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Track barber attendance with check-in and check-out functionality. 
                        Monitor working hours and performance metrics.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guide" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Guide</CardTitle>
                <CardDescription>
                  How to use the Barbershop POS system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg">For Owners</h3>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>Access the owner dashboard at <code>/dashboard</code> after logging in</li>
                      <li>View sales reports and performance metrics on the dashboard home</li>
                      <li>Manage services (add, edit, delete) in the Services section</li>
                      <li>Manage users (add cashiers and barbers) in the Users section</li>
                      <li>View and manage customers in the Customers section</li>
                      <li>View transaction history in the Transactions section</li>
                      <li>Monitor barber performance and attendance in the Barbers section</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">For Cashiers</h3>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>Access the POS interface at <code>/pos</code> after logging in</li>
                      <li>Select a customer from the list or add a new customer</li>
                      <li>Add services to the cart and assign barbers</li>
                      <li>Process payment (cash or card)</li>
                      <li>Generate and print receipts</li>
                      <li>Add customer notes if needed</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">For Barbers</h3>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>Access the barber interface at <code>/barber</code> after logging in</li>
                      <li>Check in at the start of your shift</li>
                      <li>View your customers for the day</li>
                      <li>Add notes about customer preferences and requirements</li>
                      <li>Check out at the end of your shift</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Barbershop POS. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Link href="/about" className="text-sm text-muted-foreground hover:underline">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:underline">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}