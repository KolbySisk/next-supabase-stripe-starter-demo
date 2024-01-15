import { supabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getSession() {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
  }

  return data;
}
