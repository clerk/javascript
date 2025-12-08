import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assertActivationClaim,
  assertAudienceClaim,
  assertAuthorizedPartiesClaim,
  assertExpirationClaim,
  assertHeaderAlgorithm,
  assertHeaderType,
  assertIssuedAtClaim,
  assertSubClaim,
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

describe('assertHeaderType(typ?, allowedTypes?)', () => {
  it('does not throw error if type is missing', () => {
    expect(() => assertHeaderType(undefined)).not.toThrow();
    expect(() => assertHeaderType(undefined, 'JWT')).not.toThrow();
    expect(() => assertHeaderType(undefined, ['JWT', 'at+jwt'])).not.toThrow();
  });

  it('does not throw error if type matches default allowed type (JWT)', () => {
    expect(() => assertHeaderType('JWT')).not.toThrow();
  });

  it('throws error if type is not JWT (default)', () => {
    expect(() => assertHeaderType('')).toThrow(`Invalid JWT type "". Expected "JWT".`);
    expect(() => assertHeaderType('Aloha')).toThrow(`Invalid JWT type "Aloha". Expected "JWT".`);
  });

  it('does not throw error if type matches single custom allowed type', () => {
    expect(() => assertHeaderType('at+jwt', 'at+jwt')).not.toThrow();
    expect(() => assertHeaderType('application/at+jwt', 'application/at+jwt')).not.toThrow();
  });

  it('throws error if type does not match single custom allowed type', () => {
    expect(() => assertHeaderType('JWT', 'at+jwt')).toThrow(`Invalid JWT type "JWT". Expected "at+jwt".`);
    expect(() => assertHeaderType('at+jwt', 'JWT')).toThrow(`Invalid JWT type "at+jwt". Expected "JWT".`);
  });

  it('does not throw error if type matches array of allowed types', () => {
    expect(() => assertHeaderType('JWT', ['JWT', 'at+jwt'])).not.toThrow();
    expect(() => assertHeaderType('at+jwt', ['JWT', 'at+jwt'])).not.toThrow();
    expect(() => assertHeaderType('at+jwt', ['at+jwt', 'application/at+jwt'])).not.toThrow();
    expect(() => assertHeaderType('application/at+jwt', ['at+jwt', 'application/at+jwt'])).not.toThrow();
  });

  it('throws error if type does not match any in array of allowed types', () => {
    expect(() => assertHeaderType('JWT', ['at+jwt', 'application/at+jwt'])).toThrow(
      `Invalid JWT type "JWT". Expected "at+jwt, application/at+jwt".`,
    );
    expect(() => assertHeaderType('invalid', ['at+jwt', 'application/at+jwt'])).toThrow(
      `Invalid JWT type "invalid". Expected "at+jwt, application/at+jwt".`,
    );
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
