import { expectTypeOf } from 'expect-type';
import type React from 'react';
import { describe, test } from 'vitest';

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

    test('when routing is hash or virtual path must be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<UserProfileComponentProps>();
    });
  });
});
