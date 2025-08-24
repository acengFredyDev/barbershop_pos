'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQPage() {
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
              <Link href="/about">
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
          
          <div className="mb-8">
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about the Barbershop POS system. If you don't see your question here, 
              please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">General Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Barbershop POS?</AccordionTrigger>
                  <AccordionContent>
                    Barbershop POS is a comprehensive point of sale and management system designed specifically for barbershops and salons. 
                    It includes features for owners, cashiers, and barbers to streamline operations, manage customers, process payments, 
                    and track business performance.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>What devices can I use Barbershop POS on?</AccordionTrigger>
                  <AccordionContent>
                    Barbershop POS is a web-based application that works on any modern device with a web browser, including 
                    desktop computers, laptops, tablets, and smartphones. The interface is responsive and adapts to different 
                    screen sizes for optimal usability.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we take data security very seriously. All data is stored securely in Supabase with encryption. 
                    User authentication is handled with secure methods, and we regularly update our security measures 
                    to protect your business and customer information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Subscription & Pricing</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pricing-1">
                  <AccordionTrigger>How much does Barbershop POS cost?</AccordionTrigger>
                  <AccordionContent>
                    We offer several pricing tiers to accommodate businesses of different sizes. Our basic plan starts at $49/month, 
                    which includes core POS features and support for up to 3 users. Please contact our sales team for detailed pricing 
                    information and custom plans for larger businesses.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing-2">
                  <AccordionTrigger>Is there a free trial available?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we offer a 14-day free trial with full access to all features. No credit card is required to start your trial. 
                    This allows you to thoroughly test the system and ensure it meets your business needs before committing to a subscription.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing-3">
                  <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. 
                    If you cancel, you'll continue to have access to the system until the end of your current billing period.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Features & Functionality</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="features-1">
                  <AccordionTrigger>Can I track inventory with Barbershop POS?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Barbershop POS includes inventory management features that allow you to track product stock levels, 
                    set low stock alerts, and automatically update inventory when products are sold. You can also generate 
                    inventory reports to help with purchasing decisions.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="features-2">
                  <AccordionTrigger>Does the system support appointment scheduling?</AccordionTrigger>
                  <AccordionContent>
                    Yes, our system includes an integrated appointment scheduling feature that allows customers to book appointments 
                    online. Barbers can view their schedules, and the system prevents double-booking. Appointment reminders can be 
                    sent automatically to reduce no-shows.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="features-3">
                  <AccordionTrigger>Can I generate reports on sales and performance?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. The owner dashboard includes comprehensive reporting tools that provide insights into sales, 
                    revenue, popular services, barber performance, customer retention, and more. Reports can be customized by 
                    date range and exported for further analysis.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="features-4">
                  <AccordionTrigger>How does the customer management system work?</AccordionTrigger>
                  <AccordionContent>
                    Our customer management system allows you to store customer information, service history, preferences, and notes. 
                    You can track visit frequency, average spend, and preferred services or barbers. This helps provide personalized 
                    service and targeted marketing to increase customer loyalty.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Technical Support</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="support-1">
                  <AccordionTrigger>What kind of support is available?</AccordionTrigger>
                  <AccordionContent>
                    We provide email and chat support for all customers. Premium plans include phone support during business hours. 
                    Our support team is available to help with technical issues, feature questions, and best practices for using 
                    the system effectively.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="support-2">
                  <AccordionTrigger>Is training provided for new users?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we provide comprehensive training resources including video tutorials, documentation, and a knowledge base. 
                    Premium plans include personalized onboarding sessions to help you set up the system and train your staff. 
                    Additional training sessions can be purchased as needed.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="support-3">
                  <AccordionTrigger>How are updates and new features handled?</AccordionTrigger>
                  <AccordionContent>
                    We regularly update the system with new features, improvements, and security patches. Updates are deployed 
                    automatically with minimal disruption to your business. Major feature updates are announced in advance, 
                    and training materials are provided to help you take advantage of new functionality.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
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