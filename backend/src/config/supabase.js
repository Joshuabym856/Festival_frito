const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Cliente público (para operaciones normales)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente admin (bypasea RLS, solo para el backend)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = { supabase, supabaseAdmin };