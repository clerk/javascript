import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';

async function CurrentUserContent() {
  const user = await currentUser();

  return (
    <>
      <div className={`test-result ${user ? 'success' : ''}`}>
        <h3>Current User Result:</h3>
        <pre>
          {JSON.stringify(
            {
              id: user?.id ?? null,
              firstName: user?.firstName ?? null,
              lastName: user?.lastName ?? null,
              primaryEmailAddress: user?.primaryEmailAddress?.emailAddress ?? null,
              isSignedIn: !!user,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div data-testid='current-user-id'>{user?.id ?? 'Not signed in'}</div>
      <div data-testid='current-user-email'>{user?.primaryEmailAddress?.emailAddress ?? 'No email'}</div>
    </>
  );
}

export default function CurrentUserServerComponentPage() {
  return (
    <main>
      <h1>currentUser() in Server Component</h1>
      <p>This page tests using currentUser() in a standard React Server Component.</p>

      <Suspense fallback={<div>Loading user...</div>}>
        <CurrentUserContent />
      </Suspense>
    </main>
  );
}
