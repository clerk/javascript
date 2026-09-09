import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const status of [422, 429]) {
  test(`authentication failure preserves HTTP ${status}, trace and retry metadata`, async t => {
    const f = await fixture({
      client: { ...fixtures.client, sign_in: fixtures.signIn },
      http: request =>
        request.url.includes('/attempt_first_factor')
          ? response(null, {
              status,
              headers: { 'retry-after': '7' },
              body: JSON.stringify({
                clerk_trace_id: 'fixture-trace-123',
                errors: [
                  {
                    code: 'fixture_error',
                    message: 'Short message',
                    long_message: 'Helpful long message',
                    meta: { param_name: 'code', password: 'must-not-cross' },
                  },
                  { code: 'second_error', message: 'Another error' },
                ],
              }),
            })
          : undefined,
    });
    t.after(f.dispose);
    const group = f.group('signIn', 'emailCode');
    const result = await f.invoke(group, `${group.type}.verifyCode`, [{ code: 'fixture-code' }]);
    const error = result.result.error;
    assert.equal(error.kind, 'clerk');
    assert.equal(error.status, status);
    assert.equal(error.clerkTraceId, 'fixture-trace-123');
    assert.equal(error.retryAfter, status === 429 ? 7 : undefined);
    assert.equal(error.errors.length, 2);
    assert.equal(error.errors[0].longMessage, 'Helpful long message');
    assert.equal(error.errors[0].meta.paramName, 'code');
    assert.equal(JSON.stringify(result).includes('must-not-cross'), false);
    assert.equal(f.state.roots.session, null);
  });
}
