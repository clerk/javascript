import { expectTypeOf } from 'expect-type';

import type { __experimental_protectAction as protectAction } from '../server/protectAction';

// type ClerkProviderProps = Parameters<typeof ClerkProvider>[0];

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
          expectTypeOf(_auth).toMatchTypeOf<{
            userId: string;
            orgId: string | null | undefined;
            sessionId: string;
            orgRole: string | undefined | null;
            orgPermissions: string[] | undefined | null;
          }>();
        });
      });

      it('2', () => {
        __experimental_protectAction()
          .with({ role: 'admin' })
          .action(_auth => {
            expectTypeOf(_auth).toMatchTypeOf<{
              userId: string;
              orgId: string;
              sessionId: string;
              orgRole: string;
              orgPermissions: string[];
            }>();
          });
      });
    });
  });

  // describe('Multi domain', () => {
  //   const defaultProps = { children: '' };
  //
  //   it('proxyUrl (primary app)', () => {
  //     expectTypeOf({ ...defaultProps, proxyUrl: 'test' }).toMatchTypeOf<ClerkProviderProps>();
  //   });
  //
  //   it('proxyUrl + isSatellite (satellite app)', () => {
  //     expectTypeOf({ ...defaultProps, proxyUrl: 'test', isSatellite: true }).toMatchTypeOf<ClerkProviderProps>();
  //   });
  //
  //   it('domain + isSatellite (satellite app)', () => {
  //     expectTypeOf({ ...defaultProps, domain: 'test', isSatellite: true }).toMatchTypeOf<ClerkProviderProps>();
  //   });
  //
  //   it('only domain is not allowed', () => {
  //     expectTypeOf({ ...defaultProps, domain: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
  //   });
  //
  //   it('only isSatellite is not allowed', () => {
  //     expectTypeOf({ ...defaultProps, isSatellite: true }).not.toMatchTypeOf<ClerkProviderProps>();
  //   });
  //
  //   it('proxyUrl + domain is not allowed', () => {
  //     expectTypeOf({ ...defaultProps, proxyUrl: 'test', domain: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
  //   });
  //
  //   it('proxyUrl + domain + isSatellite is not allowed', () => {
  //     expectTypeOf({
  //       ...defaultProps,
  //       proxyUrl: 'test',
  //       domain: 'test',
  //       isSatellite: true,
  //     }).not.toMatchTypeOf<ClerkProviderProps>();
  //   });
  // });
  //
  // describe('clerkJSVariant', () => {
  //   const defaultProps = { children: '' };
  //
  //   it('is either headless or empty', () => {
  //     expectTypeOf({ ...defaultProps, clerkJSVariant: 'headless' as const }).toMatchTypeOf<ClerkProviderProps>();
  //     expectTypeOf({ ...defaultProps, clerkJSVariant: '' as const }).toMatchTypeOf<ClerkProviderProps>();
  //     expectTypeOf({ ...defaultProps, clerkJSVariant: undefined }).toMatchTypeOf<ClerkProviderProps>();
  //     expectTypeOf({ ...defaultProps, clerkJSVariant: 'test' }).not.toMatchTypeOf<ClerkProviderProps>();
  //   });
  // });
  //
  // describe('children', () => {
  //   it('errors if no children', () => {
  //     expectTypeOf({}).not.toMatchTypeOf<ClerkProviderProps>();
  //   });
  // });
});
