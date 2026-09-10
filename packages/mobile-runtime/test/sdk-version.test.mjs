import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './protocol-fixture.mjs';

for (const platform of ['ios', 'android']) {
  test(`${platform} requests identify the native SDK release`, async t => {
    const f = await fixture({ configuration: { platform, sdkVersion: '2.0.0-alpha.0' } });
    t.after(f.dispose);
    assert.ok(f.requests.length >= 2);
    for (const request of f.requests) {
      assert.equal(request.headers[`x-${platform}-sdk-version`], '2.0.0-alpha.0');
      assert.equal(request.headers['x-mobile'], '1');
      assert.equal(new URL(request.url).searchParams.get('_is_native'), '1');
    }
  });
}

test('desktop Apple requests retain native credentials without being classified as mobile', async t => {
  const f = await fixture({
    credential: 'fixture_client_credential',
    configuration: { platform: 'ios', sdkVersion: '2.0.0-alpha.0', isMobile: false },
  });
  t.after(f.dispose);
  assert.ok(f.requests.length >= 2);
  for (const request of f.requests) {
    assert.equal(request.headers['x-ios-sdk-version'], '2.0.0-alpha.0');
    assert.equal(request.headers['x-mobile'], '0');
    assert.equal(request.headers.authorization, 'fixture_client_credential');
    assert.equal(new URL(request.url).searchParams.get('_is_native'), '1');
  }
});

test('malformed device classification fails before HTTP', async t => {
  for (const isMobile of ['false', 0, null]) {
    const f = await fixture({ configuration: { isMobile }, allowFailure: true });
    t.after(f.dispose);
    assert.equal(f.ready.kind, 'initializationFailed');
    assert.equal(f.ready.failure.code, 'invalid_mobile_device');
    assert.equal(f.requests.length, 0);
  }
});

test('unknown SDK version is omitted and invalid values fail before HTTP', async t => {
  const unknown = await fixture();
  t.after(unknown.dispose);
  assert.equal(unknown.requests[0].headers['x-ios-sdk-version'], undefined);
  for (const sdkVersion of ['', '2.0\r\ninjected: 1', 2, null]) {
    const f = await fixture({ configuration: { sdkVersion }, allowFailure: true });
    t.after(f.dispose);
    assert.equal(f.ready.kind, 'initializationFailed');
    assert.equal(f.ready.failure.code, 'invalid_sdk_version');
    assert.equal(f.requests.length, 0);
  }
});
