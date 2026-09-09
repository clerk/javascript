import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [group, method, strategy, field, parameter, second] of [
  ['mfa', 'sendPhoneCode', 'phone_code', 'phone_number_id', 'phoneNumberId', true],
  ['mfa', 'sendEmailCode', 'email_code', 'email_address_id', 'emailAddressId', true],
  ['resetPasswordPhoneCode', 'sendCode', 'reset_password_phone_code', 'phone_number_id', 'phoneNumberId', false],
  ['resetPasswordEmailCode', 'sendCode', 'reset_password_email_code', 'email_address_id', 'emailAddressId', false],
]) {
  for (const selection of ['default', 'second', 'unknown']) {
    test(`${group}.${method} preserves selected ${selection} factor`, async t => {
      const signIn = {
        ...fixtures.signIn,
        status: second ? 'needs_second_factor' : 'needs_first_factor',
        [second ? 'supported_second_factors' : 'supported_first_factors']: [
          { strategy, [field]: 'id_first', safe_identifier: 'first' },
          { strategy, [field]: 'id_second', safe_identifier: 'second' },
        ],
      };
      const f = await fixture({
        client: { ...fixtures.client, sign_in: signIn },
        http: request => (request.url.includes('/prepare_') ? response(signIn) : undefined),
      });
      t.after(f.dispose);
      const handle = f.group('signIn', group);
      const args = selection === 'default' ? [] : [{ [parameter]: `id_${selection}` }];
      const result = await f.invoke(handle, `${handle.type}.${method}`, args);
      const requests = f.requests.filter(r => r.url.includes('/prepare_'));
      if (selection === 'unknown') {
        assert.equal(result.result.error.code, 'factor_not_found');
        assert.equal(requests.length, 0);
      } else {
        assert.equal(result.failure, undefined, JSON.stringify(result.failure));
        assert.equal(result.result.error, null);
        assert.equal(requests.length, 1);
        assert.equal(
          new URLSearchParams(requests[0].body).get(field),
          selection === 'default' ? 'id_first' : 'id_second',
        );
      }
    });
  }
}

test('native factor projection preserves known discriminants before unknown enum fallback', async t => {
  const f = await fixture({
    allowFailure: true,
    client: {
      ...fixtures.client,
      sign_in: {
        ...fixtures.signIn,
        supported_first_factors: [
          {
            strategy: 'phone_code',
            phone_number_id: 'idn_phone',
            safe_identifier: '+15555550123',
            primary: true,
            default: true,
          },
          { strategy: 'trusted_device', trusted_device_id: 'tdc_123', safe_identifier: 'Test device' },
          { strategy: 'reset_password_phone_code', phone_number_id: 'idn_reset', safe_identifier: 'reset-phone' },
          { strategy: 'enterprise_sso', enterprise_connection_id: 'ec_123', enterprise_connection_name: 'Acme' },
          { strategy: 'oauth_custom_acme' },
          { strategy: 'oauth_future_provider' },
        ],
      },
    },
  });
  t.after(f.dispose);
  assert.equal(f.ready.kind, 'ready', JSON.stringify(f.ready));
  const factors = f.resource(f.state.roots.signIn).supportedFirstFactors.map(factor => factor.value);
  assert.deepEqual(
    factors.find(factor => factor.strategy === 'phone_code'),
    {
      strategy: 'phone_code',
      phoneNumberId: 'idn_phone',
      safeIdentifier: '+15555550123',
      primary: true,
      default: true,
    },
  );
  assert.deepEqual(
    factors.find(factor => factor.strategy === 'trusted_device'),
    {
      strategy: 'trusted_device',
      trustedDeviceId: 'tdc_123',
      safeIdentifier: 'Test device',
    },
  );
  assert.deepEqual(
    factors.find(factor => factor.strategy === 'reset_password_phone_code'),
    {
      strategy: 'reset_password_phone_code',
      phoneNumberId: 'idn_reset',
      safeIdentifier: 'reset-phone',
    },
  );
  assert.deepEqual(
    factors.find(factor => factor.strategy === 'enterprise_sso'),
    {
      strategy: 'enterprise_sso',
      enterpriseConnectionId: 'ec_123',
      enterpriseConnectionName: 'Acme',
    },
  );
  assert.ok(factors.some(factor => factor.strategy === 'oauth_custom_acme'));
  assert.ok(factors.some(factor => factor.strategy === 'oauth_future_provider'));
  assert.equal(f.state.roots.session, null);
});
