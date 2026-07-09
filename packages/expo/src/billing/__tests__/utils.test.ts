import { createHash } from 'node:crypto';

import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { BillingPlanResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { IAPBillingError, isIAPBillingError } from '../errors';
import {
  deriveAppleAppAccountToken,
  deriveGoogleObfuscatedAccountId,
  extractPurchasePayload,
  findAlreadySubscribedError,
  platformToStore,
  resolveStoreProduct,
} from '../utils';

// The optional expo-crypto dependency is loaded through the relative ./expoCrypto module (vi.mock cannot intercept
// the synchronous require('expo-crypto') call itself). The mock reimplements the digest API with node:crypto.
vi.mock('../expoCrypto', () => {
  const nodeAlgorithm = (algorithm: string) => (algorithm === 'SHA-1' ? 'sha1' : 'sha256');
  return {
    loadExpoCrypto: () => ({
      CryptoDigestAlgorithm: { SHA1: 'SHA-1', SHA256: 'SHA-256' },
      CryptoEncoding: { HEX: 'hex' },
      digest: async (algorithm: string, data: Uint8Array) => {
        const hash = createHash(nodeAlgorithm(algorithm)).update(Buffer.from(data)).digest();
        return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
      },
      digestStringAsync: async (algorithm: string, data: string) =>
        createHash(nodeAlgorithm(algorithm)).update(data, 'utf8').digest('hex'),
    }),
  };
});

describe('platformToStore', () => {
  it('maps ios to apple and android to google', () => {
    expect(platformToStore('ios')).toBe('apple');
    expect(platformToStore('android')).toBe('google');
  });

  it('throws a typed error on unsupported platforms', () => {
    try {
      platformToStore('web');
      expect.unreachable();
    } catch (error) {
      expect(isIAPBillingError(error)).toBe(true);
      expect((error as IAPBillingError).code).toBe('unsupported_platform');
    }
  });
});

describe('resolveStoreProduct', () => {
  const plan = {
    id: 'plan_123',
    storeProducts: [
      { store: 'apple', productId: 'com.acme.pro.monthly' },
      { store: 'apple', productId: 'com.acme.pro.annual' },
      { store: 'google', productId: 'acme_pro_monthly' },
    ],
  } as BillingPlanResource;

  it('resolves the single mapped product for a store without options', () => {
    expect(resolveStoreProduct(plan, 'google').productId).toBe('acme_pro_monthly');
  });

  it('resolves by productId when several products are mapped for the store', () => {
    expect(resolveStoreProduct(plan, 'apple', 'com.acme.pro.annual').productId).toBe('com.acme.pro.annual');
    expect(resolveStoreProduct(plan, 'apple', 'com.acme.pro.monthly').productId).toBe('com.acme.pro.monthly');
  });

  it('throws a typed ambiguity error when several products are mapped and none is named', () => {
    try {
      resolveStoreProduct(plan, 'apple');
      expect.unreachable();
    } catch (error) {
      expect(isIAPBillingError(error)).toBe(true);
      expect((error as IAPBillingError).code).toBe('ambiguous_store_product');
      expect((error as IAPBillingError).message).toContain('com.acme.pro.monthly');
      expect((error as IAPBillingError).message).toContain('com.acme.pro.annual');
    }
  });

  it('throws a typed error when the named product is not mapped', () => {
    try {
      resolveStoreProduct(plan, 'google', 'acme_pro_annual');
      expect.unreachable();
    } catch (error) {
      expect(isIAPBillingError(error)).toBe(true);
      expect((error as IAPBillingError).code).toBe('store_product_not_found');
    }
  });

  it('throws a typed error when the plan has no store products', () => {
    const webOnlyPlan = { id: 'plan_456', storeProducts: [] } as unknown as BillingPlanResource;
    expect(() => resolveStoreProduct(webOnlyPlan, 'apple', 'month')).toThrowError(IAPBillingError);
  });

  it('uses the purchase option as part of a Google product identity', () => {
    const multiOptionPlan = {
      id: 'plan_456',
      storeProducts: [
        { store: 'google', productId: 'acme_pro', purchaseOptionId: 'monthly' },
        { store: 'google', productId: 'acme_pro', purchaseOptionId: 'annual' },
      ],
    } as BillingPlanResource;

    expect(resolveStoreProduct(multiOptionPlan, 'google', 'acme_pro', 'annual')).toMatchObject({
      productId: 'acme_pro',
      purchaseOptionId: 'annual',
    });
    expect(() => resolveStoreProduct(multiOptionPlan, 'google', 'acme_pro')).toThrowError(
      expect.objectContaining({ code: 'ambiguous_store_product' }),
    );
  });
});

describe('extractPurchasePayload', () => {
  it('returns the unified purchaseToken (iOS JWS / Android purchase token)', () => {
    expect(extractPurchasePayload({ productId: 'com.acme.pro.monthly', purchaseToken: 'signed.jws' })).toBe(
      'signed.jws',
    );
  });

  it('throws a typed error when the payload is missing', () => {
    try {
      extractPurchasePayload({ productId: 'com.acme.pro.monthly', purchaseToken: null });
      expect.unreachable();
    } catch (error) {
      expect(isIAPBillingError(error)).toBe(true);
      expect((error as IAPBillingError).code).toBe('purchase_payload_missing');
    }
  });
});

describe('findAlreadySubscribedError', () => {
  it('extracts the conflicting processor from an already_subscribed API error', () => {
    const error = new ClerkAPIResponseError('conflict', {
      status: 409,
      data: [
        {
          code: 'already_subscribed',
          message: 'Already subscribed',
          meta: { already_subscribed_via: 'stripe' },
        },
      ],
    });

    expect(findAlreadySubscribedError(error)).toEqual({ alreadySubscribedVia: 'stripe' });
  });

  it('returns undefined for other API errors', () => {
    const error = new ClerkAPIResponseError('bad request', {
      status: 400,
      data: [{ code: 'invalid_payload', message: 'Invalid payload' }],
    });

    expect(findAlreadySubscribedError(error)).toBeUndefined();
  });

  it('returns undefined for non-API errors', () => {
    expect(findAlreadySubscribedError(new Error('network'))).toBeUndefined();
    expect(findAlreadySubscribedError(undefined)).toBeUndefined();
  });
});

describe('user binding tokens', () => {
  it('derives the Apple appAccountToken (UUIDv5) matching the contract golden vector', async () => {
    await expect(deriveAppleAppAccountToken('user_2x1aBcD3fGhIjKlMnOpQrStUvWx')).resolves.toBe(
      '8e08cd79-73d8-53ba-b576-0286add357e6',
    );
  });

  it('stamps UUID version 5 and RFC 4122 variant bits', async () => {
    const token = await deriveAppleAppAccountToken('user_arbitrary');
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('derives the Google obfuscatedExternalAccountId as SHA-256 hex truncated to 64 chars', async () => {
    const userId = 'user_2x1aBcD3fGhIjKlMnOpQrStUvWx';
    const expected = createHash('sha256').update(userId, 'utf8').digest('hex').slice(0, 64);

    const token = await deriveGoogleObfuscatedAccountId(userId);
    expect(token).toBe(expected);
    expect(token).toHaveLength(64);
  });
});
