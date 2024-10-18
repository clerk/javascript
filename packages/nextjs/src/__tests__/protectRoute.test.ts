import { expectTypeOf } from 'expect-type';

import type { __experimental_protectRoute as protectRoute } from '../server/protectRoute';

const __experimental_protectRoute = (() => {
  const creator = () => {
    return {
      with: () => creator(),
      route: () => () => {},
    };
  };
  return creator();
}) as unknown as typeof protectRoute;

describe('__experimental_protectRoute', () => {
  describe('Type tests', () => {
    describe('signed out', () => {
      it('1', () => {
        expectTypeOf(__experimental_protectRoute()).toMatchTypeOf<{
          with: any;
          route: any;
        }>();

        expectTypeOf(__experimental_protectRoute().with({ role: '' })).toMatchTypeOf<{
          with: any;
          route: any;
        }>();

        expectTypeOf(__experimental_protectRoute().with({ reverification: 'strict' })).not.toMatchTypeOf<{
          with: any;
          route: any;
        }>();

        expectTypeOf(__experimental_protectRoute().with({ reverification: 'strict' })).toMatchTypeOf<{
          route: any;
        }>();
      });
    });

    describe('auth param', () => {
      it('1', () => {
        __experimental_protectRoute().route(_auth => {
          expectTypeOf(_auth.userId).toEqualTypeOf<string>();
          expectTypeOf(_auth.sessionId).toEqualTypeOf<string>();
          expectTypeOf(_auth.orgId).toEqualTypeOf<string | null | undefined>();
          expectTypeOf(_auth.orgRole).toEqualTypeOf<string | null | undefined>();
          expectTypeOf(_auth.orgPermissions).toEqualTypeOf<string[] | null | undefined>();

          return new Response();
        });
      });

      it('2', () => {
        __experimental_protectRoute()
          .with({ role: 'admin' })
          .route(_auth => {
            expectTypeOf(_auth.userId).toEqualTypeOf<string>();
            expectTypeOf(_auth.sessionId).toEqualTypeOf<string>();
            expectTypeOf(_auth.orgId).toEqualTypeOf<string>();
            expectTypeOf(_auth.orgRole).toEqualTypeOf<string>();
            expectTypeOf(_auth.orgPermissions).toEqualTypeOf<string[]>();

            return new Response();
          });
      });
    });
  });
});
