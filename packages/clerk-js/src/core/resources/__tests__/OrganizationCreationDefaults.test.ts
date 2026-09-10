import type { OrganizationCreationDefaultsJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { OrganizationCreationDefaults } from '../OrganizationCreationDefaults';

describe('OrganizationCreationDefaults', () => {
  it('exposes an advisory from the backend when severity is absent', () => {
    const response = {
      advisory: {
        code: 'organization_already_exists',
        meta: { organization_domain: 'clerk.dev', organization_name: 'Clerk' },
      },
      form: { name: 'My Organization', slug: 'my-organization', logo: null, blur_hash: null },
    } as OrganizationCreationDefaultsJSON;
    const defaults = new OrganizationCreationDefaults(response);
    expect(defaults.advisory).toEqual({ ...response.advisory, severity: 'warning' });
    expect(defaults.__internal_toSnapshot().advisory).toEqual(defaults.advisory);
    expect(response.advisory).not.toHaveProperty('severity');
  });

  it('preserves an explicitly supplied advisory severity', () => {
    const response = {
      advisory: { code: 'organization_already_exists', severity: 'warning', meta: {} },
      form: { name: '', slug: '', logo: null, blur_hash: null },
    } as OrganizationCreationDefaultsJSON;
    expect(new OrganizationCreationDefaults(response).advisory).toEqual(response.advisory);
  });
});
