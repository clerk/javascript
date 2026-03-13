'use client';
import { useAuth } from '@clerk/nextjs';

export default function UseAuthPage() {
  const { isLoaded, isSignedIn, userId, sessionId, orgId, orgRole, orgSlug, has } = useAuth();
  return (
    <div>
      <h1>useAuth Hook</h1>
      <div data-testid='is-loaded'>{String(isLoaded)}</div>
      <div data-testid='is-signed-in'>{String(isSignedIn)}</div>
      <div data-testid='user-id'>{String(userId)}</div>
      <div data-testid='session-id'>{String(sessionId)}</div>
      <div data-testid='org-id'>{String(orgId)}</div>
      <div data-testid='org-role'>{String(orgRole)}</div>
      <div data-testid='org-slug'>{String(orgSlug)}</div>
      {isLoaded && <div data-testid='has-org-admin'>{String(has?.({ role: 'org:admin' }) ?? 'no-org')}</div>}
    </div>
  );
}
