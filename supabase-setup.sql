-- Drop trigger dan function lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function yang diperbaiki dengan default values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT := new.raw_user_meta_data->>'name';
  user_role TEXT := new.raw_user_meta_data->>'role';
BEGIN
  IF user_name IS NULL OR user_name = '' THEN
    user_name := 'Unknown';
  END IF;
  IF user_role IS NULL OR user_role NOT IN ('owner', 'cashier', 'barber') THEN
    user_role := 'barber'; -- Default role
  END IF;
  
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, user_name, user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();