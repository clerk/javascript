import { expectTypeOf } from 'expect-type';
import type React from 'react';

import type { SignUp } from '..';

export type SignUpComponentProps = React.ComponentProps<typeof SignUp>;

describe('<SignUp/>', () => {
  describe('Type tests', () => {
    test('path type is a string', () => {
      expectTypeOf({ path: '/' }).toMatchTypeOf<SignUpComponentProps>();
      expectTypeOf<{
        path: string;
      }>().toMatchTypeOf<SignUpComponentProps>();
    });

    test('path type is a string and routing is path', () => {
      expectTypeOf<{
        path: string;
        routing: 'path';
      }>().toMatchTypeOf<SignUpComponentProps>();

      expectTypeOf({
        path: '/',
        routing: 'path' as const,
      }).toMatchTypeOf<SignUpComponentProps>();
    });

    test('when path is string it routing prop is only path', () => {
      expectTypeOf({
        path: '/foo',
        routing: 'virtual' as const,
      }).not.toMatchTypeOf<SignUpComponentProps>();

      expectTypeOf({
        path: '/bar',
        routing: 'hash' as const,
      }).not.toMatchTypeOf<SignUpComponentProps>();
    });

    test('when routing props is hash a path prop must not be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
        path: '/foo',
      }).not.toMatchTypeOf<SignUpComponentProps>();

      expectTypeOf<{
        path: string;
        routing: 'hash';
      }>().not.toMatchTypeOf<SignUpComponentProps>();
    });

    test('routing can be hash and path must not be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<SignUpComponentProps>();

      expectTypeOf<{
        routing: 'hash';
        path: never;
      }>().toMatchTypeOf<SignUpComponentProps>();
    });

    test('routing can be virtual and path must not be present', () => {
      expectTypeOf({
        routing: 'virtual' as const,
      }).toMatchTypeOf<SignUpComponentProps>();

      expectTypeOf<{
        routing: 'virtual';
        path: never;
      }>().toMatchTypeOf<SignUpComponentProps>();
    });
  });
});
