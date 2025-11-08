/**
 * Supabase client configuration with enhanced error handling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Don't persist sessions on server
  },
});

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Enhanced database query wrapper with error handling
 */
export async function executeQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  useAdmin: boolean = false
): Promise<T> {
  const client = useAdmin ? supabaseAdmin : supabase;
  
  try {
    const { data, error } = await queryFn(client);
    
    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
    
    if (data === null) {
      throw new Error('No data returned from query');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    
    console.error('Unexpected database error:', error);
    throw new Error('Unexpected database error occurred');
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('reports').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}