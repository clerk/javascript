import { NextRequest } from 'next/server';

// Pre-compiled regex patterns for error detection
const USE_CACHE_PATTERN = /use cache|cache scope/i;
const DYNAMIC_CACHE_PATTERN = /dynamic data source/i;
// note: new error message syntax introduced in next@14.1.1-canary.21
// but we still want to support older versions.
// https://github.com/vercel/next.js/pull/61332 (dynamic-rendering.ts:153)
const ROUTE_BAILOUT_PATTERN = /Route .*? needs to bail out of prerendering at this point because it used .*?./;

export const isPrerenderingBailout = (e: unknown) => {
  if (!(e instanceof Error) || !('message' in e)) {
    return false;
  }

  const { message } = e;

  const lowerCaseInput = message.toLowerCase();
  const dynamicServerUsage = lowerCaseInput.includes('dynamic server usage');
  const bailOutPrerendering = lowerCaseInput.includes('this page needs to bail out of prerendering');

  // Next.js 16+ with cacheComponents: headers() rejects during prerendering
  // Error: "During prerendering, `headers()` rejects when the prerender is complete"
  const headersRejectsDuringPrerendering = lowerCaseInput.includes('during prerendering');

  return ROUTE_BAILOUT_PATTERN.test(message) || dynamicServerUsage || bailOutPrerendering || headersRejectsDuringPrerendering;
};

/**
 * Detects if the error is from using dynamic APIs inside a "use cache" component.
 * Next.js 16+ throws specific errors when headers(), cookies(), or other dynamic
 * APIs are accessed inside a cache scope.
 */
export const isNextjsUseCacheError = (e: unknown): boolean => {
  if (!(e instanceof Error)) {
    return false;
  }

  const { message } = e;

  // Check for "use cache" or "cache scope" mentions
  if (USE_CACHE_PATTERN.test(message)) {
    return true;
  }

  // Check compound pattern: requires both "dynamic data source" AND "cache"
  return DYNAMIC_CACHE_PATTERN.test(message) && message.toLowerCase().includes('cache');
};

/**
 * Error message for when auth()/currentUser() is called inside a "use cache" function.
 * Exported so it can be reused in auth.ts and currentUser.ts for consistent messaging.
 */
export const USE_CACHE_ERROR_MESSAGE =
  `Clerk: auth() and currentUser() cannot be called inside a "use cache" function. ` +
  `These functions access \`headers()\` internally, which is a dynamic API not allowed in cached contexts.\n\n` +
  `To fix this, call auth() outside the cached function and pass the userId as an argument:\n\n` +
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
    // Dynamically import next/headers, otherwise Next12 apps will break
    // @ts-expect-error: Cannot find module 'next/headers' or its corresponding type declarations.ts(2307)
    const { headers } = await import('next/headers');
    const resolvedHeaders = await headers();
    return new NextRequest('https://placeholder.com', { headers: resolvedHeaders });
  } catch (e: any) {
    // rethrow the error when react throws a prerendering bailout
    // https://nextjs.org/docs/messages/ppr-caught-error
    if (e && isPrerenderingBailout(e)) {
      throw e;
    }

    // Provide a helpful error message for "use cache" components
    if (e && isNextjsUseCacheError(e)) {
      throw new Error(`${USE_CACHE_ERROR_MESSAGE}\n\nOriginal error: ${e.message}`);
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
