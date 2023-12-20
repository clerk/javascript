import { DEV_BROWSER_JWT_MARKER } from '@clerk/shared';
import { createCookieHandler } from '@clerk/shared/cookie';

export const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_MARKER);
