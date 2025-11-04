// Supabase client for client-side use in Next.js 14 App Router
import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in client components
 * Properly handles cookies and authentication state
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Alias for backward compatibility
 */
export function createClientComponentClient() {
  return createClient()
}