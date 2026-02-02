import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';

// Simulated expensive operation that can be cached
async function getCachedUserData(userId: string) {
  'use cache';
  // This is the CORRECT pattern:
  // - auth() is called OUTSIDE the cache function
  // - Only the userId is passed into the cache function
  // - The cache function does not use any dynamic APIs
  return {
    userId,
    cachedAt: new Date().toISOString(),
    // Simulate fetching user-specific data that can be cached
    profile: {
      displayName: `User ${userId.slice(0, 8)}`,
      preferences: { theme: 'light' },
    },
  };
}

async function UseCacheCorrectContent() {
  // Step 1: Call auth() OUTSIDE the cache function
  const { userId } = await auth();

  if (!userId) {
    return (
      <>
        <p>Please sign in to test the caching pattern.</p>
        <div data-testid="signed-out">Not signed in</div>
      </>
    );
  }

  // Step 2: Pass userId INTO the cache function
  const userData = await getCachedUserData(userId);

  return (
    <>
      <p>
        This demonstrates the correct way to use <code>&quot;use cache&quot;</code> with Clerk:
      </p>
      <ol>
        <li>
          Call <code>auth()</code> <strong>outside</strong> the cache function
        </li>
        <li>
          Pass the <code>userId</code> <strong>into</strong> the cache function
        </li>
        <li>The cache function only contains cacheable operations</li>
      </ol>

      <div className="test-result success">
        <h3>Cached User Data:</h3>
        <pre data-testid="cached-data">{JSON.stringify(userData, null, 2)}</pre>
      </div>

      <pre>
        {`
// Correct pattern:
const { userId } = await auth();  // Outside cache
const data = await getCachedData(userId);  // Pass userId in

async function getCachedData(userId: string) {
  'use cache';
  // Only cacheable operations here
  return fetchUserProfile(userId);
}
        `}
      </pre>
    </>
  );
}

export default function UseCacheCorrectPage() {
  return (
    <main>
      <h1>&quot;use cache&quot; Correct Pattern</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <UseCacheCorrectContent />
      </Suspense>
    </main>
  );
}
