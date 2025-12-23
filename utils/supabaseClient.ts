
import { createClient } from '@supabase/supabase-js';

// Configuration for Supabase Database
const supabaseUrl = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
