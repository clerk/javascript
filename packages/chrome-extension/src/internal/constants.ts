// export const AUTH_HEADER = 'Authorization';
// export const AUTH_HEADER_DEV = '__clerk_db_jwt';

export const AUTH_HEADER = {
  PRODUCTION: 'Authorization',
  DEVELOPMENT: '__clerk_db_jwt',
};

export const CLIENT_JWT_KEY = '__client';
export const DEFAULT_LOCAL_HOST_PERMISSION = 'http://localhost';
export const STORAGE_KEY_CLIENT_JWT = '__clerk_client_jwt';

// Environment Variables

function getViteEnvVariable(name: string): string | undefined {
  const viteEnvName = `VITE_${name}`;

  // @ts-expect-error - Vite specific
  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[viteEnvName] === 'string') {
    // @ts-expect-error - Vite specific
    return import.meta.env[viteEnvName];
  }

  return undefined;
}

export const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  getViteEnvVariable('CLERK_PUBLISHABLE_KEY') ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  '';

export const SYNC_HOST =
  process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST ||
  getViteEnvVariable('CLERK_SYNC_HOST') ||
  process.env.CLERK_SYNC_HOST ||
  undefined;
