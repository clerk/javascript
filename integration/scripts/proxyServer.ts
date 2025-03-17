import type { IncomingMessage, ServerResponse } from 'node:http';
import http from 'node:http';
import type { createServer as _createServer, Server, ServerOptions } from 'node:https';
import https from 'node:https';

import { default as httpProxy } from 'http-proxy';

type ProxyServerOptions = {
  targets: Record<string, string>;
  ssl?: Pick<ServerOptions, 'ca' | 'cert' | 'key'>;
};

/**
 * Creates a local proxy server that forwards requests to different targets based on the host header.
 * The server will listen on port 80 (http) or 443 (https) depending on whether SSL options are provided.
 */
export const createProxyServer = (opts: ProxyServerOptions) => {
  const usingSSL = !!opts.ssl;

  const proxy = httpProxy.createProxyServer({
    secure: usingSSL,
    xfwd: true,
  });

  // We need to handle errors to avoid crashing the proxy server
  proxy.on('error', (err: Error, req: IncomingMessage, res: ServerResponse) => {
    console.error(`[Proxy Error]: ${req.url}`, err);
    res.writeHead(502);
    res.end('Proxy error');
  });

  const createServer: typeof _createServer = usingSSL ? https.createServer.bind(https) : http.createServer.bind(http);

  return createServer(opts.ssl, (req, res) => {
    const hostHeader = req.headers.host || '';
    if (opts.targets[hostHeader]) {
      proxy.web(req, res, { target: opts.targets[hostHeader] });
    } else {
      res.writeHead(404);
      res.end();
    }
  }).listen(usingSSL ? 8443 : 8880, '127.0.0.1');
};

export type { Server };
