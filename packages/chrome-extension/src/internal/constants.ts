export const AUTH_HEADER = {
  PRODUCTION: 'Authorization',
  DEVELOPMENT: '__clerk_db_jwt',
};

export const CLIENT_JWT_KEY = '__client';
export const DEFAULT_LOCAL_HOST_PERMISSION = 'http://localhost';
export const STORAGE_KEY_CLIENT_JWT = '__clerk_client_jwt';

// Environment Variables

export const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  '';

export const SYNC_HOST =
  process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST ||
  process.env.VITE_CLERK_SYNC_HOST ||
  process.env.CLERK_SYNC_HOST ||
  undefined;
