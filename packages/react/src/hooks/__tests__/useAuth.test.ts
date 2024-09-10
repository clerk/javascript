import { expectTypeOf } from 'expect-type';

import type { useAuth } from '../useAuth';

type HasFunction = Exclude<ReturnType<typeof useAuth>['has'], undefined>;
type ParamsOfHas = Parameters<HasFunction>[0];

describe('useAuth type tests', () => {
  describe('has', () => {
    it('has({}) is allowed', () => {
      expectTypeOf({} as const).toMatchTypeOf<ParamsOfHas>();
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
        __experimental_assurance: {
          level: 'L1.firstFactor',
          maxAge: 'A1.10min',
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has with permission and assurance is allowed', () => {
      expectTypeOf({
        permission: 'org:edit:posts',
        __experimental_assurance: {
          level: 'L1.firstFactor',
          maxAge: 'A1.10min',
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('has({assurance: {level, maxAge}}) is allowed', () => {
      expectTypeOf({
        __experimental_assurance: {
          level: 'L1.firstFactor',
          maxAge: 'A1.10min',
        },
      } as const).toMatchTypeOf<ParamsOfHas>();
    });

    it('assurance with other strings as maxAge should throw', () => {
      expectTypeOf({
        __experimental_assurance: {
          level: 'L1.firstFactor',
          maxAge: 'some-value',
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('assurance with number as maxAge should throw', () => {
      expectTypeOf({
        __experimental_assurance: {
          level: 'L1.firstFactor',
          maxAge: 1000,
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('assurance with other strings as level should throw', () => {
      expectTypeOf({
        __experimental_assurance: {
          level: 'some-factor',
          maxAge: 'A1.10min',
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });

    it('assurance with number as level should throw', () => {
      expectTypeOf({
        __experimental_assurance: {
          level: 2,
          maxAge: 'A1.10min',
        },
      } as const).not.toMatchTypeOf<ParamsOfHas>();
    });
  });
});
