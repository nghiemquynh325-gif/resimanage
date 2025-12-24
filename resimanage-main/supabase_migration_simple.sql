-- =====================================================
-- ALTERNATIVE MIGRATION: Simpler Approach
-- =====================================================
-- If the main migration fails, try this simpler version
-- This creates the table without complex constraints first
-- =====================================================

-- Step 1: Drop and recreate the profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create a simple profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'RESIDENT',
  avatar_url TEXT,
  status TEXT DEFAULT 'pending_approval',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add foreign key constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Step 4: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a permissive policy for testing (TEMPORARY - make it stricter later)
CREATE POLICY "Allow all operations for testing"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 6: Create the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log the attempt (you can view this in Supabase logs)
  RAISE LOG 'Creating profile for user: %', NEW.email;
  
  -- Insert the profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    phone_number,
    role,
    avatar_url,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'RESIDENT'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'pending_approval'
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    RAISE LOG 'Error creating profile for user %: %', NEW.email, SQLERRM;
    -- Re-raise the error so auth.signUp fails with a clear message
    RAISE;
END;
$$;

-- Step 7: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- =====================================================
-- Migration Complete!
-- =====================================================
-- This version is simpler and has better error logging
-- Check Supabase Logs after attempting registration
-- =====================================================
