// POST /api/sign - Submit a signature
export async function onRequestPost(context) {
  const { env, request } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { name, country, email, newsletter } = body;

    if (!name || !country) {
      return new Response(JSON.stringify({ success: false, error: 'Name and country required.' }), { headers, status: 400 });
    }

    // Sanitize inputs
    const cleanName = name.substring(0, 100).trim();
    const cleanCountry = country.substring(0, 100).trim();
    const cleanEmail = (email || '').substring(0, 200).trim();

    // Insert signature
    await env.DB.prepare(
      'INSERT INTO signatures (name, country, email, newsletter, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
    ).bind(cleanName, cleanCountry, cleanEmail, newsletter ? 1 : 0).run();

    // If newsletter signup, also add to newsletter table
    if (newsletter && cleanEmail) {
      try {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO newsletter (email, created_at) VALUES (?, datetime("now"))'
        ).bind(cleanEmail).run();
      } catch (e) { /* ignore duplicate */ }
    }

    // Get total count
    const total = await env.DB.prepare('SELECT COUNT(*) as count FROM signatures').first();

    return new Response(JSON.stringify({ success: true, total: total.count }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { headers, status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
