import { expectTypeOf } from 'expect-type';
import type React from 'react';
import { describe, test } from 'vitest';

import type { SignIn } from '..';

export type SignInComponentProps = React.ComponentProps<typeof SignIn>;

describe('<SignIn/>', () => {
  describe('Type tests', () => {
    test('has path filled', () => {
      expectTypeOf({ path: '/sign-in' }).toMatchTypeOf<SignInComponentProps>();
    });

    test('has path filled and routing has path as a value', () => {
      expectTypeOf({
        path: '/sign-in',
        routing: 'path' as const,
      }).toMatchTypeOf<SignInComponentProps>();
    });

    test('when routing is hash or virtual path must be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<SignInComponentProps>();
    });
  });
});
