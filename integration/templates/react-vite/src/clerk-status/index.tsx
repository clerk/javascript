import { ClerkLoaded, ClerkLoading, ClerkFailed, ClerkDegraded, useClerk } from '@clerk/clerk-react';

export default function ClerkStatusPage() {
  const { loaded, status } = useClerk();

  return (
    <>
      <p>Status: {status}</p>
      <p>{status === 'loading' ? 'Clerk is loading' : null}</p>
      <p>{status === 'error' ? 'Clerk is out' : null}</p>
      <p>{status === 'degraded' ? 'Clerk is degraded' : null}</p>
      <p>{status === 'ready' ? 'Clerk is ready' : null}</p>
      <p>{status === 'ready' || status === 'degraded' ? 'Clerk is ready or degraded (loaded)' : null}</p>
      <p>{loaded ? 'Clerk is loaded' : null}</p>
      <p>{!loaded ? 'Clerk is NOT loaded' : null}</p>

      <ClerkDegraded>
        <p>(comp) Clerk is degraded</p>
      </ClerkDegraded>

      <ClerkLoaded>
        <p>(comp) Clerk is loaded,(ready or degraded)</p>
      </ClerkLoaded>

      <ClerkFailed>
        <p>(comp) Something went wrong with Clerk, refresh your page.</p>
      </ClerkFailed>

      <ClerkLoading>
        <p>(comp) Waiting for clerk to fail, ready or degraded.</p>
      </ClerkLoading>
    </>
  );
}
