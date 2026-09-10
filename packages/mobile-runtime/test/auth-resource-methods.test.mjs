import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [root, group, method, strategy, endpoint] of [
  ['signIn', 'emailCode', 'sendCode', 'email_code', 'prepare_first_factor'],
  ['signIn', 'phoneCode', 'sendCode', 'phone_code', 'prepare_first_factor'],
  ['signIn', 'emailCode', 'verifyCode', 'email_code', 'attempt_first_factor'],
  ['signIn', 'phoneCode', 'verifyCode', 'phone_code', 'attempt_first_factor'],
  ['signIn', 'resetPasswordEmailCode', 'verifyCode', 'reset_password_email_code', 'attempt_first_factor'],
  ['signIn', 'resetPasswordPhoneCode', 'verifyCode', 'reset_password_phone_code', 'attempt_first_factor'],
  ['signIn', 'mfa', 'verifyPhoneCode', 'phone_code', 'attempt_second_factor'],
  ['signIn', 'mfa', 'verifyEmailCode', 'email_code', 'attempt_second_factor'],
  ['signIn', 'mfa', 'verifyTOTP', 'totp', 'attempt_second_factor'],
  ['signIn', 'mfa', 'verifyBackupCode', 'backup_code', 'attempt_second_factor'],
  ['signUp', 'verifications', 'sendEmailCode', 'email_code', 'prepare_verification'],
  ['signUp', 'verifications', 'sendPhoneCode', 'phone_code', 'prepare_verification'],
  ['signUp', 'verifications', 'verifyEmailCode', 'email_code', 'attempt_verification'],
  ['signUp', 'verifications', 'verifyPhoneCode', 'phone_code', 'attempt_verification'],
]) {
  test(`generated ${root}.${group}.${method} keeps its explicit authentication strategy`, async t => {
    const verify = method.startsWith('verify');
    const initial =
      root === 'signIn'
        ? {
            ...fixtures.signIn,
            status: group === 'mfa' ? 'needs_second_factor' : 'needs_first_factor',
            identifier: 'test@example.com',
            supported_first_factors: [
              { strategy: 'email_code', email_address_id: 'ema_selected', safe_identifier: 'test@example.com' },
              { strategy: 'phone_code', phone_number_id: 'pho_selected', safe_identifier: '+15555550123' },
            ],
            first_factor_verification: { ...fixtures.signIn.first_factor_verification, strategy: 'password' },
          }
        : fixtures.signUp;
    const finalStatus = root === 'signUp' || group === 'mfa' ? 'complete' : 'needs_second_factor';
    const returned = verify
      ? { ...initial, status: finalStatus, created_session_id: finalStatus === 'complete' ? 'sess_native' : null }
      : initial;
    const f = await fixture({
      client: { ...fixtures.client, [root === 'signIn' ? 'sign_in' : 'sign_up']: initial },
      http: request => (new URL(request.url).pathname.endsWith(`/${endpoint}`) ? response(returned) : undefined),
    });
    t.after(f.dispose);
    const count = f.requests.length;
    const handle = f.group(root, group);
    const result = await f.invoke(handle, `${handle.type}.${method}`, verify ? [{ code: '654321' }] : []);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.error, null);
    assert.equal(f.requests.length, count + 1);
    const request = f.requests.at(-1);
    assert.equal(request.method, 'POST');
    assert.equal(
      new URL(request.url).pathname,
      `/v1/client/${root === 'signIn' ? 'sign_ins/sia_native' : 'sign_ups/sua_native'}/${endpoint}`,
    );
    const body = new URLSearchParams(request.body);
    assert.equal(body.get('strategy'), strategy);
    assert.equal(body.get('code'), verify ? '654321' : null);
    if (!verify && root === 'signIn')
      assert.equal(
        body.get(strategy === 'email_code' ? 'email_address_id' : 'phone_number_id'),
        strategy === 'email_code' ? 'ema_selected' : 'pho_selected',
      );
    assert.equal(f.resource(f.state.roots[root]).status, verify ? finalStatus : initial.status);
    assert.equal(f.state.roots.session, null);
  });
}

test('future password sign-in reuses the current identifier through the canonical create request', async t => {
  const f = await fixture({
    client: { ...fixtures.client, sign_in: { ...fixtures.signIn, identifier: 'test@example.com' } },
    http: request =>
      new URL(request.url).pathname.endsWith('/sign_ins')
        ? response({ ...fixtures.signIn, status: 'needs_second_factor' })
        : undefined,
  });
  t.after(f.dispose);
  const count = f.requests.length;
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.password', [
    { $case: 3, value: { password: 'fixture-password' } },
  ]);
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(result.result.error, null);
  assert.equal(f.requests.length, count + 1);
  const request = f.requests.at(-1);
  assert.equal(request.method, 'POST');
  assert.equal(new URL(request.url).pathname, '/v1/client/sign_ins');
  const body = new URLSearchParams(request.body);
  assert.equal(body.get('identifier'), 'test@example.com');
  assert.equal(body.get('password'), 'fixture-password');
  assert.equal(f.resource(f.state.roots.signIn).status, 'needs_second_factor');
  assert.equal(f.state.roots.session, null);
});
