import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { OrganizationProfile } from '..';

export type OrganizationProfileComponentProps = React.ComponentProps<typeof OrganizationProfile>;

describe('<OrganizationProfile/>', () => {
  describe('Type tests', () => {
    test('has path filled', () => {
      expectTypeOf({ path: '/org' }).toMatchTypeOf<OrganizationProfileComponentProps>();
    });

    test('has path filled and routing has path as a value', () => {
      expectTypeOf({
        path: '/org',
        routing: 'path' as const,
      }).toMatchTypeOf<OrganizationProfileComponentProps>();
    });

    test('when path is filled, routing must only have path as value', () => {
      expectTypeOf({
        path: '/org',
        routing: 'virtual' as const,
      }).not.toMatchTypeOf<OrganizationProfileComponentProps>();

      expectTypeOf({
        path: '/org',
        routing: 'hash' as const,
      }).not.toMatchTypeOf<OrganizationProfileComponentProps>();
    });

    test('when routing is hash or virtual path must be present', () => {
      expectTypeOf({
        routing: 'hash' as const,
      }).toMatchTypeOf<OrganizationProfileComponentProps>();
    });
  });
});
