// User types
export type UserRole = 'owner' | 'cashier' | 'barber';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  visit_count: number;
}

// Service types
export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  duration?: number; // in minutes
  created_at: string;
}

// Transaction types
export interface Transaction {
  id: string;
  customer_id: string;
  customer?: Customer;
  cashier_id: string;
  cashier?: User;
  barber_id: string;
  barber?: User;
  services: TransactionService[];
  total_amount: number;
  payment_method: 'cash' | 'qr' | 'ewallet';
  status: 'completed' | 'cancelled';
  tip_amount?: number;
  notes?: string;
  created_at: string;
}

export interface TransactionService {
  id: string;
  transaction_id: string;
  service_id: string;
  service?: Service;
  price: number;
}

// Attendance types
export interface Attendance {
  id: string;
  barber_id: string;
  barber?: User;
  check_in: string;
  check_out?: string;
  created_at: string;
}

// Customer Note types
export interface CustomerNote {
  id: string;
  customer_id: string;
  barber_id: string;
  note: string;
  created_at: string;
}