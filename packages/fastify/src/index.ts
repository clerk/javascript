import type { WithAuthProp } from '@clerk/clerk-sdk-node';
import type { FastifyInstance, FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { polyfillServerResponseMethods } from './polyfill';
import { withClerkMiddleware } from './withClerkMiddleware';

const plugin: FastifyPluginCallback = (instance: FastifyInstance, opts, done) => {
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

export const getAuth = (req: FastifyRequest) => {
  const authReq = req as WithAuthProp<FastifyRequest>;

  if (authReq.auth === undefined) {
    throw new Error('The `clerkPlugin` plugin should be registered before using the `getAuth`!');
  }

  return authReq.auth || {};
};
