import { describe, expect, it } from 'vitest';

import { getCurrentOrganizationMembership } from '../organization';
import type { OrganizationMembershipResource } from '../types';

describe('getCurrentOrganizationMembership', () => {
  const mockMemberships: OrganizationMembershipResource[] = [
    {
      id: 'mem_1',
      organization: { id: 'org_1' },
    } as OrganizationMembershipResource,
    {
      id: 'mem_2',
      organization: { id: 'org_2' },
    } as OrganizationMembershipResource,
  ];

  it('returns the correct membership for a given organization ID', () => {
    const result = getCurrentOrganizationMembership(mockMemberships, 'org_1');
    expect(result).toBe(mockMemberships[0]);
  });

  it('returns undefined when organization ID is not found', () => {
    const result = getCurrentOrganizationMembership(mockMemberships, 'org_nonexistent');
    expect(result).toBeUndefined();
  });

  it('returns undefined when memberships array is empty', () => {
    const result = getCurrentOrganizationMembership([], 'org_1');
    expect(result).toBeUndefined();
  });
});
