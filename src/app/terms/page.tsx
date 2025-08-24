'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p>
                Welcome to Barbershop POS. These Terms of Service ("Terms") govern your use of our point of sale and management system 
                (the "Service") operated by Barbershop POS ("we," "us," or "our").
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, 
                you may not access the Service.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Use of the Service</h2>
              <p>
                The Service is designed to provide point of sale and management capabilities for barbershops and salons. 
                You may use the Service only for lawful purposes and in accordance with these Terms.
              </p>
              <p>
                You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>In any way that violates any applicable national, federal, state, local, or international law or regulation.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
                <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm the Company or users of the Service.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
              <p>
                To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, 
                current, and complete information during the registration process and to update such information to keep it accurate, 
                current, and complete.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions 
                under your password. You agree not to disclose your password to any third party. You must notify us immediately upon 
                becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Subscription and Payments</h2>
              <p>
                Some aspects of the Service may be provided for a fee. You will be required to select a payment plan and provide 
                accurate payment information. You agree to pay all fees and charges incurred through your account for the Service 
                at the rates in effect when the charges were incurred.
              </p>
              <p>
                We may change our fees at any time by posting the changes on the Service or by notifying you directly. If you do not 
                cancel your subscription following such changes, you will be deemed to have accepted the new fees.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of 
                Barbershop POS and its licensors. The Service is protected by copyright, trademark, and other laws of both the 
                United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product 
                or service without the prior written consent of Barbershop POS.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">User Content</h2>
              <p>
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, 
                videos, or other material ("User Content"). You are responsible for the User Content that you post to the Service, 
                including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting User Content to the Service, you grant us the right and license to use, modify, perform, display, reproduce, 
                and distribute such content on and through the Service. You retain any and all of your rights to any User Content you 
                submit, post, or display on or through the Service and you are responsible for protecting those rights.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
                including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, 
                you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p>
                In no event shall Barbershop POS, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
                for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use 
                the Service.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
              <p>
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. 
                The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, 
                implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material 
                we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
                will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. 
                If you do not agree to the new terms, please stop using the Service.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>By email: terms@barbershoppos.com</li>
                <li>By phone: +1 (555) 123-4567</li>
              </ul>
            </section>
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