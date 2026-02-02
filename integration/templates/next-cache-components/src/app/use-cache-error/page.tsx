/**
 * NOTE: This test page documents the expected error behavior.
 *
 * Calling auth() inside a "use cache" function produces a build-time error:
 * "Route used `headers()` inside 'use cache'. Accessing Dynamic data sources
 * inside a cache scope is not supported."
 *
 * This is the EXPECTED behavior - Clerk's auth() cannot be used inside cache functions.
 *
 * The actual error code is commented out below for reference.
 */

export default function UseCacheErrorPage() {
  return (
    <main>
      <h1>&quot;use cache&quot; with auth() - Error Case</h1>
      <p>
        This page documents the expected error when calling <code>auth()</code> inside
        a <code>&quot;use cache&quot;</code> function.
      </p>

      <div className="test-result error">
        <h3>Expected Build Error:</h3>
        <pre data-testid="expected-error">
{`Route used \`headers()\` inside "use cache".
Accessing Dynamic data sources inside a cache scope is not supported.
If you need this data inside a cached function use \`headers()\`
outside of the cached function and pass the required dynamic data
in as an argument.`}
        </pre>
      </div>

      <div className="test-result">
        <h3>Why This Happens:</h3>
        <p>
          <code>auth()</code> internally uses <code>headers()</code> and <code>cookies()</code>
          to read authentication data. These are &quot;Dynamic APIs&quot; that cannot be used
          inside cache functions.
        </p>
      </div>

      <div className="test-result success">
        <h3>Correct Pattern:</h3>
        <pre>
{`// Call auth() OUTSIDE the cache function
const { userId } = await auth();

// Pass userId INTO the cache function
const data = await getCachedData(userId);

async function getCachedData(userId: string) {
  'use cache';
  // Only cacheable operations here
  return fetchUserProfile(userId);
}`}
        </pre>
        <p>
          See <a href="/use-cache-correct">/use-cache-correct</a> for a working example.
        </p>
      </div>

      <details>
        <summary>Code that would produce this error:</summary>
        <pre>
{`import { auth } from '@clerk/nextjs/server';

// This will ERROR at build time
async function getCachedAuthData() {
  'use cache';
  const { userId } = await auth(); // ERROR!
  return { userId };
}`}
        </pre>
      </details>
    </main>
  );
}
