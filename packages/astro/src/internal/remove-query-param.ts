export const NETLIFY_CACHE_BUST_PARAM = '__netlify_clerk_cache_bust';

/**
 * Removes the temporary cache bust parameter that prevents infinite redirects
 * in Netlify and Clerk's dev instance.
 */
export function removeNetlifyCacheBustParam() {
  const url = new URL(window.location.href);
  if (url.searchParams.has(NETLIFY_CACHE_BUST_PARAM)) {
    url.searchParams.delete(NETLIFY_CACHE_BUST_PARAM);
    window.history.replaceState(window.history.state, '', url);
  }
}
