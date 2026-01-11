/**
 * Represents an accountless application created in keyless mode.
 *
 * This interface matches the shape of `AccountlessApplication` from `@clerk/backend`.
 * We define it here to avoid a circular dependency (shared cannot depend on backend).
 * Framework packages that depend on both shared and backend can use either type
 * interchangeably since they have the same structure.
 */
export interface AccountlessApplication {
  readonly publishableKey: string;
  readonly secretKey: string;
  readonly claimUrl: string;
  readonly apiKeysUrl: string;
}

/**
 * Public-facing keyless application data (without secret key).
 */
export type PublicKeylessApplication = Omit<AccountlessApplication, 'secretKey'>;
