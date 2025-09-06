-- Add user_role column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'citizen' CHECK (user_role IN ('citizen', 'public_admin', 'admin'));

-- Update existing users to have proper roles
UPDATE user_profiles SET user_role = 'admin' WHERE email = 'vivek@gmail.com';

-- Update users who are public admins
UPDATE user_profiles 
SET user_role = 'public_admin' 
WHERE email IN (SELECT email FROM public_admins WHERE is_active = true);

-- Create a function to automatically set user role based on email
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

-- Update RLS policies for better access control

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all reports" ON reports;
DROP POLICY IF EXISTS "Public admins can update assigned reports" ON reports;

-- New RLS policies for reports
CREATE POLICY "Citizens can read all reports" ON reports 
  FOR SELECT USING (true);

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

-- Update public_admins RLS policies
DROP POLICY IF EXISTS "Admin can manage public admins" ON public_admins;
CREATE POLICY "Admin can manage public admins" ON public_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- Update reassignment_requests RLS policies
DROP POLICY IF EXISTS "Admin can manage reassignment requests" ON reassignment_requests;
DROP POLICY IF EXISTS "Public admins can create reassignment requests" ON reassignment_requests;

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

-- Insert some sample data for testing
INSERT INTO public_admins (email, district, category, is_active) VALUES
  ('admin@ranchi.gov.in', 'Ranchi', 'Municipal', true),
  ('fire@dhanbad.gov.in', 'Dhanbad', 'Fire Department', true),
  ('water@bokaro.gov.in', 'Bokaro', 'Water Supply', true)
ON CONFLICT (email) DO UPDATE SET
  district = EXCLUDED.district,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;