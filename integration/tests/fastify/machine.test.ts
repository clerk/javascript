import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils/machineAuthHelpers';
import {
  registerApiKeyAuthTests,
  registerM2MAuthTests,
  registerOAuthAuthTests,
} from '../../testUtils/machineAuthHelpers';

const createMainFile = () => `
import 'dotenv/config';

import express from 'express';
import Fastify from 'fastify';
import ViteExpress from 'vite-express';
import { machineRoutes } from './routes/machine';

async function start() {
  const fastify = Fastify();

  await fastify.register(machineRoutes);

  await fastify.listen({ port: 0, host: '127.0.0.1' });
  const fastifyAddress = fastify.server.address();
  const fastifyPort = typeof fastifyAddress === 'object' ? fastifyAddress?.port : 0;

  const expressApp = express();

  expressApp.use('/api', async (req: any, res: any) => {
    const url = \`http://127.0.0.1:\${fastifyPort}\${req.url}\`;
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
  ViteExpress.listen(expressApp, port, () => console.log(\`Server is listening on port \${port}...\`));
}

start();
`;

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.fastify.vite,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config
        .addFile(
          'src/server/routes/machine.ts',
          () => `
import { clerkPlugin, getAuth } from '@clerk/fastify';
import type { FastifyInstance } from 'fastify';

export const machineRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(clerkPlugin, {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });

  fastify.get('/me', async (request, reply) => {
    const { userId, tokenType } = getAuth(request, { acceptsToken: 'api_key' });

    if (!userId) {
      return reply.code(401).send('Unauthorized');
    }

    return reply.send({ userId, tokenType });
  });

  fastify.post('/me', async (request, reply) => {
    const authObject = getAuth(request, { acceptsToken: ['api_key', 'session_token'] });

    if (!authObject.isAuthenticated) {
      return reply.code(401).send('Unauthorized');
    }

    return reply.send({ userId: authObject.userId, tokenType: authObject.tokenType });
  });
};
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config
        .addFile(
          'src/server/routes/machine.ts',
          () => `
import { clerkPlugin, getAuth } from '@clerk/fastify';
import type { FastifyInstance } from 'fastify';

export const machineRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(clerkPlugin, {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });

  fastify.get('/m2m', async (request, reply) => {
    const { subject, tokenType, machineId } = getAuth(request, { acceptsToken: 'm2m_token' });

    if (!machineId) {
      return reply.code(401).send('Unauthorized');
    }

    return reply.send({ subject, tokenType });
  });
};
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'src/server/routes/machine.ts',
          () => `
import { clerkPlugin, getAuth } from '@clerk/fastify';
import type { FastifyInstance } from 'fastify';

export const machineRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(clerkPlugin, {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });

  fastify.get('/oauth-verify', async (request, reply) => {
    const { userId, tokenType } = getAuth(request, { acceptsToken: 'oauth_token' });

    if (!userId) {
      return reply.code(401).send('Unauthorized');
    }

    return reply.send({ userId, tokenType });
  });

  fastify.get('/oauth/callback', async (_request, reply) => {
    return reply.send({ message: 'OAuth callback received' });
  });
};
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
};

test.describe('Fastify machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
