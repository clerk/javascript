import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const kind of ['email', 'phone']) {
  test(`generated ${kind} contact creation, verification, and deletion publish usable state`, async t => {
    const isEmail = kind === 'email';
    const type = isEmail ? 'EmailAddress' : 'PhoneNumber';
    const collection = isEmail ? 'email_addresses' : 'phone_numbers';
    const projectedCollection = isEmail ? 'emailAddresses' : 'phoneNumbers';
    const value = isEmail ? 'new@example.com' : '+15555550123';
    const client = structuredClone(fixtures.authenticatedClient);
    let contact = {
      object: isEmail ? 'email_address' : 'phone_number',
      id: `${kind}_contact`,
      [isEmail ? 'email_address' : 'phone_number']: value,
      matches_sso_connection: false,
      reserved_for_second_factor: false,
      default_second_factor: false,
      linked_to: [],
      verification: {
        status: 'unverified',
        strategy: `${kind}_code`,
        attempts: null,
        expire_at: null,
        error: null,
        verified_at_client: null,
      },
    };
    let invalidCode = false;
    const f = await fixture({
      client,
      http: request => {
        const url = new URL(request.url);
        if (url.pathname.includes('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
        if (url.pathname.endsWith('/touch')) return response(client.sessions[0]);
        if (!url.pathname.includes(`/${collection}`)) return;
        const body = new URLSearchParams(request.body);
        const method = url.searchParams.get('_method') ?? request.method;
        if (method === 'DELETE') {
          assert.equal(url.pathname, `/v1/me/${collection}/${contact.id}`);
          client.sessions[0].user[collection] = [];
          return response(null, {
            body: JSON.stringify({ response: { object: contact.object, id: contact.id, deleted: true }, client }),
          });
        }
        if (url.pathname.endsWith('/prepare_verification')) {
          assert.equal(body.get('strategy'), `${kind}_code`);
          contact.verification = { ...contact.verification, status: 'unverified', attempts: 0 };
        } else if (url.pathname.endsWith('/attempt_verification')) {
          assert.equal(body.get('code'), invalidCode ? 'wrong' : '123456');
          if (invalidCode)
            return response(null, {
              status: 422,
              body: JSON.stringify({
                errors: [
                  {
                    code: 'form_code_incorrect',
                    message: 'Incorrect code',
                    long_message: 'Try again',
                    meta: { param_name: 'code' },
                  },
                ],
              }),
            });
          contact.verification = { ...contact.verification, status: 'verified', attempts: 1 };
        } else if (method === 'PATCH') {
          if (body.has('default_second_factor')) {
            assert.equal(body.get('default_second_factor'), 'true');
            contact.default_second_factor = true;
          } else {
            assert.ok(['true', 'false'].includes(body.get('reserved_for_second_factor')));
            contact.reserved_for_second_factor = body.get('reserved_for_second_factor') === 'true';
          }
        } else {
          assert.equal(request.method, 'POST');
          assert.equal(url.pathname, `/v1/me/${collection}/`);
          assert.equal(body.get(isEmail ? 'email_address' : 'phone_number'), value);
        }
        client.sessions[0].user[collection] = [structuredClone(contact)];
        return response(null, { body: JSON.stringify({ response: contact, client }) });
      },
    });
    t.after(f.dispose);
    const created = await f.invoke(f.state.roots.user, `User.create${type}`, [
      isEmail ? { email: value } : { phoneNumber: value },
    ]);
    assert.equal(
      created.failure,
      undefined,
      JSON.stringify({
        failure: created.failure,
        requests: f.requests.map(r => ({ method: r.method, url: r.url, body: r.body })),
      }),
    );
    const handle = created.result.$ref;
    assert.equal(f.resource(handle)[isEmail ? 'emailAddress' : 'phoneNumber'], value);
    assert.deepEqual(f.resource(f.state.roots.user)[projectedCollection], [created.result]);
    const prepared = await f.invoke(
      handle,
      `${type}.prepareVerification`,
      isEmail ? [{ $case: 0, value: { strategy: 'email_code' } }] : [],
    );
    assert.equal(prepared.failure, undefined, JSON.stringify(prepared.failure));
    invalidCode = true;
    const rejected = await f.invoke(handle, `${type}.attemptVerification`, [{ code: 'wrong' }]);
    assert.equal(rejected.failure.errors[0].code, 'form_code_incorrect');
    assert.equal(f.resource(f.resource(handle).verification.$ref).status, 'unverified');
    invalidCode = false;
    const verified = await f.invoke(handle, `${type}.attemptVerification`, [{ code: '123456' }]);
    assert.equal(verified.failure, undefined, JSON.stringify(verified.failure));
    assert.equal(f.resource(f.resource(handle).verification.$ref).status, 'verified');
    if (!isEmail) {
      for (const reserved of [true, false]) {
        const changed = await f.invoke(handle, 'PhoneNumber.setReservedForSecondFactor', [{ reserved }]);
        assert.equal(changed.failure, undefined, JSON.stringify(changed.failure));
        assert.equal(f.resource(handle).reservedForSecondFactor, reserved);
      }
      const preferred = await f.invoke(handle, 'PhoneNumber.makeDefaultSecondFactor');
      assert.equal(preferred.failure, undefined, JSON.stringify(preferred.failure));
      assert.equal(f.resource(handle).defaultSecondFactor, true);
    }
    const removed = await f.invoke(handle, `${type}.destroy`);
    assert.equal(removed.failure, undefined, JSON.stringify(removed.failure));
    assert.equal(removed.kind, 'complete');
    assert.equal(f.resource(handle)[isEmail ? 'emailAddress' : 'phoneNumber'], value);
    assert.deepEqual(f.resource(f.state.roots.user)[projectedCollection], []);
    assert.equal(
      f.messages.some(message => message.kind === 'runtimeError'),
      false,
    );
  });
}
