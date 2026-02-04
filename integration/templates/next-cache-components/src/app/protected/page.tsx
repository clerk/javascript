import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';

async function ProtectedContent() {
  const { userId, sessionId } = await auth();

  return (
    <div className='test-result success'>
      <h3>Auth Info:</h3>
      <pre>
        {JSON.stringify(
          {
            userId,
            sessionId,
            isSignedIn: true,
          },
          null,
          2,
        )}
      </pre>
      <div data-testid='protected-user-id'>{userId}</div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <main>
      <h1>Protected Route</h1>
      <p>
        This page is protected by proxy using <code>auth.protect()</code>.
      </p>
      <p>If you can see this, you are authenticated!</p>

      <Suspense fallback={<div>Loading auth info...</div>}>
        <ProtectedContent />
      </Suspense>
    </main>
  );
}
