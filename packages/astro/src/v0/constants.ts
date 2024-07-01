const apiKey = import.meta.env.CLERK_API_KEY || '';

const secretKey = import.meta.env.CLERK_SECRET_KEY || '';

const apiVersion = import.meta.env.CLERK_API_VERSION || 'v1';

const apiUrl = import.meta.env.CLERK_API_URL || 'https://api.clerk.dev';

const frontendApi = import.meta.env.PUBLIC_ASTRO_APP_CLERK_FRONTEND_API || '';

const publishableKey = import.meta.env.PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY || '';

const signInUrl = import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL || ('' as string);

const signUpUrl = import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL || ('' as string);

const jwtKey = import.meta.env.CLERK_JWT_KEY || '';

const PUBLISHABLE_KEY = publishableKey;
const SECRET_KEY = secretKey;
const SIGN_IN_URL = signInUrl;
const SIGN_UP_URL = signUpUrl;
const DOMAIN = import.meta.env.PUBLIC_ASTRO_APP_CLERK_DOMAIN || ('' as string);
const PROXY_URL = import.meta.env.PUBLIC_ASTRO_APP_CLERK_PROXY_URL || ('' as string);
const IS_SATELLITE = import.meta.env.PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE === 'true';
const API_VERSION = import.meta.env.CLERK_API_VERSION || 'v1';
const API_URL = import.meta.env.CLERK_API_URL || 'https://api.clerk.dev';

const CLERK_JS_URL = import.meta.env.PUBLIC_ASTRO_APP_CLERK_JS_URL;
const CLERK_JS_VARIANT = import.meta.env.PUBLIC_ASTRO_APP_CLERK_JS_VARIANT;
const CLERK_JS_VERSION = import.meta.env.PUBLIC_ASTRO_APP_CLERK_JS_VERSION;

export {
  secretKey,
  apiKey,
  apiUrl,
  apiVersion,
  frontendApi,
  publishableKey,
  jwtKey,
  signInUrl,
  signUpUrl,
  PUBLISHABLE_KEY,
  SECRET_KEY,
  SIGN_IN_URL,
  SIGN_UP_URL,
  DOMAIN,
  PROXY_URL,
  IS_SATELLITE,
  API_URL,
  API_VERSION,
  CLERK_JS_URL,
  CLERK_JS_VARIANT,
  CLERK_JS_VERSION,
};
