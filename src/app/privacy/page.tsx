'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p>
                This Privacy Policy describes how Barbershop POS ("we," "us," or "our") collects, uses, and discloses your 
                information when you use our point of sale and management system (the "Service").
              </p>
              <p>
                We are committed to protecting your personal information and your right to privacy. If you have any questions 
                or concerns about this privacy policy or our practices with regard to your personal information, please contact us.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register for the Service, 
                express an interest in obtaining information about us or our products and services, or otherwise contact us.
              </p>
              <p>
                The personal information that we collect depends on the context of your interactions with us and the Service, 
                the choices you make, and the products and features you use. The personal information we collect may include the following:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and other similar contact data.</li>
                <li><strong>Credentials:</strong> Passwords and similar security information used for authentication and account access.</li>
                <li><strong>Business Information:</strong> Business name, address, phone number, and email address.</li>
                <li><strong>Customer Data:</strong> Information about your customers, including names, contact information, and service history.</li>
                <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased through the Service.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect or receive:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
                <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
                <li>To manage your account and provide you with customer support.</li>
                <li>To process transactions and manage your billing.</li>
                <li>To contact you regarding your account, updates, security notifications, and other administrative messages.</li>
                <li>To improve our Service and develop new features, products, and services.</li>
                <li>To respond to legal requests and prevent harm as required by law.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
              <p>
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li><strong>Service Providers:</strong> We may share your information with service providers to perform services on our behalf.</li>
                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                <li><strong>Vital Interests and Legal Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person, or as evidence in litigation.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal 
                information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over 
                the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Data Protection Rights</h2>
              <p>
                Depending on your location, you may have the following data protection rights:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>The right to access, update, or delete the information we have on you.</li>
                <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete.</li>
                <li>The right to object to our processing of your personal data.</li>
                <li>The right of restriction - the right to request that we restrict the processing of your personal information.</li>
                <li>The right to data portability - the right to request that we provide you with a copy of the personal information we have about you.</li>
                <li>The right to withdraw consent - the right to withdraw your consent at any time where we relied on your consent to process your personal information.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
                and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they 
                are posted on this page.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>By email: privacy@barbershoppos.com</li>
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