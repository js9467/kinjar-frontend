// api/kinjar/[...path].js
export const config = {
  runtime: 'nodejs18.x',
  api: { bodyParser: false }, // let us forward raw body (JSON, multipart, etc.)
};

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const targetBase = 'https://api.kinjar.com';
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path || '');
  const url = `${targetBase}/${path}`;

  // forward only needed headers
  const fwd = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v !== 'string') continue;
    const lk = k.toLowerCase();
    if (['content-type','x-family','authorization'].includes(lk)) fwd[lk] = v;
  }

  const body = (req.method === 'GET' || req.method === 'HEAD') ? undefined : await readBody(req);

  const r = await fetch(url, {
    method: req.method,
    headers: fwd,
    body,
  });

  // pass through status & content-type
  res.status(r.status);
  const ct = r.headers.get('content-type') || 'application/octet-stream';
  res.setHeader('content-type', ct);

  // stream back
  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
}
