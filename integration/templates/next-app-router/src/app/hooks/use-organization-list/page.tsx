'use client';
import { useOrganizationList } from '@clerk/nextjs';

export default function UseOrganizationListPage() {
  const { isLoaded, userMemberships } = useOrganizationList({ userMemberships: true });
  return (
    <div>
      <h1>useOrganizationList Hook</h1>
      <div data-testid='is-loaded'>{String(isLoaded)}</div>
      <div data-testid='memberships-count'>{String(userMemberships?.count)}</div>
      <div data-testid='memberships-org-ids'>
        {JSON.stringify(userMemberships?.data?.map(m => m.organization.id) ?? [])}
      </div>
    </div>
  );
}
