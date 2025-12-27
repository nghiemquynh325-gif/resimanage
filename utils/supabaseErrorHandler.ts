/**
 * Supabase Error Handler Utility
 * 
 * Provides consistent error logging and handling for Supabase operations
 */

interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusText?: string;
}

/**
 * Logs a Supabase error with detailed information
 */
export function logSupabaseError(
  operation: string,
  error: SupabaseError | Error | null | undefined,
  context?: Record<string, any>
) {
  if (!error) return;

  const errorDetails: any = {
    operation,
    timestamp: new Date().toISOString(),
    ...context
  };

  // Handle Supabase PostgrestError
  if ('message' in error && 'code' in error) {
    const supabaseError = error as SupabaseError;
    errorDetails.message = supabaseError.message;
    errorDetails.code = supabaseError.code;
    errorDetails.details = supabaseError.details;
    errorDetails.hint = supabaseError.hint;
    errorDetails.status = supabaseError.status;
    errorDetails.statusText = supabaseError.statusText;

    console.error(`❌ [Supabase] ${operation} failed:`, errorDetails);

    // Log specific error types
    if (supabaseError.code === 'PGRST116') {
      console.error('   → No rows returned (query returned empty result)');
    } else if (supabaseError.code === '23505') {
      console.error('   → Unique constraint violation (duplicate entry)');
    } else if (supabaseError.code === '42501') {
      console.error('   → Insufficient privileges (RLS policy violation)');
    } else if (supabaseError.code === '42P01') {
      console.error('   → Table does not exist');
    } else if (supabaseError.code === 'PGRST301') {
      console.error('   → JWT expired or invalid');
    }
  } else if (error instanceof Error) {
    // Handle standard Error objects
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
    console.error(`❌ [Supabase] ${operation} failed:`, errorDetails);
  } else {
    console.error(`❌ [Supabase] ${operation} failed:`, error, context);
  }
}

/**
 * Creates a user-friendly error message from Supabase error
 */
export function getUserFriendlyError(error: SupabaseError | Error | null | undefined): string {
  if (!error) return 'Đã có lỗi xảy ra';

  if ('message' in error && 'code' in error) {
    const supabaseError = error as SupabaseError;
    
    // Map common error codes to user-friendly messages
    switch (supabaseError.code) {
      case 'PGRST116':
        return 'Không tìm thấy dữ liệu';
      case '23505':
        return 'Dữ liệu đã tồn tại';
      case '42501':
        return 'Bạn không có quyền thực hiện thao tác này';
      case '42P01':
        return 'Lỗi cấu hình hệ thống';
      case 'PGRST301':
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
      default:
        return supabaseError.message || 'Đã có lỗi xảy ra';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã có lỗi xảy ra';
}

/**
 * Checks if error is a network/timeout error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorCode.includes('network') ||
    errorCode.includes('timeout') ||
    error.name === 'NetworkError' ||
    error.name === 'TimeoutError'
  );
}

/**
 * Checks if error is a Supabase RLS (Row Level Security) error
 */
export function isRLSError(error: any): boolean {
  if (!error) return false;
  return error.code === '42501' || 
         error.message?.includes('permission denied') ||
         error.message?.includes('new row violates row-level security');
}

