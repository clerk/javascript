'use server';

import { cookies } from 'next/headers';

// This function needs to be async as we'd like to support next versions in the range of [14.1.2,14.2.0)
// These versions required 'use server' files to export async methods only. This check was later relaxed
// and the async is no longer required in newer next versions.
// ref: https://github.com/vercel/next.js/pull/62821
export async function invalidateCacheAction() {
  return cookies().delete(`__clerk_invalidate_cache_cookie_${Date.now()}`);
}
