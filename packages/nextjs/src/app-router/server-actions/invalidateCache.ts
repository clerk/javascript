'use server';

import { cookies } from 'next/headers';

export function invalidateCacheAction() {
  return cookies().delete(`__clerk_invalidate_cache_cookie_${Date.now()}`);
}
