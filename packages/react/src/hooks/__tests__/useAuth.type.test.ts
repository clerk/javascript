import type { PendingSessionOptions } from '@clerk/shared/types';
import { describe, expectTypeOf, it } from 'vitest';

import type { useAuth } from '../useAuth';

type UseAuthParameters = Parameters<typeof useAuth>[0];
type HasFunction = ReturnType<typeof useAuth>['has'];
type ParamsOfHas = Parameters<HasFunction>[0];

describe('useAuth type tests', () => {
  describe('has', () => {
    it('has({}) is allowed', () => {
      expectTypeOf({} as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({randomKey}) is not allowed', () => {
      expectTypeOf({
        randomKey: '',
      }).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('has({role: string}) is allowed', () => {
      expectTypeOf({ role: 'org:admin' }).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({role: string, permission: string}) is NOT allowed', () => {
      expectTypeOf({ role: 'org:admin', permission: 'some-perm' }).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('has({feature}) is allowed', () => {
      expectTypeOf({
        feature: 'org:feature',
      }).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({plan}) is allowed', () => {
      expectTypeOf({
        plan: 'org:pro',
      }).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({feature: string, plan: string}) is NOT allowed', () => {
      expectTypeOf({ plan: 'org:pro', feature: 'org:feature' }).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('has({feature: string, permission: string}) is NOT allowed', () => {
      expectTypeOf({ feature: 'org:pro', permission: 'org:feature' }).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('has({plan: string, role: string}) is NOT allowed', () => {
      expectTypeOf({ plan: 'org:pro', role: 'org:feature' }).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('has({plan: string, reverification}) is allowed', () => {
      expectTypeOf({ plan: 'org:pro', reverification: 'lax' } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({feature: string, reverification}) is allowed', () => {
      expectTypeOf({ feature: 'org:feature', reverification: 'lax' } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has with role and re-verification is allowed', () => {
      expectTypeOf({
        role: 'org:admin',
        reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has with permission and re-verification is allowed', () => {
      expectTypeOf({
        permission: 'org:edit:posts',
        reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({reverification: {level, maxAge}}) is allowed', () => {
      expectTypeOf({
        reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with other values as maxAge should throw', () => {
      expectTypeOf({
        reverification: {
          level: 'first_factor',
          afterMinutes: '10',
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('veryStrict reverification is allowed', () => {
      expectTypeOf({
        reverification: 'strict_mfa',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('strict reverification is allowed', () => {
      expectTypeOf({
        reverification: 'strict',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('moderate reverification is allowed', () => {
      expectTypeOf({
        reverification: 'moderate',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('lax reverification is allowed', () => {
      expectTypeOf({
        reverification: 'lax',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('random reverification is not allowed', () => {
      expectTypeOf({
        reverification: 'random',
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with other strings as level should throw', () => {
      expectTypeOf({
        reverification: {
          level: 'some-factor',
          afterMinutes: 10,
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with number as level should throw', () => {
      expectTypeOf({
        reverification: {
          level: 2,
          afterMinutes: 10,
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });
  });

  describe('with parameters', () => {
    it('allows passing any auth state object', () => {
      expectTypeOf({ orgId: null }).toMatchTypeOf<UseAuthParameters>();
    });

    it('do not allow invalid option types', () => {
      const invalidValue = 5;
      expectTypeOf({ treatPendingAsSignedOut: invalidValue } satisfies Record<
        keyof PendingSessionOptions,
        any
      >).toMatchTypeOf<UseAuthParameters>();
    });
  });
});
