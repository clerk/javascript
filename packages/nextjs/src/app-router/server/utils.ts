import { NextRequest } from 'next/server';

const CLERK_USE_CACHE_MARKER = Symbol.for('clerk_use_cache_error');

/**
 * Custom error class for "use cache" errors with a symbol marker to prevent double-wrapping.
 */
export class ClerkUseCacheError extends Error {
  readonly [CLERK_USE_CACHE_MARKER] = true;

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'ClerkUseCacheError';
  }
}

export const isClerkUseCacheError = (e: unknown): e is ClerkUseCacheError => {
  return e instanceof Error && CLERK_USE_CACHE_MARKER in e;
};

// Patterns for Next.js "use cache" errors - tightened to reduce false positives
const USE_CACHE_WITH_DYNAMIC_API_PATTERN =
  /inside\s+"use cache"|"use cache".*(?:headers|cookies)|(?:headers|cookies).*"use cache"/i;
const CACHE_SCOPE_PATTERN = /cache scope/i;
const DYNAMIC_DATA_SOURCE_PATTERN = /dynamic data source/i;
// https://github.com/vercel/next.js/pull/61332
const ROUTE_BAILOUT_PATTERN = /Route .*? needs to bail out of prerendering at this point because it used .*?./;

export const isPrerenderingBailout = (e: unknown) => {
  if (!(e instanceof Error) || !('message' in e)) {
    return false;
  }

  const { message } = e;
  const lowerCaseInput = message.toLowerCase();

  return (
    ROUTE_BAILOUT_PATTERN.test(message) ||
    lowerCaseInput.includes('dynamic server usage') ||
    lowerCaseInput.includes('this page needs to bail out of prerendering') ||
    lowerCaseInput.includes('during prerendering')
  );
};

/**
 * Detects Next.js errors from using dynamic APIs (headers/cookies) inside "use cache".
 */
export const isNextjsUseCacheError = (e: unknown): boolean => {
  if (!(e instanceof Error)) {
    return false;
  }

  const { message } = e;

  // "use cache" with dynamic API context (e.g., 'used `headers()` inside "use cache"')
  if (USE_CACHE_WITH_DYNAMIC_API_PATTERN.test(message)) {
    return true;
  }

  // "cache scope" with dynamic data source (e.g., 'Dynamic data sources inside a cache scope')
  if (CACHE_SCOPE_PATTERN.test(message) && DYNAMIC_DATA_SOURCE_PATTERN.test(message)) {
    return true;
  }

  return false;
};

export const USE_CACHE_ERROR_MESSAGE =
  `Clerk: auth() and currentUser() cannot be called inside a "use cache" function. ` +
  `These functions access \`headers()\` internally, which is a dynamic API not allowed in cached contexts.\n\n` +
  `To fix this, call auth() outside the cached function and pass the values you need as arguments:\n\n` +
  `  import { auth, clerkClient } from '@clerk/nextjs/server';\n\n` +
  `  async function getCachedUser(userId: string) {\n` +
  `    "use cache";\n` +
  `    const client = await clerkClient();\n` +
  `    return client.users.getUser(userId);\n` +
  `  }\n\n` +
  `  // In your component/page:\n` +
  `  const { userId } = await auth();\n` +
  `  if (userId) {\n` +
  `    const user = await getCachedUser(userId);\n` +
  `  }`;

export async function buildRequestLike(): Promise<NextRequest> {
  try {
    // @ts-expect-error - Dynamically import to avoid breaking Next 12 apps
    const { headers } = await import('next/headers');
    const resolvedHeaders = await headers();
    return new NextRequest('https://placeholder.com', { headers: resolvedHeaders });
  } catch (e: any) {
    // https://nextjs.org/docs/messages/ppr-caught-error
    if (e && isPrerenderingBailout(e)) {
      throw e;
    }

    if (e && isNextjsUseCacheError(e)) {
      throw new ClerkUseCacheError(`${USE_CACHE_ERROR_MESSAGE}\n\nOriginal error: ${e.message}`, e);
    }

    throw new Error(
      `Clerk: auth(), currentUser() and clerkClient(), are only supported in App Router (/app directory).\nIf you're using /pages, try getAuth() instead.\nOriginal error: ${e}`,
    );
  }
}

// Original source: https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/get-script-nonce-from-header.tsx
export function getScriptNonceFromHeader(cspHeaderValue: string): string | undefined {
  const directives = cspHeaderValue
    // Directives are split by ';'.
    .split(';')
    .map(directive => directive.trim());

  // First try to find the directive for the 'script-src', otherwise try to
  // fallback to the 'default-src'.
  const directive =
    directives.find(dir => dir.startsWith('script-src')) || directives.find(dir => dir.startsWith('default-src'));

  // If no directive could be found, then we're done.
  if (!directive) {
    return;
  }

  // Extract the nonce from the directive
  const nonce = directive
    .split(' ')
    // Remove the 'strict-src'/'default-src' string, this can't be the nonce.
    .slice(1)
    .map(source => source.trim())
    // Find the first source with the 'nonce-' prefix.
    .find(source => source.startsWith("'nonce-") && source.length > 8 && source.endsWith("'"))
    // Grab the nonce by trimming the 'nonce-' prefix.
    ?.slice(7, -1);

  // If we couldn't find the nonce, then we're done.
  if (!nonce) {
    return;
  }

  // Don't accept the nonce value if it contains HTML escape characters.
  // Technically, the spec requires a base64'd value, but this is just an
  // extra layer.
  if (/[&><\u2028\u2029]/g.test(nonce)) {
    throw new Error(
      'Nonce value from Content-Security-Policy contained invalid HTML escape characters, which is disallowed for security reasons. Make sure that your nonce value does not contain the following characters: `<`, `>`, `&`',
    );
  }

  return nonce;
}
