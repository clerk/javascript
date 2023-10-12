import type QUnit from 'qunit';
import sinon from 'sinon';

import {
  assertActivationClaim,
  assertAudienceClaim,
  assertAuthorizedPartiesClaim,
  assertExpirationClaim,
  assertHeaderAlgorithm,
  assertHeaderType,
  assertIssuedAtClaim,
  assertIssuerClaim,
  assertSubClaim,
} from './assertions';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  function formatToUTCString(ts: number) {
    const tsDate = new Date(0);
    tsDate.setUTCSeconds(ts);
    return tsDate.toUTCString();
  }

  module('assertAudienceClaim(audience?, aud?)', () => {
    const audience = 'http://audience.example';
    const otherAudience = 'http://audience-other.example';
    const invalidAudience = 'http://invalid-audience.example';

    test('does not throw error if aud is missing', assert => {
      assert.equal(undefined, assertAudienceClaim());
      assert.equal(undefined, assertAudienceClaim(undefined));
      assert.equal(undefined, assertAudienceClaim(undefined, audience));
      assert.equal(undefined, assertAudienceClaim(undefined, [audience]));
      assert.equal(undefined, assertAudienceClaim(''));
      assert.equal(undefined, assertAudienceClaim('', audience));
      assert.equal(undefined, assertAudienceClaim('', [audience]));
      assert.equal(undefined, assertAudienceClaim('', [audience, otherAudience]));
    });

    test('does not throw error if audience is missing', assert => {
      assert.equal(undefined, assertAudienceClaim(undefined, undefined));
      assert.equal(undefined, assertAudienceClaim(audience, undefined));
      assert.equal(undefined, assertAudienceClaim([audience], undefined));

      assert.equal(undefined, assertAudienceClaim(undefined, ''));
      assert.equal(undefined, assertAudienceClaim(audience, ''));
      assert.equal(undefined, assertAudienceClaim([audience], ''));
      assert.equal(undefined, assertAudienceClaim([audience, otherAudience], ''));
    });

    test('does not throw error if aud contains empty values', assert => {
      assert.equal(undefined, assertAudienceClaim([], audience));
      assert.equal(undefined, assertAudienceClaim([undefined, undefined], audience));
      assert.equal(undefined, assertAudienceClaim([null, null], audience));
      assert.equal(undefined, assertAudienceClaim([false, false], audience));
      assert.equal(undefined, assertAudienceClaim(['', ''], [audience]));
      assert.equal(undefined, assertAudienceClaim(['', ''], [audience, otherAudience]));
    });

    test('does not throw error if audience is empty or contains empty values', assert => {
      assert.equal(undefined, assertAudienceClaim(audience, []));
      assert.equal(undefined, assertAudienceClaim(audience, [undefined, undefined]));
      assert.equal(undefined, assertAudienceClaim(audience, [null, null]));
      assert.equal(undefined, assertAudienceClaim(audience, [false, false]));
      assert.equal(undefined, assertAudienceClaim(audience, ['', '']));
      assert.equal(undefined, assertAudienceClaim([audience], ['', '']));
      assert.equal(undefined, assertAudienceClaim([audience, otherAudience], ['', '']));
    });

    test('does not throw error when audience matches aud', assert => {
      assert.equal(undefined, assertAudienceClaim(audience, audience));
    });

    test('does not throw error when audience list contains aud', assert => {
      assert.equal(undefined, assertAudienceClaim(audience, [audience, otherAudience]));
    });

    test('does not throw error when audience string[] has intersection with aud string[]', assert => {
      assert.equal(undefined, assertAudienceClaim([audience], [audience, otherAudience]));
      assert.equal(undefined, assertAudienceClaim([audience, otherAudience], [audience]));
    });

    test('throws error when audience does not match aud', assert => {
      assert.raises(
        () => assertAudienceClaim(audience, invalidAudience),
        new Error(
          `Invalid JWT audience claim (aud) "${audience}". Is not included in "${JSON.stringify([invalidAudience])}".`,
        ),
      );
    });

    test('throws error when audience is substring of aud', assert => {
      assert.raises(
        () => assertAudienceClaim(audience, audience.slice(0, -2)),
        new Error(
          `Invalid JWT audience claim (aud) "${audience}". Is not included in "${JSON.stringify([
            audience.slice(0, -2),
          ])}".`,
        ),
      );
    });

    test('throws error when audience is substring of an aud when aud is a string[]', assert => {
      assert.raises(
        () => assertAudienceClaim([audience, otherAudience], audience.slice(0, -2)),
        new Error(
          `Invalid JWT audience claim array (aud) ${JSON.stringify([
            audience,
            otherAudience,
          ])}. Is not included in "${JSON.stringify([audience.slice(0, -2)])}".`,
        ),
      );
    });

    test('throws error when aud is a substring of audience', assert => {
      assert.raises(
        () => assertAudienceClaim(audience.slice(0, -2), audience),
        new Error(
          `Invalid JWT audience claim (aud) "${audience.slice(0, -2)}". Is not included in "${JSON.stringify([
            audience,
          ])}".`,
        ),
      );
    });

    test('throws error when aud is substring of an audience when audience is a string[]', assert => {
      assert.raises(
        () => assertAudienceClaim(audience.slice(0, -2), [audience, otherAudience]),
        new Error(
          `Invalid JWT audience claim (aud) "${audience.slice(0, -2)}". Is not included in "${JSON.stringify([
            audience,
            otherAudience,
          ])}".`,
        ),
      );
    });
  });

  module('assertHeaderType(typ?)', () => {
    test('does not throw error if type is missing', assert => {
      assert.equal(undefined, assertHeaderType(undefined));
    });

    test('throws error if type is not JWT', assert => {
      assert.raises(() => assertHeaderType(''), new Error(`Invalid JWT type "". Expected "JWT".`));
      assert.raises(() => assertHeaderType('Aloha'), new Error(`Invalid JWT type "Aloha". Expected "JWT".`));
    });
  });

  module('assertHeaderAlgorithm(alg)', () => {
    test('does not throw if algorithm is supported', assert => {
      assert.equal(undefined, assertHeaderAlgorithm('RS256'));
      assert.equal(undefined, assertHeaderAlgorithm('RS384'));
      assert.equal(undefined, assertHeaderAlgorithm('RS512'));
    });

    test('throws error if algorithm is missing', assert => {
      assert.raises(
        () => assertHeaderAlgorithm(''),
        new Error(`Invalid JWT algorithm "". Supported: RS256,RS384,RS512.`),
      );
    });

    test('throws error if algorithm is not supported', assert => {
      assert.raises(
        () => assertHeaderAlgorithm('ES256'),
        new Error(`Invalid JWT algorithm "ES256". Supported: RS256,RS384,RS512.`),
      );
      assert.raises(
        () => assertHeaderAlgorithm('ES384'),
        new Error(`Invalid JWT algorithm "ES384". Supported: RS256,RS384,RS512.`),
      );
      assert.raises(
        () => assertHeaderAlgorithm('ES512'),
        new Error(`Invalid JWT algorithm "ES512". Supported: RS256,RS384,RS512.`),
      );
      assert.raises(
        () => assertHeaderAlgorithm('PS512'),
        new Error(`Invalid JWT algorithm "PS512". Supported: RS256,RS384,RS512.`),
      );
      assert.raises(
        () => assertHeaderAlgorithm('Aloha'),
        new Error(`Invalid JWT algorithm "Aloha". Supported: RS256,RS384,RS512.`),
      );
    });
  });

  module('assertSubClaim(sub?)', () => {
    test('does not throw if sub exists', assert => {
      assert.equal(undefined, assertSubClaim(''));
    });

    test('throws error if sub is missing', assert => {
      assert.raises(
        () => assertSubClaim(),
        new Error(`Subject claim (sub) is required and must be a string. Received undefined.`),
      );
      assert.raises(
        () => assertSubClaim(undefined),
        new Error('Subject claim (sub) is required and must be a string. Received undefined.'),
      );
    });
  });

  module('assertAuthorizedPartiesClaim(azp?, authorizedParties?)', () => {
    test('does not throw if azp missing or empty', assert => {
      assert.equal(undefined, assertAuthorizedPartiesClaim());
      assert.equal(undefined, assertAuthorizedPartiesClaim(''));
      assert.equal(undefined, assertAuthorizedPartiesClaim(undefined));
    });

    test('does not throw if authorizedParties missing or empty', assert => {
      assert.equal(undefined, assertAuthorizedPartiesClaim('azp'));
      assert.equal(undefined, assertAuthorizedPartiesClaim('azp', []));
      assert.equal(undefined, assertAuthorizedPartiesClaim('azp', undefined));
    });

    test('throws error if azp is not included in authorizedParties', assert => {
      assert.raises(
        () => assertAuthorizedPartiesClaim('azp', ['']),
        new Error(`Invalid JWT Authorized party claim (azp) "azp". Expected "".`),
      );
      assert.raises(
        () => assertAuthorizedPartiesClaim('azp', ['azp-1']),
        new Error(`Invalid JWT Authorized party claim (azp) "azp". Expected "azp-1".`),
      );
    });

    test('does not throw if azp is included in authorizedParties ', assert => {
      assert.equal(undefined, assertAuthorizedPartiesClaim('azp', ['azp']));
    });
  });

  module('assertIssuerClaim(iss, issuer)', () => {
    test('does not throw if issuer is null', assert => {
      assert.equal(undefined, assertIssuerClaim('', null));
    });

    test('throws error if iss does not match with issuer string', assert => {
      assert.raises(
        () => assertIssuerClaim('issuer', ''),
        new Error(`Invalid JWT issuer claim (iss) "issuer". Expected "".`),
      );
      assert.raises(
        () => assertIssuerClaim('issuer', 'issuer-2'),
        new Error(`Invalid JWT issuer claim (iss) "issuer". Expected "issuer-2".`),
      );
    });

    test('throws error if iss does not match with issuer function result', assert => {
      assert.raises(
        () => assertIssuerClaim('issuer', () => false),
        new Error(`Failed JWT issuer resolver. Make sure that the resolver returns a truthy value.`),
      );
    });

    test('does not throw if iss matches issuer ', assert => {
      assert.equal(undefined, assertIssuerClaim('issuer', 'issuer'));
      assert.equal(
        undefined,
        assertIssuerClaim('issuer', s => s === 'issuer'),
      );
      assert.equal(
        undefined,
        assertIssuerClaim('issuer', () => true),
      );
    });
  });

  module('assertExpirationClaim(exp, clockSkewInMs)', hooks => {
    let fakeClock;
    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers();
    });
    hooks.afterEach(() => {
      fakeClock.restore();
      sinon.restore();
    });

    test('throws err if exp is in the past', assert => {
      const nowInSeconds = Date.now() / 1000;
      const exp = nowInSeconds - 5;
      assert.raises(
        () => assertExpirationClaim(exp, 0),
        new Error(
          `JWT is expired. Expiry date: ${formatToUTCString(exp)}, Current date: ${formatToUTCString(nowInSeconds)}.`,
        ),
      );
    });

    test('does not throw error if exp is in the past but less than clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertExpirationClaim(nowInSeconds - 5, 6000));
    });

    test('throws err if exp is in now', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.raises(
        () => assertExpirationClaim(nowInSeconds, 0),
        new Error(
          `JWT is expired. Expiry date: ${formatToUTCString(nowInSeconds)}, Current date: ${formatToUTCString(
            nowInSeconds,
          )}.`,
        ),
      );
    });

    test('does not throw error if exp is now but there is clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertExpirationClaim(nowInSeconds, 1000));
    });

    test('does not throw error if exp is in the future', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertExpirationClaim(nowInSeconds + 5, 0));
      assert.equal(undefined, assertExpirationClaim(nowInSeconds + 5, 6000));
    });
  });

  module('assertActivationClaim(nbf, clockSkewInMs)', hooks => {
    let fakeClock;
    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers();
    });
    hooks.afterEach(() => {
      fakeClock.restore();
      sinon.restore();
    });

    test('does not throw error if nbf is undefined', assert => {
      assert.equal(undefined, assertActivationClaim(undefined, 0));
    });

    test('does not throw error if nbf is in the past', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertActivationClaim(nowInSeconds - 5, 0));
    });

    test('does not throw err if nbf is in the past but less than clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertActivationClaim(nowInSeconds - 5, 6000));
    });

    test('does not throw error if nbf is now', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertActivationClaim(nowInSeconds, 0));
    });

    test('does not throw error if nbf is now and there is clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertActivationClaim(nowInSeconds, 1));
    });

    test('throws error if nbf is in the future', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.raises(
        () => assertActivationClaim(nowInSeconds + 5, 0),
        new Error(
          `JWT cannot be used prior to not before date claim (nbf). Not before date: ${formatToUTCString(
            nowInSeconds + 5,
          )}; Current date: ${formatToUTCString(nowInSeconds)};`,
        ),
      );
    });

    test('does not throw error if nbf is in the future but less than clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertActivationClaim(nowInSeconds + 5, 6000));
    });
  });

  module('assertIssuedAtClaim(iat, clockSkewInMs)', hooks => {
    let fakeClock;
    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers();
    });
    hooks.afterEach(() => {
      fakeClock.restore();
      sinon.restore();
    });

    test('does not throw error if iat is undefined', assert => {
      assert.equal(undefined, assertIssuedAtClaim(undefined, 0));
    });

    test('does not throw error if iat is in the past', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertIssuedAtClaim(nowInSeconds - 5, 0));
    });

    test('does not throw err if iat is in the past but less than clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertIssuedAtClaim(nowInSeconds - 5, 6000));
    });

    test('does not throw error if iat is now', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertIssuedAtClaim(nowInSeconds, 0));
    });

    test('does not throw error if iat is now and there is clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertIssuedAtClaim(nowInSeconds, 1));
    });

    test('throws error if iat is in the future', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.raises(
        () => assertIssuedAtClaim(nowInSeconds + 5, 0),
        new Error(
          `JWT issued at date claim (iat) is in the future. Issued at date: ${formatToUTCString(
            nowInSeconds + 5,
          )}; Current date: ${formatToUTCString(nowInSeconds)};`,
        ),
      );
    });

    test('does not throw error if nbf is in the future but less than clock skew', assert => {
      const nowInSeconds = Date.now() / 1000;
      assert.equal(undefined, assertIssuedAtClaim(nowInSeconds + 5, 6000));
    });
  });
};
