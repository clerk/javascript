import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const locale of ['fr-CA', 'ja-JP', undefined]) {
  test(`embedded authentication uses host locale ${locale ?? '(absent)'}`, async t => {
    const f = await fixture({
      configuration: { locale },
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/sign_ins')) return response(fixtures.signIn);
        if (path.endsWith('/sign_ups')) return response(fixtures.signUp);
      },
    });
    t.after(f.dispose);
    for (const [root, operation, params] of [
      ['signIn', 'SignIn.create', { identifier: 'test@example.com' }],
      ['signUp', 'SignUp.create', { emailAddress: 'test@example.com' }],
      ['signUp', 'SignUp.create', { emailAddress: 'test@example.com', locale: 'de-DE' }],
    ]) {
      const result = await f.invoke(f.state.roots[root], operation, [params]);
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result.error, null);
      const body = new URLSearchParams(f.requests.at(-1).body);
      assert.equal(body.get('locale'), params.locale ?? locale ?? (root === 'signUp' ? '' : null));
    }
  });
}
