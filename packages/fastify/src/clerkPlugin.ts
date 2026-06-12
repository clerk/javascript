import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

import { incompatibleFastifyVersion } from './errors';
import type { ClerkFastifyOptions } from './types';
import { ALLOWED_HOOKS } from './types';
import { withClerkMiddleware } from './withClerkMiddleware';

const FASTIFY_MAJOR_MIN = 5;

// Extracts the major version from a Fastify version string like "5.8.5"
// without introducing a `semver` dependency for a single integer compare.
const parseFastifyMajor = (version: string): number => {
  const match = /^(\d+)/.exec(version);
  return match ? Number.parseInt(match[1]!, 10) : 0;
};

const plugin: FastifyPluginCallback<ClerkFastifyOptions> = (
  instance: FastifyInstance,
  opts: ClerkFastifyOptions,
  done,
) => {
  // Throw a Clerk-branded, actionable error instead of fastify-plugin's
  // stock FST_ERR_PLUGIN_VERSION_MISMATCH, which doesn't tell the user
  // what to do (upgrade fastify or pin @clerk/fastify@^1).
  if (parseFastifyMajor(instance.version) < FASTIFY_MAJOR_MIN) {
    throw new Error(incompatibleFastifyVersion(instance.version));
  }

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
});
