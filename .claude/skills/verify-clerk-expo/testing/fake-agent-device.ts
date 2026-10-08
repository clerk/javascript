import http from 'node:http';

const port = Number(process.argv[process.argv.indexOf('--port') + 1]);
const token = process.env.AGENT_DEVICE_DAEMON_AUTH_TOKEN ?? '';
console.log(`Daemon auth token: ${token}`);
http
  .createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, path: req.url, authorized: req.headers.authorization === `Bearer ${token}` }));
  })
  .listen(port, '127.0.0.1');
