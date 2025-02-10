jest.mock('../withClerkMiddleware', () => {
  return {
    withClerkMiddleware: () => 'withClerkMiddlewareMocked',
  };
});

import { clerkPlugin } from '../clerkPlugin';
import { createFastifyInstanceMock } from '../test/utils';
import type { ALLOWED_HOOKS } from '../types';

describe('clerkPlugin()', () => {
  test('adds withClerkMiddleware as preHandler by default', () => {
    const doneFn = jest.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.addHook).toBeCalledWith('preHandler', 'withClerkMiddlewareMocked');
    expect(doneFn).toBeCalled();
  });

  test('adds withClerkMiddleware as onRequest when specified', () => {
    const doneFn = jest.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, { hookName: 'onRequest' }, doneFn);

    expect(fastify.addHook).toBeCalledWith('onRequest', 'withClerkMiddlewareMocked');
    expect(doneFn).toBeCalled();
  });

  test.each(['preParsing', 'preValidation', 'preSerialization', 'NOT_A_VALID_HOOK_NAME'])(
    'throws when hookName is %s',
    hookName => {
      const doneFn = jest.fn();
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
    const doneFn = jest.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.decorateRequest).toBeCalledWith('auth', null);
    expect(doneFn).toBeCalled();
  });
});
