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
