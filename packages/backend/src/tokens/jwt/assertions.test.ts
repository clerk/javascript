import type QUnit from 'qunit';

import { assertAudienceClaim } from './assertions';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

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
        `Invalid JWT audience claim (aud) ${audience}. Is not included in "[${invalidAudience}]".`,
      );
    });

    test('throws error when audience is substring of aud', assert => {
      assert.raises(
        () => assertAudienceClaim(audience, audience.slice(0, -2)),
        `Invalid JWT audience claim (aud) ${audience}. Is not included in "${audience.slice(0, -2)}".`,
      );
    });

    test('throws error when audience is substring of an aud when aud is a string[]', assert => {
      assert.raises(
        () => assertAudienceClaim([audience, otherAudience], audience.slice(0, -2)),
        `Invalid JWT audience claim (aud) ${[audience, otherAudience]}. Is not included in "[${audience.slice(
          0,
          -2,
        )}]".`,
      );
    });

    test('throws error when aud is a substring of audience', assert => {
      assert.raises(
        () => assertAudienceClaim(audience.slice(0, -2), audience),
        `Invalid JWT audience claim (aud) ${audience.slice(0, -2)}. Is not included in "${audience}".`,
      );
    });

    test('throws error when aud is substring of an audience when audience is a string[]', assert => {
      assert.raises(
        () => assertAudienceClaim(audience.slice(0, -2), [audience, otherAudience]),
        `Invalid JWT audience claim (aud) ${audience.slice(0, -2)}. Is not included in "[${[
          audience,
          otherAudience,
        ]}]".`,
      );
    });
  });
};
