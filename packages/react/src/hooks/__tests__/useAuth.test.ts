import { expectTypeOf } from 'expect-type';

import type { useAuth } from '../useAuth';

type HasFunction = Exclude<ReturnType<typeof useAuth>['has'], undefined>;
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

    it('has with role and re-verification is allowed', () => {
      expectTypeOf({
        role: 'org:admin',
        __experimental_reverification: {
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
});
