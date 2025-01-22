import { expectTypeOf } from 'expect-type';
import type React from 'react';
import { describe, test } from 'vitest';

import type { SignUp } from '..';

export type SignUpComponentProps = React.ComponentProps<typeof SignUp>;

describe('<SignUp/>', () => {
  describe('Type tests', () => {
    test('has path filled', () => {
      expectTypeOf({ path: '/sign-up' }).toMatchTypeOf<SignUpComponentProps>();
    });

    test('has path filled and routing has path as a value', () => {
      expectTypeOf({
        path: '/sign-up',
        routing: 'path' as const,
      }).toMatchTypeOf<SignUpComponentProps>();
    });

    test('when routing is hash or virtual path must be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<SignUpComponentProps>();
    });
  });
});
