import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { UserButton } from '..';

export type UserButtonComponentProps = React.ComponentProps<typeof UserButton>;

describe('<UserButton/>', () => {
  describe('Type tests', () => {
    test('userProfileUrl is a string', () => {
      expectTypeOf({ userProfileUrl: '/' }).toMatchTypeOf<UserButtonComponentProps>();
      expectTypeOf<{
        userProfileUrl: string;
      }>().toMatchTypeOf<UserButtonComponentProps>();
    });

    test('userProfileUrl url is a string and userProfileMode is navigation', () => {
      expectTypeOf({
        userProfileUrl: '/',
        userProfileMode: 'navigation' as const,
      }).toMatchTypeOf<UserButtonComponentProps>();
      expectTypeOf<{
        userProfileUrl: string;
      }>().toMatchTypeOf<UserButtonComponentProps>();
    });

    test('that when userProfileMode is navigation that userProfileUrl is filled', () => {
      expectTypeOf({
        userProfileMode: 'navigation' as const,
      }).not.toMatchTypeOf<UserButtonComponentProps>();
    });

    test('that when userProfileMode is modal that userProfileUrl is not filled', () => {
      expectTypeOf({
        userProfileMode: 'modal' as const,
        userProfileUrl: '/',
      }).not.toMatchTypeOf<UserButtonComponentProps>();
    });

    test('userProfileMode is modal', () => {
      expectTypeOf({
        userProfileMode: 'modal' as const,
      }).toMatchTypeOf<UserButtonComponentProps>();
    });
  });
});
