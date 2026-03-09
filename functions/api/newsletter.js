// POST /api/newsletter - Subscribe to newsletter
export async function onRequestPost(context) {
  const { env, request } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const email = (body.email || '').substring(0, 200).trim();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ success: false, error: 'Valid email required.' }), { headers, status: 400 });
    }

    await env.DB.prepare(
      'INSERT OR IGNORE INTO newsletter (email, created_at) VALUES (?, datetime("now"))'
    ).bind(email).run();

    return new Response(JSON.stringify({ success: true }), { headers });
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
