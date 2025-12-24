-- =====================================================
-- Supabase Migration: User Profiles Setup
-- =====================================================
-- This script creates the profiles table and necessary triggers
-- for automatic profile creation when users sign up.
--
-- Run this in your Supabase SQL Editor:
-- https://etcwjkfiduzblrkdlzpp.supabase.co
-- =====================================================

-- 1. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;

-- 3. Create profiles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'RESIDENT' CHECK (role IN ('ADMIN', 'RESIDENT')),
  avatar_url TEXT,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('active', 'pending_approval', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile creation during signup (this is handled by the trigger)
CREATE POLICY "Enable insert for authenticated users during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- 6. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'RESIDENT'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'pending_approval'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to automatically update updated_at
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create indexes for better performance (drop first if exists)
DROP INDEX IF EXISTS public.profiles_email_idx;
DROP INDEX IF EXISTS public.profiles_username_idx;
DROP INDEX IF EXISTS public.profiles_role_idx;
DROP INDEX IF EXISTS public.profiles_status_idx;

CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_username_idx ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_status_idx ON public.profiles(status);

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Verify the migration ran successfully (check for errors above)
-- 2. Test user registration in your application
-- 3. Check the profiles table to confirm new users are being created
-- =====================================================
