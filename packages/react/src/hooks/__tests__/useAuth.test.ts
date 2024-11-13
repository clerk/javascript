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

    it('has with role and assurance is allowed', () => {
      expectTypeOf({
        role: 'org:admin',
        __experimental_reverification: {
          level: 'firstFactor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has with permission and reverification is allowed', () => {
      expectTypeOf({
        permission: 'org:edit:posts',
        __experimental_reverification: {
          level: 'firstFactor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({reverification: {level, maxAge}}) is allowed', () => {
      expectTypeOf({
        __experimental_reverification: {
          level: 'firstFactor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with other values as maxAge should throw', () => {
      expectTypeOf({
        __experimental_reverification: {
          level: 'firstFactor',
          afterMinutes: '10',
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('veryStrict reverification is allowed', () => {
      expectTypeOf({
        __experimental_reverification: 'strictMfa',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('strict reverification is allowed', () => {
      expectTypeOf({
        __experimental_reverification: 'strict',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('moderate reverification is allowed', () => {
      expectTypeOf({
        __experimental_reverification: 'moderate',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('lax reverification is allowed', () => {
      expectTypeOf({
        __experimental_reverification: 'lax',
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('random reverification is not allowed', () => {
      expectTypeOf({
        __experimental_reverification: 'random',
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with other strings as level should throw', () => {
      expectTypeOf({
        __experimental_reverification: {
          level: 'some-factor',
          afterMinutes: 10,
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with number as level should throw', () => {
      expectTypeOf({
        __experimental_reverification: {
          level: 2,
          afterMinutes: 10,
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });
  });
});
