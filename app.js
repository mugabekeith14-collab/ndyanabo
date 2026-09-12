function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Very small text-to-HTML pass: blank-line paragraphs, "## " becomes a subheading.
function renderBody(text) {
  const blocks = text.split(/\n\s*\n/);
  return blocks.map(block => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
    }
    return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

async function renderPostList(listElId) {
  const listEl = document.getElementById(listElId);
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();
    if (!posts.length) {
      listEl.innerHTML = '<li class="empty-state">No posts yet — check back soon.</li>';
      return;
    }
    listEl.innerHTML = posts.map(p => `
      <li class="post-card">
        <span class="tag">${escapeHtml(p.category || 'General')}</span>
        <h2><a href="/post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></h2>
        <p class="excerpt">${escapeHtml(p.excerpt || '')}</p>
        <p class="meta">${formatDate(p.created_at)}</p>
      </li>
    `).join('');
  } catch (err) {
    listEl.innerHTML = '<li class="empty-state">Could not load posts. Please refresh.</li>';
  }
}

async function renderPost(rootId, titleId) {
  const rootEl = document.getElementById(rootId);
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    rootEl.innerHTML = '<p>Post not found.</p>';
    return;
  }
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Not found');
    const post = await res.json();
    document.getElementById(titleId).textContent = `${post.title} — Ndyanabo`;
    rootEl.innerHTML = `
      <span class="tag">${escapeHtml(post.category || 'General')}</span>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="meta">${formatDate(post.created_at)}</p>
      <div class="body">${renderBody(post.body)}</div>
    `;
  } catch (err) {
    rootEl.innerHTML = '<p>Sorry, that post could not be found.</p>';
  }
}
