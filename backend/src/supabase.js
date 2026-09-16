const { createClient } = require("@supabase/supabase-js");

function clientFor(settings, token) {
  return createClient(settings.supabaseUrl, settings.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });
}

async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.user_metadata?.name || "Driver", phone: user.user_metadata?.phone || "", city: user.user_metadata?.city || "" };
}

module.exports = { clientFor, result, publicUser };
