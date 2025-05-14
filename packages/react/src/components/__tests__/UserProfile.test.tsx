import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { UserProfile } from '..';

export type UserProfileComponentProps = React.ComponentProps<typeof UserProfile>;

describe('<UserProfile/>', () => {
  describe('Type tests', () => {
    test('has path filled', () => {
      expectTypeOf({ path: '/profile' }).toMatchTypeOf<UserProfileComponentProps>();
    });

    test('has path filled and routing has path as a value', () => {
      expectTypeOf({
        path: '/profile',
        routing: 'path' as const,
      }).toMatchTypeOf<UserProfileComponentProps>();
    });

    test('when path is filled, routing must only have path as value', () => {
      expectTypeOf({
        path: '/profile',
        routing: 'virtual' as const,
      }).not.toMatchTypeOf<UserProfileComponentProps>();

      expectTypeOf({
        path: '/profile',
        routing: 'hash' as const,
      }).not.toMatchTypeOf<UserProfileComponentProps>();
    });

    test('when routing is hash or virtual path must be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<UserProfileComponentProps>();
    });
  });
});
