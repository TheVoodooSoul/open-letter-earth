// GET /api/signatures - Get recent signatures
export async function onRequestGet(context) {
  const { env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const result = await env.DB.prepare(
      'SELECT name, country, created_at FROM signatures ORDER BY created_at DESC LIMIT 20'
    ).all();

    return new Response(JSON.stringify({ signatures: result.results }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ signatures: [] }), { headers });
  }
}
