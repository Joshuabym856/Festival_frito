const SUPABASE_URL = 'https://ggvhrfqdadjwvdegvdkf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndmhyZnFkYWRqd3ZkZWd2ZGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDQ0NjAsImV4cCI6MjA5MTY4MDQ2MH0.eODXMJpbnXJCvY9apoBktPJqp_UivPDsrN2SmnFkJII';

const { createClient } = supabase;
const clienteSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function subirImagen(archivo, nombreArchivo) {
  const { data, error } = await supabase
    .storage
    .from('fritos-media')        // nombre del bucket
    .upload(`fritos/${nombreArchivo}`, archivo, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error subiendo imagen:', error.message);
    return null;
  }
  return data;
}