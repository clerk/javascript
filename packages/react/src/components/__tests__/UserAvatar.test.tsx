import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { UserAvatar } from '..';

export type UserAvatarComponentProps = React.ComponentProps<typeof UserAvatar>;

describe('<UserAvatar/>', () => {
  describe('Type tests', () => {
    test('rounded is a boolean', () => {
      expectTypeOf({ rounded: true }).toMatchTypeOf<UserAvatarComponentProps>();
      expectTypeOf<{ rounded: false }>().toMatchTypeOf<UserAvatarComponentProps>();
    });
  });
});
