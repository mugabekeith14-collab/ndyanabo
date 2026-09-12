import { isAuthorized } from '../../_auth.js';

export async function onRequestGet({ env, params }) {
  const post = await env.DB.prepare(
    'SELECT slug, title, category, excerpt, body, created_at FROM posts WHERE slug = ?'
  ).bind(params.slug).first();

  if (!post) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(params.slug).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
