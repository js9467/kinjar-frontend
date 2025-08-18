// api/kinjar/[...path].js
// Catch-all proxy: forwards requests from /api/kinjar/* to https://api.kinjar.com/*

export const config = {
  api: { bodyParser: false } // disable body parsing so we can forward raw body
};

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const targetBase = 'https://api.kinjar.com';
  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : (req.query.path || '');
  const url = `${targetBase}/${path}`;

  // Forward only the important headers
  const fwd = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v !== 'string') continue;
    const lk = k.toLowerCase();
    if (['content-type', 'x-family', 'authorization'].includes(lk)) {
      fwd[lk] = v;
    }
  }

  const body = (req.method === 'GET' || req.method === 'HEAD')
    ? undefined
    : await readBody(req);

  try {
    const r = await fetch(url, {
      method: req.method,
      headers: fwd,
      body
    });

    res.status(r.status);
    const ct = r.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('content-type', ct);

    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', detail: err.message });
  }
}
