import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { OrganizationSwitcher } from '..';

export type OrganizationSwitcherComponentProps = React.ComponentProps<typeof OrganizationSwitcher>;

describe('<OrganizationSwitcher/>', () => {
  describe('Type tests', () => {
    test('createOrganizationUrl is a string', () => {
      expectTypeOf({
        createOrganizationUrl: '/',
      }).toMatchTypeOf<OrganizationSwitcherComponentProps>();
    });

    test('createOrganizationUrl is a string and createOrganizationMode is navigation', () => {
      expectTypeOf({
        createOrganizationUrl: '/',
        createOrganizationMode: 'navigation' as const,
      }).toMatchTypeOf<OrganizationSwitcherComponentProps>();
    });

    test('createOrganizationUrl is a string and createOrganizationMode is not modal', () => {
      expectTypeOf({
        createOrganizationUrl: '/',
        createOrganizationMode: 'modal' as const,
      }).not.toMatchTypeOf<OrganizationSwitcherComponentProps>();
    });

    test('createOrganizationMode is modal and path must not been present', () => {
      expectTypeOf({
        createOrganizationMode: 'modal' as const,
      }).toMatchTypeOf<OrganizationSwitcherComponentProps>();
    });

    test('createOrganizationMode is navigation and path is not present', () => {
      expectTypeOf({
        createOrganizationMode: 'navigation' as const,
      }).not.toMatchTypeOf<OrganizationSwitcherComponentProps>();
    });
  });
});
