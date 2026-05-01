import 'dotenv/config';

import { clerkPlugin, getAuth } from '@clerk/fastify';
import express from 'express';
import Fastify from 'fastify';
import ViteExpress from 'vite-express';

async function start() {
  const fastify = Fastify();

  const proxyEnabled = process.env.CLERK_PROXY_ENABLED === 'true';

  fastify.register(clerkPlugin, {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    ...(proxyEnabled ? { frontendApiProxy: { enabled: true } } : {}),
  });

  fastify.get('/protected', async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.code(401).send('Unauthorized');
    }

    return reply.send('Protected API response');
  });

  // Start Fastify on an internal port, then bridge /api requests from Express
  await fastify.listen({ port: 0, host: '127.0.0.1' });
  const fastifyAddress = fastify.server.address();
  const fastifyPort = typeof fastifyAddress === 'object' ? fastifyAddress?.port : 0;

  const expressApp = express();

  // Proxy /api requests to Fastify
  expressApp.use('/api', async (req: any, res: any) => {
    const url = `http://127.0.0.1:${fastifyPort}${req.url}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value.join(', ');
      }
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      // @ts-expect-error duplex needed for streaming request bodies
      duplex: ['GET', 'HEAD'].includes(req.method) ? undefined : 'half',
      redirect: 'manual',
    });

    res.status(response.status);
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });
    const body = await response.arrayBuffer();
    res.send(Buffer.from(body));
  });

  const port = parseInt(process.env.PORT as string) || 3002;
  ViteExpress.listen(expressApp, port, () => console.log(`Server is listening on port ${port}...`));
}

start();
