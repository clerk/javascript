import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';

async function AuthContent() {
  const { userId, sessionId } = await auth();

  return (
    <>
      <div className={`test-result ${userId ? 'success' : ''}`}>
        <h3>Auth Result:</h3>
        <pre>
          {JSON.stringify(
            {
              userId: userId ?? null,
              sessionId: sessionId ?? null,
              isSignedIn: !!userId,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div data-testid="user-id">{userId ?? 'Not signed in'}</div>
      <div data-testid="session-id">{sessionId ?? 'No session'}</div>
    </>
  );
}

export default function AuthServerComponentPage() {
  return (
    <main>
      <h1>auth() in Server Component</h1>
      <p>This page tests using auth() in a standard React Server Component.</p>

      <Suspense fallback={<div>Loading auth...</div>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}
