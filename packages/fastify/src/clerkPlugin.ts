import { createClerkAgentRulesWriter } from '@clerk/shared/agentRulesWriter';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

import type { ClerkFastifyOptions } from './types';
import { ALLOWED_HOOKS } from './types';
import { withClerkMiddleware } from './withClerkMiddleware';

const writeAgentRulesOnce = createClerkAgentRulesWriter('fastify');

const plugin: FastifyPluginCallback<ClerkFastifyOptions> = (
  instance: FastifyInstance,
  opts: ClerkFastifyOptions,
  done,
) => {
  writeAgentRulesOnce();

  instance.decorateRequest('auth', null);
  instance.decorateRequest('clerk', null as any);

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
