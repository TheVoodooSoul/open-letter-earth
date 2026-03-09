// POST /api/visit - Track a page visit
export async function onRequestPost(context) {
  const { env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    const ua = context.request.headers.get('User-Agent') || '';

    // Insert visit
    await env.DB.prepare(
      'INSERT INTO visits (ip_hash, user_agent, created_at) VALUES (?, ?, datetime("now"))'
    ).bind(hashIP(ip), ua.substring(0, 200)).run();

    // Get unique visitor count (by IP hash)
    const result = await env.DB.prepare('SELECT COUNT(DISTINCT ip_hash) as count FROM visits').first();

    return new Response(JSON.stringify({ visitors: result.count }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ visitors: 1, error: e.message }), { headers });
  }
}

// Simple hash for privacy - don't store raw IPs
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return hash.toString(16);
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
