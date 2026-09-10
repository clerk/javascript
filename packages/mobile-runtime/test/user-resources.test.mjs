import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const initialUser = () => structuredClone(fixtures.authenticatedClient.sessions[0].user);
function clientWithUser(user) {
  const client = structuredClone(fixtures.authenticatedClient);
  client.sessions[0].user = user;
  return client;
}
function responseWithUser(payload, user) {
  return response(payload, { body: JSON.stringify({ response: payload, client: clientWithUser(user) }) });
}
function assertRequest(request, path, method, fields = {}) {
  const url = new URL(request.url);
  assert.equal(url.pathname, `/v1${path}`);
  assert.equal(url.searchParams.get('_method') ?? request.method, method);
  assert.equal(url.searchParams.get('_clerk_session_id'), 'sess_native');
  const body = new URLSearchParams(request.body ?? '');
  assert.deepEqual(Object.fromEntries(body), fields);
}

for (const value of [null, '']) {
  test(`clearing both profile names clears the generated full name (${JSON.stringify(value)})`, async t => {
    const user = { ...initialUser(), first_name: 'Original', last_name: 'Name' };
    const f = await fixture({
      client: clientWithUser(user),
      http: request =>
        new URL(request.url).pathname === '/v1/me'
          ? response({ ...user, first_name: value, last_name: value })
          : undefined,
    });
    t.after(f.dispose);
    const handle = f.state.roots.user;
    assert.equal(f.resource(handle).fullName, 'Original Name');
    const result = await f.invoke(handle, 'User.update', [{ firstName: value, lastName: value }]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.deepEqual(result.result.$ref, handle);
    const projected = f.resource(handle);
    assert.equal(projected.firstName, null);
    assert.equal(projected.lastName, null);
    assert.equal(projected.fullName, null);
    assertRequest(
      f.requests.find(r => new URL(r.url).pathname === '/v1/me'),
      '/me',
      'PATCH',
      { first_name: '', last_name: '' },
    );
  });
}

for (const outcome of ['receipt', 'resource', 'rejected']) {
  test(`profile image removal returns a usable generated image (${outcome})`, async t => {
    const user = { ...initialUser(), has_image: true, image_url: 'https://images.example/old.png' };
    const f = await fixture({
      client: clientWithUser(user),
      http: request => {
        if (!new URL(request.url).pathname.endsWith('/profile_image')) return;
        if (outcome === 'rejected')
          return response(null, {
            status: 403,
            body: JSON.stringify({ errors: [{ code: 'not_allowed_access', message: 'Not allowed' }] }),
          });
        const payload =
          outcome === 'receipt'
            ? { object: 'image', id: 'img_profile', deleted: true }
            : { object: 'image', id: 'img_profile', name: null, public_url: null };
        return responseWithUser(payload, { ...user, has_image: false, image_url: '' });
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.user, 'User.setProfileImage', [{ file: null }]);
    assertRequest(
      f.requests.find(r => new URL(r.url).pathname.endsWith('/profile_image')),
      '/me/profile_image',
      'DELETE',
    );
    if (outcome === 'rejected') {
      assert.equal(result.failure.errors[0].code, 'not_allowed_access');
      assert.equal(f.resource(f.state.roots.user).hasImage, true);
    } else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      const image = f.resource(result.result.$ref);
      assert.equal(image.id, 'img_profile');
      assert.equal(image.name, null);
      assert.equal(image.publicUrl, null);
      assert.equal(f.resource(f.state.roots.user).hasImage, false);
      assert.equal(f.resource(f.state.roots.user).imageUrl, '');
    }
  });
}

const metadataDesired = { token: 'new-value', nested: { keep: 'same', added: 'new' } };
const metadataPrevious = { token: 'old-value', serverOnly: true, nested: { keep: 'same', remove: 'old' } };
const replacementPatch = { token: 'new-value', serverOnly: null, nested: { added: 'new', remove: null } };
for (const [scenario, profile, current, desired, patch] of [
  ['identical', false, metadataDesired, metadataDesired, undefined],
  ['reloaded-current', false, metadataPrevious, metadataDesired, replacementPatch],
  ['reloaded-null', false, null, { token: 'some-value' }, { token: 'some-value' }],
  ['profile-current', true, metadataPrevious, metadataDesired, replacementPatch],
  ['profile-null', true, null, { token: 'some-value' }, { token: 'some-value' }],
]) {
  test(`generated deprecated user metadata replacement uses ${scenario}`, async t => {
    const user = { ...initialUser(), unsafe_metadata: { staleLocal: true } };
    const refreshed = {
      ...user,
      unsafe_metadata: current,
      ...(profile ? { first_name: 'John', last_name: 'Doe' } : {}),
    };
    const requests = [];
    const f = await fixture({
      client: clientWithUser(user),
      http: request => {
        const path = new URL(request.url).pathname;
        if (path === '/v1/me' || path === '/v1/me/metadata') {
          requests.push(request);
          return response(path.endsWith('/metadata') ? { ...refreshed, unsafe_metadata: desired } : refreshed);
        }
      },
    });
    t.after(f.dispose);
    const handle = f.state.roots.user;
    const params = { unsafeMetadata: desired, ...(profile ? { firstName: 'John', lastName: 'Doe' } : {}) };
    const result = await f.invoke(handle, 'User.update', [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.deepEqual(result.result.$ref, handle);
    assert.equal(requests.length, patch === undefined ? 1 : 2);
    assertRequest(
      requests[0],
      '/me',
      profile ? 'PATCH' : 'GET',
      profile ? { first_name: 'John', last_name: 'Doe' } : {},
    );
    if (patch !== undefined) {
      const body = new URLSearchParams(requests[1].body);
      assert.equal(requests[1].headers['content-type'], 'application/x-www-form-urlencoded');
      assert.deepEqual([...body.keys()], ['unsafe_metadata']);
      assert.deepEqual(JSON.parse(body.get('unsafe_metadata')), patch);
      assertRequest(requests[1], '/me/metadata', 'PATCH', { unsafe_metadata: body.get('unsafe_metadata') });
    }
    assert.deepEqual(f.resource(handle).unsafeMetadata, desired);
    if (profile) assert.equal(f.resource(handle).fullName, 'John Doe');
  });
}

test('generated metadata deep-merge forwards the explicit patch without replacing unrelated fields', async t => {
  const user = { ...initialUser(), unsafe_metadata: metadataPrevious };
  const patch = { nested: { remove: null, added: 'new' } };
  const expected = { token: 'old-value', serverOnly: true, nested: { keep: 'same', added: 'new' } };
  const requests = [];
  const f = await fixture({
    client: clientWithUser(user),
    http: request => {
      if (new URL(request.url).pathname === '/v1/me/metadata') {
        requests.push(request);
        return response({ ...user, unsafe_metadata: expected });
      }
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.user, 'User.updateMetadata', [{ unsafeMetadata: patch }]);
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(requests.length, 1);
  const body = new URLSearchParams(requests[0].body);
  assert.deepEqual(JSON.parse(body.get('unsafe_metadata')), patch);
  assertRequest(requests[0], '/me/metadata', 'PATCH', { unsafe_metadata: body.get('unsafe_metadata') });
  assert.deepEqual(f.resource(f.state.roots.user).unsafeMetadata, expected);
});

for (const [currentPassword, signOutOfOtherSessions] of [
  ['currentPassword123', true],
  [undefined, false],
]) {
  test(`generated password update preserves current password and sign-out flag (${signOutOfOtherSessions})`, async t => {
    const user = { ...initialUser(), password_enabled: false };
    const f = await fixture({
      client: clientWithUser(user),
      http: request =>
        new URL(request.url).pathname.endsWith('/change_password')
          ? response({ ...user, password_enabled: true })
          : undefined,
    });
    t.after(f.dispose);
    const params = {
      newPassword: 'newPassword123',
      signOutOfOtherSessions,
      ...(currentPassword === undefined ? {} : { currentPassword }),
    };
    const result = await f.invoke(f.state.roots.user, 'User.updatePassword', [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(f.resource(result.result.$ref).passwordEnabled, true);
    assertRequest(
      f.requests.find(r => new URL(r.url).pathname.endsWith('/change_password')),
      '/me/change_password',
      'POST',
      {
        new_password: 'newPassword123',
        sign_out_of_other_sessions: String(signOutOfOtherSessions),
        ...(currentPassword === undefined ? {} : { current_password: currentPassword }),
      },
    );
  });
}

for (const format of ['binary', 'string']) {
  test(`generated user image upload preserves ${format} data and published profile state`, async t => {
    const bytes = Buffer.from([0, 255, 128, 10, 13, 34]);
    const user = initialUser();
    const payload = {
      object: 'image',
      id: 'img_profile',
      name: 'profile',
      public_url: 'https://images.example/new.png',
    };
    const f = await fixture({
      client: clientWithUser(user),
      http: request =>
        new URL(request.url).pathname.endsWith('/profile_image')
          ? responseWithUser(payload, { ...user, has_image: true, image_url: payload.public_url })
          : undefined,
    });
    t.after(f.dispose);
    const file =
      format === 'binary'
        ? { $case: 2, value: { name: 'profile.png', contentType: 'image/png', base64: bytes.toString('base64') } }
        : { $case: 0, value: 'data:image/png;base64,' + bytes.toString('base64') };
    const result = await f.invoke(f.state.roots.user, 'User.setProfileImage', [{ file }]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const request = f.requests.find(r => new URL(r.url).pathname.endsWith('/profile_image'));
    assert.equal(request.method, 'POST');
    if (format === 'binary')
      assert.deepEqual(request.body, {
        multipart: [
          { name: 'file', filename: 'profile.png', contentType: 'image/png', base64: bytes.toString('base64') },
        ],
      });
    else {
      assert.equal(request.body, file.value);
      assert.equal(request.headers['content-type'], 'application/octet-stream');
    }
    const image = f.resource(result.result.$ref);
    assert.equal(image.id, payload.id);
    assert.equal(image.name, payload.name);
    assert.equal(image.publicUrl, payload.public_url);
    assert.equal(f.resource(f.state.roots.user).imageUrl, payload.public_url);
    assert.equal(f.resource(f.state.roots.user).hasImage, true);
  });
}

test('generated TOTP enrollment, verification, recovery and removal preserve explicit results and client flags', async t => {
  const secret = 'fixture_totp_secret';
  const codes = ['fixture_backup_one', 'fixture_backup_two'];
  const totp = {
    object: 'totp',
    id: 'totp_profile',
    secret,
    uri: 'otpauth://totp/fixture?secret=' + secret,
    verified: false,
    backup_codes: undefined,
    created_at: 1700000000000,
    updated_at: 1700000000000,
  };
  const user = initialUser();
  const requests = [];
  const f = await fixture({
    client: clientWithUser(user),
    http: request => {
      const url = new URL(request.url);
      const method = url.searchParams.get('_method') ?? request.method;
      if (url.pathname.startsWith('/v1/me/totp') || url.pathname.startsWith('/v1/me/backup_codes')) {
        requests.push(request);
        if (url.pathname.endsWith('/attempt_verification')) {
          if (new URLSearchParams(request.body).get('code') === 'wrong')
            return response(null, {
              status: 422,
              body: JSON.stringify({ errors: [{ code: 'form_code_incorrect', message: 'Incorrect code' }] }),
            });
          return responseWithUser(
            { ...totp, secret: undefined, uri: undefined, verified: true, backup_codes: codes },
            { ...user, totp_enabled: true, two_factor_enabled: true },
          );
        }
        if (method === 'DELETE')
          return responseWithUser(
            { object: 'totp', id: totp.id, deleted: true },
            { ...user, totp_enabled: false, two_factor_enabled: false },
          );
        if (url.pathname.includes('/backup_codes'))
          return responseWithUser(
            { object: 'backup_code', id: 'bc_profile', codes, created_at: 1700000000000, updated_at: 1700000000000 },
            { ...user, totp_enabled: true, two_factor_enabled: true, backup_code_enabled: true },
          );
        return response(totp);
      }
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.user;
  const created = await f.invoke(handle, 'User.createTOTP');
  assert.equal(created.failure, undefined, JSON.stringify(created.failure));
  assert.equal(created.result.secret, secret);
  assert.equal(created.result.verified, false);
  assert.equal(created.result.uri, totp.uri);
  assert.equal(JSON.stringify(f.state).includes(secret), false);
  const rejected = await f.invoke(handle, 'User.verifyTOTP', [{ code: 'wrong' }]);
  assert.equal(rejected.failure.errors[0].code, 'form_code_incorrect');
  assert.equal(f.resource(handle).totpEnabled, false);
  const verified = await f.invoke(handle, 'User.verifyTOTP', [{ code: '123456' }]);
  assert.equal(verified.failure, undefined, JSON.stringify(verified.failure));
  assert.equal(verified.result.verified, true);
  assert.deepEqual(verified.result.backupCodes, codes);
  assert.equal(f.resource(handle).totpEnabled, true);
  assert.equal(f.resource(handle).twoFactorEnabled, true);
  const backup = await f.invoke(handle, 'User.createBackupCode');
  assert.equal(backup.failure, undefined, JSON.stringify(backup.failure));
  assert.deepEqual(backup.result.codes, codes);
  assert.equal(f.resource(handle).backupCodeEnabled, true);
  assert.equal(JSON.stringify(f.state).includes(codes[0]), false);
  const removed = await f.invoke(handle, 'User.disableTOTP');
  assert.equal(removed.failure, undefined, JSON.stringify(removed.failure));
  assert.equal(removed.result.id, totp.id);
  assert.equal(removed.result.deleted, true);
  assert.equal(f.resource(handle).totpEnabled, false);
  assertRequest(requests[0], '/me/totp', 'POST');
  assertRequest(requests[1], '/me/totp/attempt_verification', 'POST', { code: 'wrong' });
  assertRequest(requests[2], '/me/totp/attempt_verification', 'POST', { code: '123456' });
  assertRequest(requests[3], '/me/backup_codes/', 'POST');
  assertRequest(requests[4], '/me/totp', 'DELETE');
});

const publicOrganization = {
  id: 'org_user',
  name: 'User organization',
  slug: 'user-org',
  has_image: false,
  image_url: '',
};
const organization = {
  ...publicOrganization,
  object: 'organization',
  public_metadata: {},
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const membership = {
  object: 'organization_membership',
  id: 'orgmem_user',
  organization,
  role: 'org:member',
  role_name: 'Member',
  permissions: ['org:custom:permission'],
  public_metadata: {},
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const invitation = {
  object: 'organization_invitation',
  id: 'orginv_user',
  email_address: 'user@example.com',
  public_organization_data: publicOrganization,
  public_metadata: {},
  role: 'org:member',
  status: 'pending',
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const suggestion = {
  object: 'organization_suggestion',
  id: 'orgsug_user',
  public_organization_data: publicOrganization,
  status: 'pending',
  created_at: 1700000000000,
  updated_at: 1700000000000,
};

for (const [method, path, row, initialPage, status] of [
  ['getOrganizationInvitations', 'organization_invitations', invitation, 1, undefined],
  ['getOrganizationInvitations', 'organization_invitations', invitation, 2, 'pending'],
  ['getOrganizationSuggestions', 'organization_suggestions', suggestion, 1, []],
  ['getOrganizationSuggestions', 'organization_suggestions', suggestion, 2, ['pending', 'accepted']],
  ['getOrganizationMemberships', 'organization_memberships', membership, 1, undefined],
  ['getOrganizationMemberships', 'organization_memberships', membership, 3, undefined],
]) {
  test(`generated user ${method} preserves page ${initialPage} and status filters`, async t => {
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request =>
        new URL(request.url).pathname === `/v1/me/${path}` ? response({ data: [row], total_count: 31 }) : undefined,
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.user, `User.${method}`, [
      {
        initialPage,
        pageSize: 10,
        ...(status === undefined
          ? {}
          : { status: method === 'getOrganizationSuggestions' ? { $case: 2, value: status } : status }),
      },
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.total_count, 31);
    const value = f.resource(result.result.data[0].$ref);
    assert.equal(value.id, row.id);
    if (row.status) assert.equal(value.status, row.status);
    if (row.permissions) assert.deepEqual(value.permissions, row.permissions);
    const request = f.requests.find(r => new URL(r.url).pathname === `/v1/me/${path}`);
    assert.equal(request.method, 'GET');
    const query = new URL(request.url).searchParams;
    assert.equal(query.get('offset'), String((initialPage - 1) * 10));
    assert.equal(query.get('limit'), '10');
    assert.equal(query.get('_clerk_session_id'), 'sess_native');
    assert.deepEqual(query.getAll('status'), status === undefined ? [] : Array.isArray(status) ? status : [status]);
    assert.equal(query.get('paginated'), path === 'organization_memberships' ? 'true' : null);
  });
}

for (const rejected of [false, true]) {
  test(`generated leaveOrganization publishes client membership changes (rejected=${rejected})`, async t => {
    const client = clientWithUser({ ...initialUser(), organization_memberships: [membership] });
    client.sessions[0].last_active_organization_id = organization.id;
    const updatedClient = structuredClone(client);
    updatedClient.sessions[0].user.organization_memberships = [];
    updatedClient.sessions[0].last_active_organization_id = null;
    const receipt = { object: 'organization_membership', id: membership.id, deleted: true };
    const f = await fixture({
      client,
      http: request =>
        new URL(request.url).pathname === `/v1/me/organization_memberships/${organization.id}`
          ? rejected
            ? response(null, {
                status: 403,
                body: JSON.stringify({ errors: [{ code: 'not_allowed_access', message: 'Not allowed' }] }),
              })
            : response(receipt, { body: JSON.stringify({ response: receipt, client: updatedClient }) })
          : undefined,
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.user, 'User.leaveOrganization', [organization.id]);
    assertRequest(
      f.requests.find(r => new URL(r.url).pathname.endsWith(`/${organization.id}`)),
      `/me/organization_memberships/${organization.id}`,
      'DELETE',
    );
    if (rejected) {
      assert.equal(result.failure.errors[0].code, 'not_allowed_access');
      assert.equal(f.resource(f.state.roots.user).organizationMemberships.length, 1);
      assert.equal(f.resource(f.state.roots.organization).id, organization.id);
    } else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result.id, membership.id);
      assert.equal(result.result.deleted, true);
      assert.deepEqual(f.resource(f.state.roots.user).organizationMemberships, []);
      assert.equal(f.state.roots.organization, null);
    }
  });
}

for (const rejected of [false, true]) {
  test(`generated user deletion reconciles the server's cleared client (rejected=${rejected})`, async t => {
    const cleared = { ...fixtures.authenticatedClient, sessions: [], last_active_session_id: null };
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request =>
        new URL(request.url).pathname === '/v1/me'
          ? rejected
            ? response(null, {
                status: 403,
                body: JSON.stringify({ errors: [{ code: 'not_allowed_access', message: 'Not allowed' }] }),
              })
            : response(
                { object: 'user', id: 'user_native', deleted: true },
                {
                  body: JSON.stringify({
                    response: { object: 'user', id: 'user_native', deleted: true },
                    client: cleared,
                  }),
                },
              )
          : undefined,
    });
    t.after(f.dispose);
    const user = f.state.roots.user;
    const session = f.state.roots.session;
    const result = await f.invoke(user, 'User.delete');
    assertRequest(
      f.requests.find(r => new URL(r.url).pathname === '/v1/me'),
      '/me',
      'DELETE',
    );
    if (rejected) {
      assert.equal(result.failure.errors[0].code, 'not_allowed_access');
      assert.deepEqual(f.state.roots.user, user);
      assert.deepEqual(f.state.roots.session, session);
    } else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(f.state.roots.user, null);
      assert.equal(f.state.roots.session, null);
      assert.equal((await f.invoke(session, 'Session.getToken')).failure.code, 'stale_resource');
    }
  });
}

test('user invitation filters follow the canonical single-status contract', async t => {
  const f = await fixture({ client: fixtures.authenticatedClient });
  t.after(f.dispose);
  const before = f.requests.length;
  const result = await f.invoke(f.state.roots.user, 'User.getOrganizationInvitations', [
    { status: ['pending', 'accepted'] },
  ]);
  assert.equal(result.failure.code, 'invalid_bridge_value');
  assert.equal(f.requests.length, before);
});
