import type { OrganizationMembershipResource, OrganizationResource } from '@clerk/shared/types';
import { describe, expect, test } from 'vitest';

import { filterExclusiveMemberships } from '../filterExclusiveMemberships';

type TestMembership = Pick<OrganizationMembershipResource, 'organization'> & { id: string };

const createMembership = (id: string, exclusiveMembership: boolean): TestMembership => ({
  id,
  organization: { id: `org_${id}`, exclusiveMembership } as OrganizationResource,
});

describe('filterExclusiveMemberships', () => {
  test('returns an empty list with hasExclusive false for an empty input', () => {
    const result = filterExclusiveMemberships<TestMembership>([]);

    expect(result.hasExclusive).toBe(false);
    expect(result.memberships).toEqual([]);
  });

  test('returns the input unchanged with hasExclusive false when no membership is exclusive', () => {
    const memberships = [createMembership('1', false), createMembership('2', false), createMembership('3', false)];

    const result = filterExclusiveMemberships(memberships);

    expect(result.hasExclusive).toBe(false);
    expect(result.memberships).toBe(memberships);
  });

  test('returns only the exclusive membership when one exclusive is present among non-exclusive ones', () => {
    const exclusive = createMembership('2', true);
    const memberships = [createMembership('1', false), exclusive, createMembership('3', false)];

    const result = filterExclusiveMemberships(memberships);

    expect(result.hasExclusive).toBe(true);
    expect(result.memberships).toEqual([exclusive]);
  });

  test('returns all memberships when every membership is exclusive', () => {
    const memberships = [createMembership('1', true), createMembership('2', true)];

    const result = filterExclusiveMemberships(memberships);

    expect(result.hasExclusive).toBe(true);
    expect(result.memberships).toEqual(memberships);
  });

  test('returns only the exclusive memberships when multiple exclusive are mixed with non-exclusive', () => {
    const exclusiveA = createMembership('1', true);
    const exclusiveB = createMembership('3', true);
    const memberships = [exclusiveA, createMembership('2', false), exclusiveB, createMembership('4', false)];

    const result = filterExclusiveMemberships(memberships);

    expect(result.hasExclusive).toBe(true);
    expect(result.memberships).toEqual([exclusiveA, exclusiveB]);
  });
});
