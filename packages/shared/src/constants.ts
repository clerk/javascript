export const LEGACY_DEV_INSTANCE_SUFFIXES = ['.lcl.dev', '.lclstage.dev', '.lclclerk.com'];
export const CURRENT_DEV_INSTANCE_SUFFIXES = ['.accounts.dev', '.accountsstage.dev', '.accounts.lclclerk.com'];
export const DEV_OR_STAGING_SUFFIXES = [
  '.lcl.dev',
  '.stg.dev',
  '.lclstage.dev',
  '.stgstage.dev',
  '.dev.lclclerk.com',
  '.stg.lclclerk.com',
  '.accounts.lclclerk.com',
  'accountsstage.dev',
  'accounts.dev',
];
export const LOCAL_ENV_SUFFIXES = ['.lcl.dev', 'lclstage.dev', '.lclclerk.com', '.accounts.lclclerk.com'];
export const STAGING_ENV_SUFFIXES = ['.accountsstage.dev'];
export const LOCAL_API_URL = 'https://api.lclclerk.com';
export const STAGING_API_URL = 'https://api.clerkstage.dev';
export const PROD_API_URL = 'https://api.clerk.com';

export const LOCAL_FAPI_URL = 'https://frontend-api.lclclerk.com';
export const STAGING_FAPI_URL = 'https://frontend-api.clerkstage.dev';
export const PROD_FAPI_URL = 'https://frontend-api.clerk.dev';

export const DEFAULT_PROXY_PATH = '/__clerk';

/**
 * Returns the URL for a static image
 * using the new img.clerk.com service
 */
export function iconImageUrl(id: string, format: 'svg' | 'jpeg' = 'svg'): string {
  return `https://img.clerk.com/static/${id}.${format}`;
}
