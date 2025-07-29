import { vi } from 'vitest';

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

  test('adds auth decorator', () => {
    const doneFn = vi.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.decorateRequest).toHaveBeenCalledWith('auth', null);
    expect(doneFn).toHaveBeenCalled();
  });
});
