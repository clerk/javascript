/* Code below is taken from https://github.com/vercel/next.js/blob/fe7ff3f468d7651a92865350bfd0f16ceba27db5/packages/next/src/shared/lib/utils.ts. LICENSE: MIT */

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
export const isAbsoluteUrl = (url: string) => ABSOLUTE_URL_REGEX.test(url);
