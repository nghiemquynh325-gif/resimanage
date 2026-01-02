-- Create News Posts Table (FIXED VERSION)
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  zalo_post_id TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_posts
-- Everyone can read news
CREATE POLICY "Anyone can view news" ON news_posts
  FOR SELECT USING (true);

-- Only authenticated users can insert news (simplified - no admin check)
CREATE POLICY "Authenticated users can create news" ON news_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update news
CREATE POLICY "Authenticated users can update news" ON news_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete news
CREATE POLICY "Authenticated users can delete news" ON news_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_news_posts_created_at ON news_posts(created_at DESC);
CREATE INDEX idx_news_posts_author ON news_posts(author_id);
