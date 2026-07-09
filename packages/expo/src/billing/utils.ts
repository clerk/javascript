import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { BillingPlanResource, BillingPlanStoreProduct, BillingStore } from '@clerk/shared/types';

import { IAPBillingError } from './errors';
import { loadExpoCrypto } from './expoCrypto';

/**
 * The UUIDv5 namespace used to derive the Apple `appAccountToken` from a Clerk user ID. Must match the value used by
 * the Clerk backend and the native Clerk SDKs so the server-side user-binding cross-check succeeds.
 *
 * @internal
 */
export const APPLE_APP_ACCOUNT_TOKEN_NAMESPACE = '44adf70c-c536-4bb6-b3fb-1c965c25e307';

/**
 * Maps a React Native platform (`Platform.OS`) to the corresponding app store.
 *
 * @internal
 */
export function platformToStore(os: string): BillingStore {
  if (os === 'ios') {
    return 'apple';
  }
  if (os === 'android') {
    return 'google';
  }
  throw new IAPBillingError(
    'unsupported_platform',
    `In-app purchases are only available on iOS and Android (current platform: "${os}").`,
  );
}

/**
 * Resolves the store product to purchase for a Plan on the given store. A plan
 * can map any number of store purchase identities per store (the store's own
 * product type, purchase option, and renewal term govern billing): with
 * exactly one, it is the product; with several, the caller must identify the
 * product and, when needed, its purchase option.
 *
 * @internal
 */
export function resolveStoreProduct(
  plan: BillingPlanResource,
  store: BillingStore,
  productId?: string,
  purchaseOptionId?: string,
): BillingPlanStoreProduct {
  const candidates = (plan.storeProducts || []).filter(storeProduct => storeProduct.store === store);

  if (productId || purchaseOptionId) {
    const matches = candidates.filter(
      storeProduct =>
        (!productId || storeProduct.productId === productId) &&
        (!purchaseOptionId || storeProduct.purchaseOptionId === purchaseOptionId),
    );
    if (matches.length === 0) {
      throw new IAPBillingError(
        'store_product_not_found',
        `Plan "${plan.id}" has no ${store} mapping for product "${productId ?? '*'}"${purchaseOptionId ? ` and purchase option "${purchaseOptionId}"` : ''}. Map the exact store purchase option to this plan in the Clerk Dashboard.`,
      );
    }
    if (matches.length > 1) {
      throw new IAPBillingError(
        'ambiguous_store_product',
        `Product "${productId}" has multiple ${store} purchase options mapped. Pass options.purchaseOptionId to purchase() to choose one.`,
      );
    }
    return matches[0];
  }

  if (candidates.length === 0) {
    throw new IAPBillingError(
      'store_product_not_found',
      `Plan "${plan.id}" has no ${store} store product mapped. Map the store product ID to this plan in the Clerk Dashboard.`,
    );
  }
  if (candidates.length > 1) {
    const requiresPurchaseOption = new Set(candidates.map(candidate => candidate.productId)).size === 1;
    throw new IAPBillingError(
      'ambiguous_store_product',
      `Plan "${plan.id}" maps ${candidates.length} ${store} store products (${candidates
        .map(storeProduct =>
          storeProduct.purchaseOptionId
            ? `${storeProduct.productId}/${storeProduct.purchaseOptionId}`
            : storeProduct.productId,
        )
        .join(', ')}). Pass ${
        requiresPurchaseOption ? 'options.productId and options.purchaseOptionId' : 'options.productId'
      } to purchase() to choose one.`,
    );
  }
  return candidates[0];
}

/**
 * Extracts the payload that Clerk registers for a store purchase. `expo-iap` exposes a unified `purchaseToken` field
 * on `Purchase`: the StoreKit 2 signed JWS transaction representation on iOS and the Play Billing purchase token on
 * Android.
 *
 * @internal
 */
export function extractPurchasePayload(purchase: { productId: string; purchaseToken?: string | null }): string {
  const payload = purchase.purchaseToken;
  if (!payload) {
    throw new IAPBillingError(
      'purchase_payload_missing',
      `The store purchase for product "${purchase.productId}" did not include a purchase payload to register with Clerk.`,
    );
  }
  return payload;
}

/**
 * If the error is a Clerk API "already subscribed" conflict (the user already holds an active subscription through
 * another payment processor), returns the conflicting processor details. Returns `undefined` otherwise.
 *
 * @internal
 */
export function findAlreadySubscribedError(error: unknown): { alreadySubscribedVia?: string } | undefined {
  // The shared type guard throws on nullish input (it doubles as an error method), so guard first.
  if (!error || !isClerkAPIResponseError(error)) {
    return undefined;
  }
  const match = error.errors?.find(apiError => apiError.code === 'already_subscribed');
  if (!match) {
    return undefined;
  }
  return { alreadySubscribedVia: match.meta?.alreadySubscribedVia };
}

function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function utf8ToBytes(value: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }
  // Minimal UTF-8 encoder fallback for runtimes without TextEncoder.
  const bytes: number[] = [];
  for (const char of value) {
    const codePoint = char.codePointAt(0) as number;
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return Uint8Array.from(bytes);
}

/**
 * Derives the Apple `appAccountToken` for a Clerk user: UUIDv5 (SHA-1) of the raw user ID under
 * {@link APPLE_APP_ACCOUNT_TOKEN_NAMESPACE}. The Clerk backend cross-checks this token against the session user when
 * a purchase is registered.
 *
 * @internal
 */
export async function deriveAppleAppAccountToken(userId: string): Promise<string> {
  const Crypto = loadExpoCrypto();

  const namespaceBytes = uuidToBytes(APPLE_APP_ACCOUNT_TOKEN_NAMESPACE);
  const nameBytes = utf8ToBytes(userId);
  const data = new Uint8Array(namespaceBytes.length + nameBytes.length);
  data.set(namespaceBytes);
  data.set(nameBytes, namespaceBytes.length);

  const digest = new Uint8Array(await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA1, data));
  const bytes = digest.slice(0, 16);
  // Stamp the UUID version (5) and RFC 4122 variant bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

/**
 * Derives the Google `obfuscatedExternalAccountId` for a Clerk user: SHA-256 hex of the raw user ID, truncated to 64
 * characters. The Clerk backend cross-checks this value against the session user when a purchase is registered.
 *
 * @internal
 */
export async function deriveGoogleObfuscatedAccountId(userId: string): Promise<string> {
  const Crypto = loadExpoCrypto();

  const hex = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, userId, {
    encoding: Crypto.CryptoEncoding.HEX,
  });

  return hex.slice(0, 64);
}
