import { expectTypeOf } from 'expect-type';
import type React from 'react';

import type { SignIn } from '../';

export type SignInComponentProps = React.ComponentProps<typeof SignIn>;

export type Routing = 'path' | 'hash' | 'virtual';

describe('<SignIn/>', () => {
  describe('Type tests', () => {
    test('path type is a string', () => {
      expectTypeOf({ path: '/' }).toMatchTypeOf<SignInComponentProps>();
      expectTypeOf<{
        path: string;
      }>().toMatchTypeOf<SignInComponentProps>();
    });

    test('path type is a string and routing is path', () => {
      expectTypeOf<{
        path: string;
        routing: 'path';
      }>().toMatchTypeOf<SignInComponentProps>();

      expectTypeOf({
        path: '/',
        routing: 'path' as const,
      }).toMatchTypeOf<SignInComponentProps>();
    });

    test('when path is string it routing prop is only path', () => {
      expectTypeOf({
        path: '/foo',
        routing: 'virtual' as const,
      }).not.toMatchTypeOf<SignInComponentProps>();

      expectTypeOf({
        path: '/bar',
        routing: 'hash' as const,
      }).not.toMatchTypeOf<SignInComponentProps>();
    });

    test('when routing props is hash a path prop must not be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
        path: '/foo',
      }).not.toMatchTypeOf<SignInComponentProps>();

      expectTypeOf<{
        path: string;
        routing: 'hash';
      }>().not.toMatchTypeOf<SignInComponentProps>();
    });

    test('routing can be hash and path must not be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<SignInComponentProps>();

      expectTypeOf<{
        routing: 'hash';
        path: never;
      }>().toMatchTypeOf<SignInComponentProps>();
    });

    test('routing can be virtual and path must not be present', () => {
      expectTypeOf({
        routing: 'virtual' as const,
      }).toMatchTypeOf<SignInComponentProps>();

      expectTypeOf<{
        routing: 'virtual';
        path: never;
      }>().toMatchTypeOf<SignInComponentProps>();
    });
  });
});
