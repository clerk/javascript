import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

import type { ClerkFastifyOptions } from './types';
import { ALLOWED_HOOKS } from './types';
import { withClerkMiddleware } from './withClerkMiddleware';

const plugin: FastifyPluginCallback<ClerkFastifyOptions> = (
  instance: FastifyInstance,
  opts: ClerkFastifyOptions,
  done,
) => {
  instance.decorateRequest('auth', null);
  // run clerk as a middleware to all scoped routes
  const hookName = opts.hookName || 'preHandler';
  if (!ALLOWED_HOOKS.includes(hookName)) {
    throw new Error(`Unsupported hookName: ${hookName}`);
  }

  instance.addHook(hookName, withClerkMiddleware(opts));

  done();
};

export const clerkPlugin = fp(plugin, {
  name: '@clerk/fastify',
  fastify: '5.x',
});
