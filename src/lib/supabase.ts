import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createClientComponentClient();
};