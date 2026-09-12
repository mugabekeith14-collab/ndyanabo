export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  if (!env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Admin password not configured' }), { status: 500 });
  }

  if (body.password !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Wrong password' }), { status: 401 });
  }

  return new Response(JSON.stringify({ token: env.ADMIN_PASSWORD }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
