import { describe, expect, test, vi } from 'vitest';

vi.mock('../withClerkMiddleware', () => {
  return {
    withClerkMiddleware: () => 'withClerkMiddlewareMocked',
  };
});

import { clerkPlugin } from '../clerkPlugin';
import { createFastifyInstanceMock } from '../test/utils';
import type { ALLOWED_HOOKS } from '../types';

describe('clerkPlugin()', () => {
  test('adds withClerkMiddleware as preHandler by default', () => {
    const doneFn = vi.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.addHook).toHaveBeenCalledWith('preHandler', 'withClerkMiddlewareMocked');
    expect(doneFn).toHaveBeenCalled();
  });

  test('adds withClerkMiddleware as onRequest when specified', () => {
    const doneFn = vi.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, { hookName: 'onRequest' }, doneFn);

    expect(fastify.addHook).toHaveBeenCalledWith('onRequest', 'withClerkMiddlewareMocked');
    expect(doneFn).toHaveBeenCalled();
  });

  test.each(['preParsing', 'preValidation', 'preSerialization', 'NOT_A_VALID_HOOK_NAME'])(
    'throws when hookName is %s',
    hookName => {
      const doneFn = vi.fn();
      const fastify = createFastifyInstanceMock();

      expect(() => {
        clerkPlugin(
          fastify,
          {
            hookName: hookName as (typeof ALLOWED_HOOKS)[number],
          },
          doneFn,
        );
      }).toThrowError(`Unsupported hookName: ${hookName}`);
    },
  );

  test('adds request decorators', () => {
    const doneFn = vi.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.decorateRequest).toHaveBeenCalledWith('auth', null);
    expect(fastify.decorateRequest).toHaveBeenCalledWith('clerk', null);
    expect(doneFn).toHaveBeenCalled();
  });

  test.each(['4.28.0', '3.29.5', '2.0.0'])(
    'throws an actionable error when registered on fastify@%s',
    version => {
      const doneFn = vi.fn();
      const fastify = createFastifyInstanceMock({ version });

      expect(() => {
        clerkPlugin(fastify, {}, doneFn);
      }).toThrowError(new RegExp(`requires fastify@>=5 but is being registered on fastify@${version.replace(/\./g, '\\.')}`));
      expect(() => {
        clerkPlugin(fastify, {}, doneFn);
      }).toThrowError(/pin @clerk\/fastify@\^1/);
      expect(doneFn).not.toHaveBeenCalled();
    },
  );

  test.each(['5.0.0', '5.8.5', '6.0.0-alpha.1'])(
    'does not throw on supported fastify@%s',
    version => {
      const doneFn = vi.fn();
      const fastify = createFastifyInstanceMock({ version });

      expect(() => clerkPlugin(fastify, {}, doneFn)).not.toThrow();
      expect(doneFn).toHaveBeenCalled();
    },
  );
});
