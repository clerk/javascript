import { Suspense } from 'react';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

// Simulated cached operation that fetches additional user data
async function getCachedUserProfile(userId: string) {
  'use cache';
  // This is the CORRECT pattern:
  // - currentUser() is called OUTSIDE the cache function
  // - Only the userId is passed into the cache function
  // - The cache function uses clerkClient() which is allowed in cache contexts
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return {
    userId,
    cachedAt: new Date().toISOString(),
    profile: {
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown',
      emailCount: user.emailAddresses?.length ?? 0,
    },
  };
}

async function CurrentUserCacheContent() {
  // Step 1: Call currentUser() OUTSIDE the cache function
  const user = await currentUser();

  if (!user) {
    return (
      <>
        <p>Please sign in to test the caching pattern with currentUser().</p>
        <div data-testid='signed-out'>Not signed in</div>
      </>
    );
  }

  // Step 2: Pass userId INTO the cache function
  const cachedProfile = await getCachedUserProfile(user.id);

  return (
    <>
      <p>
        This demonstrates the correct way to use <code>&quot;use cache&quot;</code> with currentUser():
      </p>
      <ol>
        <li>
          Call <code>currentUser()</code> <strong>outside</strong> the cache function
        </li>
        <li>
          Pass the <code>userId</code> <strong>into</strong> the cache function
        </li>
        <li>
          Use <code>clerkClient()</code> inside the cache function (allowed)
        </li>
      </ol>

      <div className='test-result success'>
        <h3>Cached Profile Data:</h3>
        <pre data-testid='cached-profile'>{JSON.stringify(cachedProfile, null, 2)}</pre>
      </div>

      <div data-testid='current-user-id'>{user.id}</div>

      <pre>
        {`
// Correct pattern:
const user = await currentUser();  // Outside cache
if (user) {
  const profile = await getCachedProfile(user.id);  // Pass userId in
}

async function getCachedProfile(userId: string) {
  'use cache';
  const client = await clerkClient();
  return client.users.getUser(userId);
}
        `}
      </pre>
    </>
  );
}

export default function CurrentUserCacheCorrectPage() {
  return (
    <main>
      <h1>currentUser() with &quot;use cache&quot; Correct Pattern</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <CurrentUserCacheContent />
      </Suspense>
    </main>
  );
}
