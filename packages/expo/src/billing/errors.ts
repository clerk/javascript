/**
 * Error codes thrown by the in-app purchase billing surface.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type IAPBillingErrorCode =
  /**
   * The optional `expo-iap` module is not installed.
   */
  | 'expo_iap_unavailable'
  /**
   * The optional `expo-crypto` module is not installed. It is required to derive the store user-binding tokens.
   */
  | 'expo_crypto_unavailable'
  /**
   * In-app purchases are only available on iOS and Android.
   */
  | 'unsupported_platform'
  /** The store product can be displayed, but Clerk does not yet have a matching fulfillment model for it. */
  | 'unsupported_product_type'
  /**
   * The Plan has no store product mapped for the current platform and requested period.
   */
  | 'store_product_not_found'
  | 'ambiguous_store_product'
  /** The requested offer is not currently eligible/available from the store. */
  | 'offer_not_available'
  /** Apple promotional offers require a fresh server-generated signature. */
  | 'offer_signature_required'
  /**
   * The store purchase did not carry a payload (JWS transaction / purchase token) to register with Clerk.
   */
  | 'purchase_payload_missing'
  /**
   * A signed-in user is required.
   */
  | 'user_unavailable'
  /**
   * The store rejected or failed the purchase for a reason other than user cancellation.
   */
  | 'purchase_failed'
  /**
   * The store's subscription management surface could not be opened.
   */
  | 'manage_subscriptions_failed';

/**
 * A typed error thrown by the in-app purchase billing surface. Inspect `code` to branch on the failure reason.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class IAPBillingError extends Error {
  readonly code: IAPBillingErrorCode;
  // Declared explicitly because the package compiles against an ES2019 lib, which predates Error#cause.
  cause?: unknown;

  constructor(code: IAPBillingErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'IAPBillingError';
    this.code = code;
    this.cause = options?.cause;
  }
}

/**
 * Type guard that checks whether an error is an {@link IAPBillingError}.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export function isIAPBillingError(error: unknown): error is IAPBillingError {
  return error instanceof IAPBillingError;
}
