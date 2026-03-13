'use client';
import { useOrganization } from '@clerk/nextjs';

export default function UseOrganizationPage() {
  const { isLoaded, organization, membership } = useOrganization();
  return (
    <div>
      <h1>useOrganization Hook</h1>
      <div data-testid='is-loaded'>{String(isLoaded)}</div>
      <div data-testid='org-id'>{String(organization?.id)}</div>
      <div data-testid='org-name'>{String(organization?.name)}</div>
      <div data-testid='org-slug'>{String(organization?.slug)}</div>
      <div data-testid='membership-role'>{String(membership?.role)}</div>
    </div>
  );
}
