-- Create user profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  user_role text DEFAULT 'citizen' CHECK (user_role IN ('citizen', 'public_admin', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create public admins table if not exists
CREATE TABLE IF NOT EXISTS public_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  district text NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table if not exists
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  district text NOT NULL,
  sector_number text NOT NULL,
  address_line text NOT NULL,
  latitude decimal,
  longitude decimal,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'resolved', 'false_complaint', 'withdrawn')),
  images text[],
  assigned_admin text,
  internal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reassignment requests table if not exists
CREATE TABLE IF NOT EXISTS reassignment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  requesting_admin text NOT NULL,
  suggested_category text NOT NULL,
  suggested_district text NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reassignment_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can manage public admins" ON public_admins;
DROP POLICY IF EXISTS "Users can read all reports" ON reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Public admins can update assigned reports" ON reports;
DROP POLICY IF EXISTS "Admin can manage reassignment requests" ON reassignment_requests;
DROP POLICY IF EXISTS "Public admins can create reassignment requests" ON reassignment_requests;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for public_admins
CREATE POLICY "Admin can manage public admins" ON public_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- RLS Policies for reports
CREATE POLICY "Citizens can read all reports" ON reports FOR SELECT USING (true);

CREATE POLICY "Users can create their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can see and update all reports
CREATE POLICY "Admin can manage all reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- Public admins can update reports in their jurisdiction
CREATE POLICY "Public admins can update assigned reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN public_admins pa ON up.email = pa.email
      WHERE up.id = auth.uid() 
      AND up.user_role = 'public_admin'
      AND pa.district = reports.district 
      AND pa.category = reports.category 
      AND pa.is_active = true
    )
  );

-- RLS Policies for reassignment_requests
CREATE POLICY "Admin can manage reassignment requests" ON reassignment_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_role = 'admin'
    )
  );

CREATE POLICY "Public admins can create reassignment requests" ON reassignment_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_role = 'public_admin'
    )
  );

-- Create storage bucket for images if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view report images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload report images" ON storage.objects;

CREATE POLICY "Anyone can view report images" ON storage.objects FOR SELECT USING (bucket_id = 'report-images');
CREATE POLICY "Users can upload report images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-images');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_public_admins_updated_at ON public_admins;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
DROP TRIGGER IF EXISTS update_reassignment_requests_updated_at ON reassignment_requests;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_public_admins_updated_at
  BEFORE UPDATE ON public_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reassignment_requests_updated_at
  BEFORE UPDATE ON reassignment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically set user role based on email
CREATE OR REPLACE FUNCTION set_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if admin
  IF NEW.email = 'vivek@gmail.com' THEN
    NEW.user_role = 'admin';
  -- Check if public admin
  ELSIF EXISTS (SELECT 1 FROM public_admins WHERE email = NEW.email AND is_active = true) THEN
    NEW.user_role = 'public_admin';
  ELSE
    NEW.user_role = 'citizen';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set user role on insert/update
DROP TRIGGER IF EXISTS set_user_role_trigger ON user_profiles;
CREATE TRIGGER set_user_role_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_user_role();

-- Function to update user role when public admin status changes
CREATE OR REPLACE FUNCTION update_user_role_on_admin_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If public admin is activated
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_active = true AND OLD.is_active = false) THEN
    UPDATE user_profiles 
    SET user_role = 'public_admin' 
    WHERE email = NEW.email;
  -- If public admin is deactivated
  ELSIF TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true THEN
    UPDATE user_profiles 
    SET user_role = 'citizen' 
    WHERE email = NEW.email AND email != 'vivek@gmail.com';
  -- If public admin is deleted
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET user_role = 'citizen' 
    WHERE email = OLD.email AND email != 'vivek@gmail.com';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for public admin changes
DROP TRIGGER IF EXISTS update_user_role_on_admin_change_trigger ON public_admins;
CREATE TRIGGER update_user_role_on_admin_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public_admins
  FOR EACH ROW EXECUTE FUNCTION update_user_role_on_admin_change();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_district_category ON reports(district, category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_public_admins_email ON public_admins(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(user_role);

-- Insert sample public admin accounts for testing
INSERT INTO public_admins (email, district, category, is_active) VALUES
  ('admin@ranchi.gov.in', 'Ranchi', 'Municipal', true),
  ('fire@dhanbad.gov.in', 'Dhanbad', 'Fire Department', true),
  ('water@bokaro.gov.in', 'Bokaro', 'Water Supply', true),
  ('electric@hazaribagh.gov.in', 'Hazaribagh', 'Electricity', true),
  ('municipal@jamshedpur.gov.in', 'East Singhbhum', 'Municipal', true)
ON CONFLICT (email) DO UPDATE SET
  district = EXCLUDED.district,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

-- Update existing users to have proper roles
UPDATE user_profiles SET user_role = 'admin' WHERE email = 'vivek@gmail.com';

-- Update users who are public admins
UPDATE user_profiles 
SET user_role = 'public_admin' 
WHERE email IN (SELECT email FROM public_admins WHERE is_active = true);