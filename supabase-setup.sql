-- Setup database untuk Barbershop POS System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (untuk user: owner, cashier, barber)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'cashier', 'barber')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger untuk membuat profile saat user baru dibuat
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  cashier_id UUID REFERENCES profiles(id) NOT NULL,
  barber_id UUID REFERENCES profiles(id),
  total_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qr', 'ewallet')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled')),
  tip_amount INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transaction Services table
CREATE TABLE transaction_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Attendances table
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID REFERENCES profiles(id) NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Customer Notes table
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES profiles(id) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Sample data for services
INSERT INTO services (name, price, description, duration) VALUES
('Haircut', 50000, 'Basic haircut service', 30),
('Haircut + Wash', 70000, 'Haircut with hair wash', 45),
('Beard Trim', 30000, 'Beard trimming and shaping', 15),
('Hair Coloring', 150000, 'Hair coloring service', 90),
('Hair Styling', 40000, 'Hair styling without cutting', 20),
('Shave', 35000, 'Clean shave service', 20),
('Hair Treatment', 100000, 'Deep conditioning treatment', 60);

-- Row Level Security (RLS) Policies

-- Profiles: Owner can read all profiles, users can read their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Owner can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
  ));

-- Customers: All authenticated users can read, cashiers and owners can insert/update
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Cashiers and owners can insert customers"
  ON customers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('cashier', 'owner')
  ));

CREATE POLICY "Cashiers and owners can update customers"
  ON customers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('cashier', 'owner')
  ));

-- Services: All authenticated users can read, only owner can insert/update/delete
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Only owner can insert services"
  ON services FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
  ));

CREATE POLICY "Only owner can update services"
  ON services FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
  ));

CREATE POLICY "Only owner can delete services"
  ON services FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
  ));

-- Transactions: All authenticated users can read their own transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cashiers can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'cashier'
  ));

CREATE POLICY "Users can view transactions they're involved with"
  ON transactions FOR SELECT
  USING (
    auth.uid() = cashier_id OR 
    auth.uid() = barber_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
    )
  );

-- Transaction Services: Same policies as transactions
ALTER TABLE transaction_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cashiers can insert transaction services"
  ON transaction_services FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'cashier'
  ));

CREATE POLICY "Users can view transaction services they're involved with"
  ON transaction_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_services.transaction_id
    AND (
      transactions.cashier_id = auth.uid() OR
      transactions.barber_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
      )
    )
  ));

-- Attendances: Barbers can insert their own attendance, owners can view all
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can insert their own attendance"
  ON attendances FOR INSERT
  WITH CHECK (
    auth.uid() = barber_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'barber'
    )
  );

CREATE POLICY "Barbers can update their own attendance"
  ON attendances FOR UPDATE
  USING (
    auth.uid() = barber_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'barber'
    )
  );

CREATE POLICY "Users can view their own attendance or all if owner"
  ON attendances FOR SELECT
  USING (
    auth.uid() = barber_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
    )
  );

-- Customer Notes: Barbers can insert notes, all authenticated users can view
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can insert customer notes"
  ON customer_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'barber'
  ));

CREATE POLICY "All users can view customer notes"
  ON customer_notes FOR SELECT
  USING (true);