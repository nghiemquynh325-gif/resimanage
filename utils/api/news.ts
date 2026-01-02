import { supabase } from '../supabaseClient';
import type { NewsPost } from '../../types';

/**
 * Get all news posts ordered by creation date (newest first)
 */
export const getNewsPosts = async (): Promise<NewsPost[]> => {
    const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: post.image_url,
        zaloPostId: post.zalo_post_id,
        authorId: post.author_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
    }));
};

/**
 * Create a new news post
 */
export const createNewsPost = async (post: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsPost> => {
    const { data, error } = await supabase
        .from('news_posts')
        .insert({
            title: post.title,
            content: post.content,
            image_url: post.imageUrl,
            zalo_post_id: post.zaloPostId,
            author_id: post.authorId,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        title: data.title,
        content: data.content,
        imageUrl: data.image_url,
        zaloPostId: data.zalo_post_id,
        authorId: data.author_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

/**
 * Update an existing news post
 */
export const updateNewsPost = async (id: string, updates: Partial<NewsPost>): Promise<NewsPost> => {
    const { data, error } = await supabase
        .from('news_posts')
        .update({
            title: updates.title,
            content: updates.content,
            image_url: updates.imageUrl,
            zalo_post_id: updates.zaloPostId,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        title: data.title,
        content: data.content,
        imageUrl: data.image_url,
        zaloPostId: data.zalo_post_id,
        authorId: data.author_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

/**
 * Delete a news post
 */
export const deleteNewsPost = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
