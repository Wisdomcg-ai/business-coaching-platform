<<<<<<< HEAD
// /lib/supabase/client.ts
// This file creates a properly configured Supabase client for Next.js 14 App Router

import { createBrowserClient } from '@supabase/ssr'

// Create a Supabase client configured for client-side use
export function createClient() {
  // Get environment variables - these should be in your .env.local file
=======
// Supabase client for client-side use in Next.js 14 App Router
import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in client components
 * Properly handles cookies and authentication state
 */
export function createClient() {
>>>>>>> 0d18a6a9a2c74811fe3ea5ca9a4527e23ecef037
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