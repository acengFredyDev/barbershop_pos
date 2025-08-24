'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check user role and redirect accordingly
        const { data: user } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (user) {
          switch (user.role) {
            case 'owner':
              router.push('/dashboard');
              break;
            case 'cashier':
              router.push('/pos');
              break;
            case 'barber':
              router.push('/barber');
              break;
            default:
              router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Barbershop POS System</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            A complete solution for managing your barbershop business
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => router.push('/login')}
          >
            Login to System
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Owner Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive analytics, sales reports, and staff management tools to keep track of your business performance.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Cashier POS</h3>
              <p className="text-gray-600">
                Easy-to-use point of sale system for processing customer payments, managing services, and generating receipts.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Barber Tools</h3>
              <p className="text-gray-600">
                Attendance tracking, customer notes, and service history to help barbers provide personalized service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} Barbershop POS System. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               <a href="/about" className="hover:underline">About</a>
                <a href="/privacy" className="hover:underline">Privacy</a>
                <a href="/terms" className="hover:underline">Terms</a>
                <a href="/contact" className="hover:underline">Contact</a>
                <a href="/faq" className="hover:underline">FAQ</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}