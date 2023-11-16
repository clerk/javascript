import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { loadInterstitialFromBAPI } from './interstitial';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('loadInterstitialFromBAPI', hooks => {
    let fakeFetch;

    hooks.afterEach(() => {
      fakeFetch?.restore();
    });

    test('executes GET request to /v1/public/interstitial', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns({
        text: () => '<html>Interstitial Page</html>',
        ok: true,
        status: 200,
      });

      const publishableKey = 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA';
      const resp = await loadInterstitialFromBAPI({
        apiUrl: 'https://api.clerk.test',
        publishableKey,
        userAgent: 'clerk-backend-sdk-from-options',
      });

      const qs = `clerk_js_version=latest&publishable_key=${publishableKey}&sign_in_url=`;
      const interstitialUrl = `https://api.clerk.test/v1/public/interstitial?${qs}`;

      assert.equal(resp, '<html>Interstitial Page</html>');
      assert.ok(
        fakeFetch.calledOnceWith(interstitialUrl, {
          method: 'GET',
          headers: {
            'Clerk-Backend-SDK': 'clerk-backend-sdk-from-options',
          },
        }),
      );
    });
  });
};
