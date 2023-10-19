import { createCookieHandler } from '@clerk/shared/cookie';

import { DEV_BROWSER_JWT_MARKER } from '../devBrowser';

export const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_MARKER);
