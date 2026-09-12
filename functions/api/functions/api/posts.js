import { isAuthorized, slugify } from '../_auth.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT slug, title, category, excerpt, created_at FROM posts ORDER BY created_at DESC'
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const title = (body.title || '').trim();
  const text = (body.body || '').trim();
  if (!title || !text) {
    return new Response(JSON.stringify({ error: 'Title and body are required' }), { status: 400 });
  }

  const slug = slugify(title);
  const category = body.category || 'General';
  const excerpt = (body.excerpt || '').trim();

  await env.DB.prepare(
    'INSERT INTO posts (slug, title, category, excerpt, body) VALUES (?, ?, ?, ?, ?)'
  ).bind(slug, title, category, excerpt, text).run();

  return new Response(JSON.stringify({ slug }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
