import { createCookieHandler } from '@clerk/shared/cookie';
import { DEV_BROWSER_JWT_MARKER } from '@clerk/shared/devBrowser';

export const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_MARKER);
