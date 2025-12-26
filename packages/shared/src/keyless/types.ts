/**
 * Represents an accountless application created in keyless mode.
 * This matches the structure returned by the Clerk API.
 */
export interface AccountlessApplication {
  publishableKey: string;
  secretKey: string;
  claimUrl: string;
  apiKeysUrl: string;
}

/**
 * Public-facing keyless application data (without secret key).
 */
export type PublicKeylessApplication = Omit<AccountlessApplication, 'secretKey'>;
