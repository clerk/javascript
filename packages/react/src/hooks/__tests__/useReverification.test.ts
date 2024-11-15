import { __experimental_useReverification as useReverification } from '@clerk/shared/react';
import { expectTypeOf } from 'expect-type';
// type HasFunction = Exclude<ReturnType<typeof __experimental_useReverification>['has'], undefined>;
// type ParamsOfHas = Parameters<HasFunction>[0];

describe('useReverification type tests', () => {
  const fetcher = async (key: string, options: { id: string }) => {
    return {
      key,
      options,
    };
  };

  const [verifiedFetcher] = useReverification(fetcher);

  describe('has', () => {
    it('allow pass through types', () => {
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
          level: 'first_factor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has with permission and reverification is allowed', () => {
      expectTypeOf({
        permission: 'org:edit:posts',
        __experimental_reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({reverification: {level, maxAge}}) is allowed', () => {
      expectTypeOf({
        __experimental_reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('reverification with other values as maxAge should throw', () => {
      expectTypeOf({
        __experimental_reverification: {
          level: 'first_factor',
          afterMinutes: '10',
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('veryStrict reverification is allowed', () => {
      expectTypeOf({
        __experimental_reverification: 'strict_mfa',
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
