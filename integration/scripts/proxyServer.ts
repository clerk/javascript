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
  const proxy = httpProxy.createProxyServer({ xfwd: true });
  const usingSSL = !!opts.ssl;
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
