jest.mock('./withClerkMiddleware', () => {
  return {
    withClerkMiddleware: () => 'withClerkMiddlewareMocked',
  };
});

import { clerkPlugin } from './clerkPlugin';
import { createFastifyInstanceMock } from './test/utils';

describe('clerkPlugin()', () => {
  test('adds withClerkMiddleware as preHandler', () => {
    const doneFn = jest.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.addHook).toBeCalledWith('preHandler', 'withClerkMiddlewareMocked');
    expect(doneFn).toBeCalled();
  });

  test('adds auth decorator', () => {
    const doneFn = jest.fn();
    const fastify = createFastifyInstanceMock();

    clerkPlugin(fastify, {}, doneFn);

    expect(fastify.decorateRequest).toBeCalledWith('auth', null);
    expect(doneFn).toBeCalled();
  });
});
