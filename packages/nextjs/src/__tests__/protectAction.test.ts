import { expectTypeOf } from 'expect-type';

import type { __experimental_protectAction as protectAction } from '../server/protectAction';

const __experimental_protectAction = (() => {
  const creator = () => {
    return {
      with: () => creator(),
      action: () => () => {},
    };
  };
  return creator();
}) as unknown as typeof protectAction;

describe('__experimental_protectAction', () => {
  describe('Type tests', () => {
    describe('signed out', () => {
      it('1', () => {
        const action = __experimental_protectAction().action(() => ({
          test: '1234',
        }));
        const res = action();
        expectTypeOf(res).toMatchTypeOf<{ clerk_error: { type: 'unauthorized'; reason: 'signed-out' } }>();
      });

      it('2', () => {
        const action = __experimental_protectAction().action(() => ({
          test: '1234',
        }));
        const res = action();
        expectTypeOf(res).not.toMatchTypeOf<{ clerk_error: { type: 'forbidden'; reason: any } }>();
      });

      it('3', () => {
        const action = __experimental_protectAction().action(() => ({
          test: '1234',
        }));
        const res = action();
        expectTypeOf(res).toMatchTypeOf<{ test: string }>();
      });
    });

    it('1', () => {
      expectTypeOf(__experimental_protectAction()).toMatchTypeOf<{
        with: any;
        action: any;
      }>();

      expectTypeOf(__experimental_protectAction().with({ role: '' })).toMatchTypeOf<{
        with: any;
        action: any;
      }>();

      expectTypeOf(__experimental_protectAction().with({ reverification: 'strict' })).not.toMatchTypeOf<{
        with: any;
        action: any;
      }>();

      expectTypeOf(__experimental_protectAction().with({ reverification: 'strict' })).toMatchTypeOf<{
        action: any;
      }>();
    });

    describe('signed out', () => {
      it('1', () => {
        const action = __experimental_protectAction()
          .with({
            reverification: 'strict',
          })
          .action(() => ({
            test: '1234',
          }));
        const res = action();

        expectTypeOf(res?.clerk_error?.type).toEqualTypeOf<'forbidden' | 'unauthorized'>();
        expectTypeOf(res?.clerk_error?.reason).toEqualTypeOf<'reverification-mismatch' | 'signed-out'>();
      });

      it('2', () => {
        const action = __experimental_protectAction()
          .with({
            role: 'admin',
          })
          .action(() => ({
            test: '1234',
          }));
        const res = action();

        expectTypeOf(res?.clerk_error?.type).toEqualTypeOf<'forbidden' | 'unauthorized'>();
        expectTypeOf(res?.clerk_error?.reason).toEqualTypeOf<'role-mismatch' | 'signed-out'>();
      });

      it('3', () => {
        const action = __experimental_protectAction()
          .with({
            permission: 'admin',
          })
          .action(() => ({
            test: '1234',
          }));
        const res = action();

        expectTypeOf(res?.clerk_error?.type).toEqualTypeOf<'forbidden' | 'unauthorized'>();
        expectTypeOf(res?.clerk_error?.reason).toEqualTypeOf<'permission-mismatch' | 'signed-out'>();
      });

      it('4', () => {
        const action = __experimental_protectAction()
          .with({
            permission: 'admin',
          })
          .with({
            role: 'dwadaw',
          })
          .action(() => ({
            test: '1234',
          }));
        const res = action();

        expectTypeOf(res?.clerk_error?.type).toEqualTypeOf<'forbidden' | 'unauthorized'>();
        expectTypeOf(res?.clerk_error?.reason).toEqualTypeOf<'role-mismatch' | 'permission-mismatch' | 'signed-out'>();
      });

      it('5', () => {
        const action = __experimental_protectAction()
          .with({
            permission: 'admin',
          })
          .with({
            role: 'dwadaw',
          })
          .with({
            reverification: 'lax',
          })
          .action(() => ({
            test: '1234',
          }));
        const res = action();

        expectTypeOf(res?.clerk_error?.type).toEqualTypeOf<'forbidden' | 'unauthorized'>();
        expectTypeOf(res?.clerk_error?.reason).toEqualTypeOf<
          'reverification-mismatch' | 'role-mismatch' | 'permission-mismatch' | 'signed-out'
        >();
      });
    });

    describe('auth param', () => {
      it('1', () => {
        __experimental_protectAction().action(_auth => {
          expectTypeOf(_auth.userId).toEqualTypeOf<string>();
          expectTypeOf(_auth.sessionId).toEqualTypeOf<string>();
          expectTypeOf(_auth.orgId).toEqualTypeOf<string | null | undefined>();
          expectTypeOf(_auth.orgRole).toEqualTypeOf<string | null | undefined>();
          expectTypeOf(_auth.orgPermissions).toEqualTypeOf<string[] | null | undefined>();
        });
      });

      it('2', () => {
        __experimental_protectAction()
          .with({ role: 'admin' })
          .action(_auth => {
            expectTypeOf(_auth.userId).toEqualTypeOf<string>();
            expectTypeOf(_auth.sessionId).toEqualTypeOf<string>();
            expectTypeOf(_auth.orgId).toEqualTypeOf<string>();
            expectTypeOf(_auth.orgRole).toEqualTypeOf<string>();
            expectTypeOf(_auth.orgPermissions).toEqualTypeOf<string[]>();
          });
      });
    });
  });
});
