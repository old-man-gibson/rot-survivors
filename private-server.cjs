// Local-only game server; Tailscale Serve provides private remote access.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = __dirname;
const scripts = new Set(['world-assets.js', 'world-navigation.js', 'terrain.js', 'campaign.js', 'horde.js', 'priests.js', 'metamorphoses.js', 'god-revelations.js', 'build-effects.js', 'player-stats.js', 'revelations.js', 'actor-art.js', 'front-end.js']);
const types = {'.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.json':'application/json'};
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'prototype.html';
    const allowed = name === 'prototype.html' || name === 'revelations.css' || scripts.has(name) || ((name.startsWith('tilemaps/') || name.startsWith('assets/')) && /\.(png|webp|jpg|json)$/i.test(name));
    const file = path.resolve(root, name);
    if (!allowed || !file.startsWith(root + path.sep)) { res.writeHead(404); return res.end(); }
    const real = await fs.realpath(file);
    if (!real.startsWith(root + path.sep)) { res.writeHead(404); return res.end(); }
    const data = await fs.readFile(real);
    res.writeHead(200, {'Content-Type':types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : 404); res.end();
  }
}).listen(Number(process.env.ROT_PORT || 8765), '127.0.0.1', () => console.log(`Rot Survivors: http://127.0.0.1:${server.address().port}`));
module.exports = server;
