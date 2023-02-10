import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

import type { ClerkFastifyOptions } from './types';
import { withClerkMiddleware } from './withClerkMiddleware';

const plugin: FastifyPluginCallback = (instance: FastifyInstance, opts: ClerkFastifyOptions, done) => {
  instance.decorateRequest('auth', null);
  // run clerk as a middleware to all scoped routes
  instance.addHook('preHandler', withClerkMiddleware(opts));

  done();
};

export const clerkPlugin = fp(plugin, {
  name: '@clerk/fastify',
  fastify: '4.x',
});
