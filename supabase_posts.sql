-- =====================================================
-- Supabase Schema: Posts Table
-- =====================================================
-- Bảng này lưu trữ bài đăng cộng đồng
-- =====================================================

-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS public.posts CASCADE;

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_name ON public.posts(author_name);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

-- RLS Policies
CREATE POLICY "Anyone can view posts"
  ON public.posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own posts"
  ON public.posts
  FOR UPDATE
  USING (true); -- Simplified for now

-- Trigger
DROP TRIGGER IF EXISTS on_post_updated ON public.posts;
CREATE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- HOÀN TẤT!
-- =====================================================
