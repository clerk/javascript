import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';

// This component uses auth() and should be rendered dynamically
async function AuthenticatedContent() {
  const { userId, sessionId } = await auth();

  return (
    <div className="test-result" data-testid="dynamic-content">
      <h3>Dynamic Content (requires auth):</h3>
      <pre>
        {JSON.stringify(
          {
            userId: userId ?? null,
            sessionId: sessionId ?? null,
            renderedAt: new Date().toISOString(),
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}

// This component can be statically rendered
function StaticContent() {
  return (
    <div className="test-result" data-testid="static-content">
      <h3>Static Content (can be pre-rendered):</h3>
      <p>This content is part of the static shell.</p>
      <p>This section was pre-rendered at build time.</p>
    </div>
  );
}

// Loading fallback for the dynamic portion
function AuthLoading() {
  return (
    <div className="test-result" data-testid="loading-fallback">
      <h3>Loading...</h3>
      <p>Fetching authentication state...</p>
    </div>
  );
}

export default function PPRAuthPage() {
  return (
    <main>
      <h1>PPR with auth()</h1>
      <p>
        This page tests Partial Pre-Rendering (PPR) with <code>auth()</code>.
        The static content should be pre-rendered, while the authenticated
        content is streamed in dynamically.
      </p>

      <StaticContent />

      <Suspense fallback={<AuthLoading />}>
        <AuthenticatedContent />
      </Suspense>
    </main>
  );
}
