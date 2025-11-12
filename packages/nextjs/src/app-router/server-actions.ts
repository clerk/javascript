'use server';

import { constants } from '@clerk/backend/internal';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This function needs to be async as we'd like to support next versions in the range of [14.1.2,14.2.0)
// These versions required 'use server' files to export async methods only. This check was later relaxed
// and the async is no longer required in newer next versions.
// ref: https://github.com/vercel/next.js/pull/62821
export async function invalidateCacheAction(): Promise<void> {
  void (await cookies()).delete(`__clerk_invalidate_cache_cookie_${Date.now()}`);
}

export async function handleSync() {
  'use server';

  const requestState = await import('../server/createGetAuth.js').then(mod => mod.getAuthDataByAuthenticatingRequest());

  interface CookieObject {
    name: string;
    value: string;
    path?: string;
    domain?: string;
    expires?: string;
    maxAge?: number;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    httpOnly?: boolean;
  }

  function parseCookie(cookieString: string): CookieObject {
    const parts = cookieString.split(';').map(part => part.trim());

    // First part is always name=value
    const [nameValue, ...attributes] = parts;
    const [name, value] = nameValue.split('=');

    const cookie: CookieObject = {
      name: name.trim(),
      value: value || '',
    };

    // Parse attributes
    attributes.forEach(attr => {
      const [key, val] = attr.split('=').map(s => s.trim());
      const lowerKey = key.toLowerCase();

      switch (lowerKey) {
        case 'path':
          cookie.path = val;
          break;
        case 'domain':
          cookie.domain = val;
          break;
        case 'expires':
          cookie.expires = val;
          break;
        case 'max-age':
          cookie.maxAge = parseInt(val, 10);
          break;
        case 'samesite':
          cookie.sameSite = val as 'Strict' | 'Lax' | 'None';
          break;
        case 'secure':
          cookie.secure = true;
          break;
        case 'httponly':
          cookie.httpOnly = true;
          break;
      }
    });

    return cookie;
  }

  function parseSetCookies(cookieStrings: string[]): CookieObject[] {
    return cookieStrings.map(parseCookie);
  }

  // Usage
  // const cookies = [
  //   '__client_uat=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
  //   '__client_uat=0; Path=/; Domain=localhost; Max-Age=315360000; SameSite=Lax',
  //   '__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
  //   '__clerk_db_jwt=dvb_35OKMcl76AQdw6LFljEEAwehVpk; Path=/; Expires=Thu, 12 Nov 2026 19:27:10 GMT; SameSite=Lax',
  // ];

  const parsed = parseSetCookies(requestState.headers.getSetCookie());

  const cookieStore = await cookies();
  for (const cookie of parsed) {
    cookieStore.set(cookie.name, cookie.value, {
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      domain: cookie.domain,
    });
  }

  const locationHeader = requestState.headers.get(constants.Headers.Location);

  if (locationHeader) {
    console.log('redirecting to', locationHeader);
    redirect(locationHeader);
    // const res = NextResponse.redirect(locationHeader);
    // requestState.headers.forEach((value, key) => {
    //   if (key === constants.Headers.Location) {
    //     return;
    //   }
    //   res.headers.append(key, value);
    // });
    // return res;
  }
}
