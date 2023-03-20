import { addScriptAttributes, getClerkLoadArgs } from './interstitial';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('interstitial.getClerkLoadArgs', () => {
    test('returns empty object', assert => {
      const payload = getClerkLoadArgs({});
      assert.propEqual(payload, {});
    });

    test('returns empty object', assert => {
      const payload = getClerkLoadArgs({
        isSatellite: undefined,
        signInUrl: undefined,
      });
      assert.propEqual(payload, {});
    });

    test('returns {isSatellite: true}', assert => {
      const payload = getClerkLoadArgs({
        isSatellite: true,
      });
      assert.propEqual(payload, {
        isSatellite: true,
      });
    });
    test('returns empty object', assert => {
      const payload = getClerkLoadArgs({
        isSatellite: false,
      });
      assert.propEqual(payload, {});
    });

    test('returns empty object', assert => {
      const payload = getClerkLoadArgs({
        signInUrl: '',
      });
      assert.propEqual(payload, {});
    });

    test(`returns {signInUrl: 'someSignInUrl'}`, assert => {
      const payload = getClerkLoadArgs({
        signInUrl: 'someSignInUrl',
      });
      assert.propEqual(payload, {
        signInUrl: 'someSignInUrl',
      });
    });
  });

  module('interstitial.addScriptAttributes', () => {
    test('sets publishableKey', assert => {
      const payload = addScriptAttributes({
        publishableKey: 'some_pk_test',
      });
      assert.deepEqual(payload, ["script.setAttribute('data-clerk-publishable-key', 'some_pk_test')"]);
    });

    test('sets frontendApi', assert => {
      const payload = addScriptAttributes({
        frontendApi: 'clerk.test.app',
      });
      assert.deepEqual(payload, ["script.setAttribute('data-clerk-frontend-api', 'clerk.test.app')"]);
    });

    test('sets domain', assert => {
      const payload = addScriptAttributes({
        domain: 'satellite.app',
      });
      assert.deepEqual(payload, ["script.setAttribute('data-clerk-domain', 'satellite.app')"]);
    });

    test('sets proxyUrl', assert => {
      const payload = addScriptAttributes({
        proxyUrl: 'https://proxied.app/api/__clerk',
      });
      assert.deepEqual(payload, ["script.setAttribute('data-clerk-proxy-url', 'https://proxied.app/api/__clerk')"]);
    });

    test('sets frontend,publishableKey, domain,proxyUrl', assert => {
      const payload = addScriptAttributes({
        publishableKey: 'some_pk_test',
        frontendApi: 'clerk.test.app',
        domain: 'satellite.app',
        proxyUrl: 'https://proxied.app/api/__clerk',
      });
      assert.deepEqual(payload, [
        "script.setAttribute('data-clerk-publishable-key', 'some_pk_test')",
        "script.setAttribute('data-clerk-frontend-api', 'clerk.test.app')",
        "script.setAttribute('data-clerk-domain', 'satellite.app')",
        "script.setAttribute('data-clerk-proxy-url', 'https://proxied.app/api/__clerk')",
      ]);
    });
  });
};
