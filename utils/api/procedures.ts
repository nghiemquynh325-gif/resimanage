import { supabase } from '../supabaseClient';
import type { AdminProcedure } from '../../types';

/**
 * Get all administrative procedures ordered by creation date
 */
export const getProcedures = async (): Promise<AdminProcedure[]> => {
    const { data, error } = await supabase
        .from('admin_procedures')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((proc: any) => ({
        id: proc.id,
        title: proc.title,
        description: proc.description,
        category: proc.category,
        fileUrls: proc.file_urls || [],
        youtubeUrl: proc.youtube_url,
        createdBy: proc.created_by,
        createdAt: proc.created_at,
        updatedAt: proc.updated_at,
    }));
};

/**
 * Create a new administrative procedure
 */
export const createProcedure = async (procedure: Omit<AdminProcedure, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProcedure> => {
    const { data, error } = await supabase
        .from('admin_procedures')
        .insert({
            title: procedure.title,
            description: procedure.description,
            category: procedure.category,
            file_urls: procedure.fileUrls,
            youtube_url: procedure.youtubeUrl,
            created_by: procedure.createdBy,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        fileUrls: data.file_urls || [],
        youtubeUrl: data.youtube_url,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

/**
 * Update an existing procedure
 */
export const updateProcedure = async (id: string, updates: Partial<AdminProcedure>): Promise<AdminProcedure> => {
    const { data, error } = await supabase
        .from('admin_procedures')
        .update({
            title: updates.title,
            description: updates.description,
            category: updates.category,
            file_urls: updates.fileUrls,
            youtube_url: updates.youtubeUrl,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        fileUrls: data.file_urls || [],
        youtubeUrl: data.youtube_url,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

/**
 * Delete a procedure
 */
export const deleteProcedure = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('admin_procedures')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadProcedureFile = async (file: File): Promise<{ name: string; url: string; size: number; type: string }> => {
    const fileName = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
        .from('procedure-files')
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('procedure-files')
        .getPublicUrl(fileName);

    return {
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
    };
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteProcedureFile = async (fileUrl: string): Promise<void> => {
    // Extract file path from URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
        .from('procedure-files')
        .remove([fileName]);

    if (error) throw error;
};
