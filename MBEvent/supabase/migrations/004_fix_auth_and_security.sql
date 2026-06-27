-- Fix signup 500 (profile trigger blocked by RLS) and Security Advisor warnings

-- handle_new_user: pin search_path, avoid unsafe role cast from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'customer'::user_role
  );
  RETURN NEW;
END;
$$;

-- is_admin: pin search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Ensure definer-owned functions bypass RLS during signup trigger
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- Allow profile row creation when auth creates the user (trigger context)
DROP POLICY IF EXISTS "Users insert own profile on signup" ON public.profiles;
CREATE POLICY "Users insert own profile on signup"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- handle_new_user is only invoked by the auth trigger, not clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- is_admin is used in RLS policies for signed-in users only
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Public bucket URLs work without a broad SELECT policy; removing it stops bucket listing
DROP POLICY IF EXISTS "Public read service images" ON storage.objects;
