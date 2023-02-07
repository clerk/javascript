import type { ClerkOptions } from '@clerk/types';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

import { polyfillServerResponseMethods } from './polyfill';
import { withClerkMiddleware } from './withClerkMiddleware';

const plugin: FastifyPluginCallback = (instance: FastifyInstance, opts: ClerkOptions, done) => {
  polyfillServerResponseMethods(instance);
  instance.decorateRequest('auth', null);
  // run clerk as a middleware to all scoped routes
  instance.addHook('preHandler', withClerkMiddleware(opts));

  done();
};

export const clerkPlugin = fp(plugin, {
  name: '@clerk/fastify',
  fastify: '4.x',
});
