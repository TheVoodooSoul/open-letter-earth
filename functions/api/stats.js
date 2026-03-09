// GET /api/stats - Get visitor and signature counts
export async function onRequestGet(context) {
  const { env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const visitors = await env.DB.prepare('SELECT COUNT(DISTINCT ip_hash) as count FROM visits').first();
    const signatures = await env.DB.prepare('SELECT COUNT(*) as count FROM signatures').first();

    return new Response(JSON.stringify({
      visitors: visitors.count,
      signatures: signatures.count
    }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ visitors: 0, signatures: 0 }), { headers });
  }
}
