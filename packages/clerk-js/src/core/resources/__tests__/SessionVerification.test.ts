import { afterEach, describe, expect, it } from 'vitest';

import { SessionVerification } from '../SessionVerification';

describe('SessionVerification', () => {
  describe('supportedSecondFactors', () => {
    const originalClerk = SessionVerification.clerk;
    const json = {
      object: 'session_verification',
      id: 'sessverify_123',
      status: 'needs_second_factor',
      level: 'multi_factor',
      session: null,
      supported_first_factors: [],
      supported_second_factors: [{ strategy: 'passkey' }, { strategy: 'totp' }],
      first_factor_verification: null,
      second_factor_verification: null,
    } as any;

    afterEach(() => {
      SessionVerification.clerk = originalClerk;
    });

    it('keeps the passkey second factor when the loaded UI supports it', () => {
      SessionVerification.clerk = { __internal_uiSupports: () => true } as any;
      const verification = new SessionVerification(json);

      expect(verification.supportedSecondFactors?.map(f => f.strategy)).toEqual(['passkey', 'totp']);
    });

    it('omits the passkey second factor when the loaded UI does not support it', () => {
      SessionVerification.clerk = { __internal_uiSupports: () => false } as any;
      const verification = new SessionVerification(json);

      expect(verification.supportedSecondFactors?.map(f => f.strategy)).toEqual(['totp']);
      expect(verification.supportedSecondFactors).toBe(verification.supportedSecondFactors);
    });
  });
});
