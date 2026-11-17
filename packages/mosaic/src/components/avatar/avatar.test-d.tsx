import { describe, expectTypeOf, test } from 'vitest';

import type { Avatar, AvatarFallbackProps, AvatarIconProps, AvatarImageProps, AvatarRootProps } from '.';

describe('Avatar part types', () => {
  test('each part namespace names the same props as its flat type', () => {
    expectTypeOf<Avatar.Root.Props>().toEqualTypeOf<AvatarRootProps>();
    expectTypeOf<Avatar.Image.Props>().toEqualTypeOf<AvatarImageProps>();
    expectTypeOf<Avatar.Fallback.Props>().toEqualTypeOf<AvatarFallbackProps>();
    expectTypeOf<Avatar.Icon.Props>().toEqualTypeOf<AvatarIconProps>();
  });
});
