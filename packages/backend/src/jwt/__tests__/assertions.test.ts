import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assertActivationClaim,
  assertAudienceClaim,
  assertAuthorizedPartiesClaim,
  assertExpirationClaim,
  assertHeaderAlgorithm,
  assertHeaderType,
  assertIssuedAtClaim,
  assertOAuthHeaderType,
  assertSubClaim,
  isOAuthAccessTokenJwt,
} from '../assertions';

function formatToUTCString(ts: number) {
  const tsDate = new Date(0);
  tsDate.setUTCSeconds(ts);
  return tsDate.toUTCString();
}

describe('assertAudienceClaim(audience?, aud?)', () => {
  const audience = 'http://audience.example';
  const otherAudience = 'http://audience-other.example';
  const invalidAudience = 'http://invalid-audience.example';

  it('does not throw error if aud is missing', () => {
    expect(() => assertAudienceClaim()).not.toThrow();
    expect(() => assertAudienceClaim(undefined)).not.toThrow();
    expect(() => assertAudienceClaim(undefined, audience)).not.toThrow();
    expect(() => assertAudienceClaim(undefined, [audience])).not.toThrow();
    expect(() => assertAudienceClaim('')).not.toThrow();
    expect(() => assertAudienceClaim('', audience)).not.toThrow();
    expect(() => assertAudienceClaim('', [audience])).not.toThrow();
    expect(() => assertAudienceClaim('', [audience, otherAudience])).not.toThrow();
  });

  it('does not throw error if audience is missing', () => {
    expect(() => assertAudienceClaim(undefined, undefined)).not.toThrow();
    expect(() => assertAudienceClaim(audience, undefined)).not.toThrow();
    expect(() => assertAudienceClaim([audience], undefined)).not.toThrow();
    expect(() => assertAudienceClaim(undefined, '')).not.toThrow();
    expect(() => assertAudienceClaim(audience, '')).not.toThrow();
    expect(() => assertAudienceClaim([audience], '')).not.toThrow();
    expect(() => assertAudienceClaim([audience, otherAudience], '')).not.toThrow();
  });

  it('does not throw error if aud contains empty values', () => {
    expect(() => assertAudienceClaim([], audience)).not.toThrow();
    expect(() => assertAudienceClaim([undefined, undefined], audience)).not.toThrow();
    expect(() => assertAudienceClaim([null, null], audience)).not.toThrow();
    expect(() => assertAudienceClaim([false, false], audience)).not.toThrow();
    expect(() => assertAudienceClaim(['', ''], [audience])).not.toThrow();
    expect(() => assertAudienceClaim(['', ''], [audience, otherAudience])).not.toThrow();
  });

  it('does not throw error if audience is empty or contains empty values', () => {
    expect(() => assertAudienceClaim(audience, [])).not.toThrow();
    expect(() => assertAudienceClaim(audience, [undefined, undefined])).not.toThrow();
    expect(() => assertAudienceClaim(audience, [null, null])).not.toThrow();
    expect(() => assertAudienceClaim(audience, [false, false])).not.toThrow();
    expect(() => assertAudienceClaim(audience, ['', ''])).not.toThrow();
    expect(() => assertAudienceClaim([audience], ['', ''])).not.toThrow();
    expect(() => assertAudienceClaim([audience, otherAudience], ['', ''])).not.toThrow();
  });

  it('does not throw error when audience matches aud', () => {
    expect(() => assertAudienceClaim(audience, audience)).not.toThrow();
  });

  it('does not throw error when audience list contains aud', () => {
    expect(() => assertAudienceClaim(audience, [audience, otherAudience])).not.toThrow();
  });

  it('does not throw error when audience string[] has intersection with aud string[]', () => {
    expect(() => assertAudienceClaim([audience], [audience, otherAudience])).not.toThrow();
    expect(() => assertAudienceClaim([audience, otherAudience], [audience])).not.toThrow();
  });

  it('throws error when audience does not match aud', () => {
    expect(() => assertAudienceClaim(audience, invalidAudience)).toThrow(
      `Invalid JWT audience claim (aud) "${audience}". Is not included in "${JSON.stringify([invalidAudience])}".`,
    );
  });

  it('throws error when audience is substring of aud', () => {
    expect(() => assertAudienceClaim(audience, audience.slice(0, -2))).toThrow(
      `Invalid JWT audience claim (aud) "${audience}". Is not included in "${JSON.stringify([audience.slice(0, -2)])}".`,
    );
  });

  it('throws error when audience is substring of an aud when aud is a string[]', () => {
    expect(() => assertAudienceClaim([audience, otherAudience], audience.slice(0, -2))).toThrow(
      `Invalid JWT audience claim array (aud) ${JSON.stringify([audience, otherAudience])}. Is not included in "${JSON.stringify([audience.slice(0, -2)])}".`,
    );
  });

  it('throws error when aud is a substring of audience', () => {
    expect(() => assertAudienceClaim(audience.slice(0, -2), audience)).toThrow(
      `Invalid JWT audience claim (aud) "${audience.slice(0, -2)}". Is not included in "${JSON.stringify([audience])}".`,
    );
  });

  it('throws error when aud is substring of an audience when audience is a string[]', () => {
    expect(() => assertAudienceClaim(audience.slice(0, -2), [audience, otherAudience])).toThrow(
      `Invalid JWT audience claim (aud) "${audience.slice(0, -2)}". Is not included in "${JSON.stringify([audience, otherAudience])}".`,
    );
  });
});

describe('assertHeaderType(typ?)', () => {
  it('does not throw error if type is missing', () => {
    expect(() => assertHeaderType(undefined)).not.toThrow();
  });

  it('throws error if type is not JWT', () => {
    expect(() => assertHeaderType('')).toThrow(`Invalid JWT type "". Expected "JWT".`);
    expect(() => assertHeaderType('Aloha')).toThrow(`Invalid JWT type "Aloha". Expected "JWT".`);
  });
});

describe('assertHeaderAlgorithm(alg)', () => {
  it('does not throw if algorithm is supported', () => {
    expect(() => assertHeaderAlgorithm('RS256')).not.toThrow();
    expect(() => assertHeaderAlgorithm('RS384')).not.toThrow();
    expect(() => assertHeaderAlgorithm('RS512')).not.toThrow();
  });

  it('throws error if algorithm is missing', () => {
    expect(() => assertHeaderAlgorithm('')).toThrow(`Invalid JWT algorithm "". Supported: RS256,RS384,RS512.`);
  });

  it('throws error if algorithm is not supported', () => {
    expect(() => assertHeaderAlgorithm('ES256')).toThrow(
      `Invalid JWT algorithm "ES256". Supported: RS256,RS384,RS512.`,
    );
    expect(() => assertHeaderAlgorithm('ES384')).toThrow(
      `Invalid JWT algorithm "ES384". Supported: RS256,RS384,RS512.`,
    );
    expect(() => assertHeaderAlgorithm('ES512')).toThrow(
      `Invalid JWT algorithm "ES512". Supported: RS256,RS384,RS512.`,
    );
    expect(() => assertHeaderAlgorithm('PS512')).toThrow(
      `Invalid JWT algorithm "PS512". Supported: RS256,RS384,RS512.`,
    );
    expect(() => assertHeaderAlgorithm('Aloha')).toThrow(
      `Invalid JWT algorithm "Aloha". Supported: RS256,RS384,RS512.`,
    );
  });
});

describe('assertSubClaim(sub?)', () => {
  it('does not throw if sub exists', () => {
    expect(() => assertSubClaim('')).not.toThrow();
  });

  it('throws error if sub is missing', () => {
    expect(() => assertSubClaim()).toThrow(`Subject claim (sub) is required and must be a string. Received undefined.`);
    expect(() => assertSubClaim(undefined)).toThrow(
      'Subject claim (sub) is required and must be a string. Received undefined.',
    );
  });
});

describe('assertAuthorizedPartiesClaim(azp?, authorizedParties?)', () => {
  it('does not throw if azp missing or empty', () => {
    expect(() => assertAuthorizedPartiesClaim()).not.toThrow();
    expect(() => assertAuthorizedPartiesClaim('')).not.toThrow();
    expect(() => assertAuthorizedPartiesClaim(undefined)).not.toThrow();
  });

  it('does not throw if authorizedParties missing or empty', () => {
    expect(() => assertAuthorizedPartiesClaim('azp')).not.toThrow();
    expect(() => assertAuthorizedPartiesClaim('azp', [])).not.toThrow();
    expect(() => assertAuthorizedPartiesClaim('azp', undefined)).not.toThrow();
  });

  it('throws error if azp is not included in authorizedParties', () => {
    expect(() => assertAuthorizedPartiesClaim('azp', [''])).toThrow(
      `Invalid JWT Authorized party claim (azp) "azp". Expected "".`,
    );
    expect(() => assertAuthorizedPartiesClaim('azp', ['azp-1'])).toThrow(
      `Invalid JWT Authorized party claim (azp) "azp". Expected "azp-1".`,
    );
  });

  it('does not throw if azp is included in authorizedParties', () => {
    expect(() => assertAuthorizedPartiesClaim('azp', ['azp'])).not.toThrow();
  });
});

describe('assertExpirationClaim(exp, clockSkewInMs)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws err if exp is in the past', () => {
    const nowInSeconds = Date.now() / 1000;
    const exp = nowInSeconds - 5;
    expect(() => assertExpirationClaim(exp, 0)).toThrow(
      `JWT is expired. Expiry date: ${formatToUTCString(exp)}, Current date: ${formatToUTCString(nowInSeconds)}.`,
    );
  });

  it('does not throw error if exp is in the past but less than clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertExpirationClaim(nowInSeconds - 5, 6000)).not.toThrow();
  });

  it('throws err if exp is in now', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertExpirationClaim(nowInSeconds, 0)).toThrow(
      `JWT is expired. Expiry date: ${formatToUTCString(nowInSeconds)}, Current date: ${formatToUTCString(nowInSeconds)}.`,
    );
  });

  it('does not throw error if exp is now but there is clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertExpirationClaim(nowInSeconds, 1000)).not.toThrow();
  });

  it('does not throw error if exp is in the future', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertExpirationClaim(nowInSeconds + 5, 0)).not.toThrow();
    expect(() => assertExpirationClaim(nowInSeconds + 5, 6000)).not.toThrow();
  });
});

describe('assertActivationClaim(nbf, clockSkewInMs)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not throw error if nbf is undefined', () => {
    expect(() => assertActivationClaim(undefined, 0)).not.toThrow();
  });

  it('does not throw error if nbf is in the past', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertActivationClaim(nowInSeconds - 5, 0)).not.toThrow();
  });

  it('does not throw err if nbf is in the past but less than clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertActivationClaim(nowInSeconds - 5, 6000)).not.toThrow();
  });

  it('does not throw error if nbf is now', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertActivationClaim(nowInSeconds, 0)).not.toThrow();
  });

  it('does not throw error if nbf is now and there is clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertActivationClaim(nowInSeconds, 1)).not.toThrow();
  });

  it('throws error if nbf is in the future', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertActivationClaim(nowInSeconds + 5, 0)).toThrow(
      `JWT cannot be used prior to not before date claim (nbf). Not before date: ${formatToUTCString(nowInSeconds + 5)}; Current date: ${formatToUTCString(nowInSeconds)};`,
    );
  });

  it('does not throw error if nbf is in the future but less than clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertActivationClaim(nowInSeconds + 5, 6000)).not.toThrow();
  });
});

describe('assertIssuedAtClaim(iat, clockSkewInMs)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not throw error if iat is undefined', () => {
    expect(() => assertIssuedAtClaim(undefined, 0)).not.toThrow();
  });

  it('does not throw error if iat is in the past', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertIssuedAtClaim(nowInSeconds - 5, 0)).not.toThrow();
  });

  it('does not throw err if iat is in the past but less than clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertIssuedAtClaim(nowInSeconds - 5, 6000)).not.toThrow();
  });

  it('does not throw error if iat is now', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertIssuedAtClaim(nowInSeconds, 0)).not.toThrow();
  });

  it('does not throw error if iat is now and there is clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertIssuedAtClaim(nowInSeconds, 1)).not.toThrow();
  });

  it('throws error if iat is in the future', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertIssuedAtClaim(nowInSeconds + 5, 0)).toThrow(
      `JWT issued at date claim (iat) is in the future. Issued at date: ${formatToUTCString(nowInSeconds + 5)}; Current date: ${formatToUTCString(nowInSeconds)};`,
    );
  });

  it('does not throw error if iat is in the future but less than clock skew', () => {
    const nowInSeconds = Date.now() / 1000;
    expect(() => assertIssuedAtClaim(nowInSeconds + 5, 6000)).not.toThrow();
  });
});

describe('isOAuthAccessTokenJwt(typ?)', () => {
  describe('valid OAuth access token JWT types (RFC 9068)', () => {
    it('returns true for at+jwt', () => {
      expect(isOAuthAccessTokenJwt('at+jwt')).toBe(true);
    });

    it('returns true for application/at+jwt', () => {
      expect(isOAuthAccessTokenJwt('application/at+jwt')).toBe(true);
    });
  });

  describe('invalid OAuth access token JWT types', () => {
    it('returns false for JWT (session token type)', () => {
      expect(isOAuthAccessTokenJwt('JWT')).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isOAuthAccessTokenJwt(undefined)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isOAuthAccessTokenJwt(null)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isOAuthAccessTokenJwt('')).toBe(false);
    });

    it('returns false for other strings', () => {
      expect(isOAuthAccessTokenJwt('other')).toBe(false);
      expect(isOAuthAccessTokenJwt('jwt')).toBe(false);
      expect(isOAuthAccessTokenJwt('bearer')).toBe(false);
    });

    it('returns false for case variations (typ is case-sensitive per RFC 9068)', () => {
      expect(isOAuthAccessTokenJwt('AT+JWT')).toBe(false);
      expect(isOAuthAccessTokenJwt('At+Jwt')).toBe(false);
      expect(isOAuthAccessTokenJwt('APPLICATION/AT+JWT')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isOAuthAccessTokenJwt(123)).toBe(false);
      expect(isOAuthAccessTokenJwt({})).toBe(false);
      expect(isOAuthAccessTokenJwt([])).toBe(false);
      expect(isOAuthAccessTokenJwt(true)).toBe(false);
    });
  });
});

describe('assertOAuthHeaderType(typ?)', () => {
  describe('valid OAuth access token JWT types (RFC 9068)', () => {
    it('does not throw for at+jwt', () => {
      expect(() => assertOAuthHeaderType('at+jwt')).not.toThrow();
    });

    it('does not throw for application/at+jwt', () => {
      expect(() => assertOAuthHeaderType('application/at+jwt')).not.toThrow();
    });
  });

  describe('invalid OAuth access token JWT types', () => {
    it('throws error for JWT (session token type)', () => {
      expect(() => assertOAuthHeaderType('JWT')).toThrow(
        'Invalid OAuth JWT type "JWT". Expected "at+jwt" or "application/at+jwt".',
      );
    });

    it('throws error for undefined', () => {
      expect(() => assertOAuthHeaderType(undefined)).toThrow(
        'Invalid OAuth JWT type undefined. Expected "at+jwt" or "application/at+jwt".',
      );
    });

    it('throws error for null', () => {
      expect(() => assertOAuthHeaderType(null)).toThrow(
        'Invalid OAuth JWT type null. Expected "at+jwt" or "application/at+jwt".',
      );
    });

    it('throws error for empty string', () => {
      expect(() => assertOAuthHeaderType('')).toThrow(
        'Invalid OAuth JWT type "". Expected "at+jwt" or "application/at+jwt".',
      );
    });

    it('throws error for other strings', () => {
      expect(() => assertOAuthHeaderType('other')).toThrow(
        'Invalid OAuth JWT type "other". Expected "at+jwt" or "application/at+jwt".',
      );
    });

    it('throws error for case variations (typ is case-sensitive per RFC 9068)', () => {
      expect(() => assertOAuthHeaderType('AT+JWT')).toThrow(
        'Invalid OAuth JWT type "AT+JWT". Expected "at+jwt" or "application/at+jwt".',
      );
      expect(() => assertOAuthHeaderType('At+Jwt')).toThrow(
        'Invalid OAuth JWT type "At+Jwt". Expected "at+jwt" or "application/at+jwt".',
      );
    });
  });
});
