import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import net from 'node:net';
import { describe, it } from 'node:test';
import { inspect } from 'node:util';
import { CONNECT_ATTEMPT_MS, TEST_PHONES, newTestEmail, parseTestEmail, parseTestPhone, runEmailPrefix, runPassword, testUsers } from '../specs/support/clerk.ts';
import { newRunId, readClerk } from '../specs/support/inputs.ts';
import { redact, usedSecretValues } from '../specs/support/secret.ts';
import type { RunId } from '../specs/support/types.ts';
import { SAMPLE_PUBLISHABLE_KEY, SAMPLE_RUN } from '../testing/sample-inputs.ts';

const SECRET_KEY = 'sk_test_testUsersUnitTest0123456789';

interface Sent {
  readonly method: string;
  readonly url: string;
  readonly authorization: string | null;
  readonly body: Record<string, unknown> | null;
  readonly signal: AbortSignal | null | undefined;
}

function clerk(answer: (sent: Sent, n: number) => { readonly status: number; readonly body: unknown }) {
  const sent: Sent[] = [];
  const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
    const request: Sent = { method: init?.method ?? 'GET', url: String(url), authorization: new Headers(init?.headers).get('authorization'), body: typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : null, signal: init?.signal };
    sent.push(request);
    const reply = answer(request, sent.length);
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  }) as typeof fetch;
  return { sent, fetchImpl };
}

const created = (_sent: Sent, n: number) => ({ status: 200, body: { id: `user_${n}`, token: `ticket_${n}_0123456789` } });

describe('the users a test asks for', () => {
  it('come from api.clerk.com with the secret key when a person gives the keys of a development instance', async () => {
    const { sent, fetchImpl } = clerk(created);
    const users = testUsers(readClerk({ CLERK_PUBLISHABLE_KEY: SAMPLE_PUBLISHABLE_KEY, CLERK_SECRET_KEY: SECRET_KEY }), SAMPLE_RUN, fetchImpl);
    const user = await users.seed();
    await users.signInTicket(user);
    assert.deepEqual(sent.map((request) => [request.method, request.url, request.authorization]), [
      ['POST', 'https://api.clerk.com/v1/users', `Bearer ${SECRET_KEY}`],
      ['POST', 'https://api.clerk.com/v1/sign_in_tokens', `Bearer ${SECRET_KEY}`],
    ]);
    assert.deepEqual(sent[1]!.body, { user_id: 'user_1', expires_in_seconds: 120 });
    assert.ok(sent[0]!.signal instanceof AbortSignal, 'each call has a time limit');
  });

  it('come from the stand-in with its token, and the same requests, when the CLI runs the test', async () => {
    const tokenFile = join(mkdtempSync(join(tmpdir(), 'verify-token-')), 'broker-token');
    writeFileSync(tokenFile, 'run-token-0123456789abcdef');
    const { sent, fetchImpl } = clerk(created);
    const users = testUsers(readClerk({ CLERK_PUBLISHABLE_KEY: SAMPLE_PUBLISHABLE_KEY, CLERK_E2E_API_URL: 'http://127.0.0.1:4010/v1', CLERK_E2E_API_TOKEN_FILE: tokenFile }), SAMPLE_RUN, fetchImpl);
    const user = await users.seed();
    await users.signInTicket(user);
    assert.deepEqual(sent.map((request) => [request.method, request.url, request.authorization]), [
      ['POST', 'http://127.0.0.1:4010/v1/users', 'Bearer run-token-0123456789abcdef'],
      ['POST', 'http://127.0.0.1:4010/v1/sign_in_tokens', 'Bearer run-token-0123456789abcdef'],
    ]);
  });

  const byHand = (answer: Parameters<typeof clerk>[0]) => {
    const fake = clerk(answer);
    return { ...fake, users: testUsers(readClerk({ CLERK_PUBLISHABLE_KEY: SAMPLE_PUBLISHABLE_KEY, CLERK_SECRET_KEY: SECRET_KEY }), SAMPLE_RUN, fake.fetchImpl) };
  };

  it('have an address of this run, a new one each time, and no Clerk call for an address alone', async () => {
    const { sent, users } = byHand(created);
    const [one, two] = [users.newEmail(), users.newEmail()];
    assert.match(one, /^1412107c1e[0-9a-z]{4}\+clerk_test@example\.com$/);
    assert.notEqual(one, two);
    assert.equal(one.startsWith(runEmailPrefix(SAMPLE_RUN)), true);
    assert.deepEqual(sent, []);
    assert.equal((await users.seed()).email.startsWith(runEmailPrefix(SAMPLE_RUN)), true);
  });

  it('have an address at the domain a test names, such as the domain of an organization it seeded', () => {
    const { users } = byHand(created);
    assert.match(users.newEmail({ domain: '1412107c1eab12.clerk.test' }), /^1412107c1e[0-9a-z]{4}\+clerk_test@1412107c1eab12\.clerk\.test$/);
  });

  it('have an address that starts with the time of day and the four characters of the run id, and none for an id of another shape', () => {
    assert.equal(runEmailPrefix(SAMPLE_RUN), '1412107c1e');
    for (const id of ['r20261002-141210', 'R20261002-141210-7C1E', 'r20261002_141210_7c1e', '20261002-141210-7c1e', '']) {
      assert.throws(() => newTestEmail(id as RunId), new RegExp(`^Error: ${id} is not a run id like r20261002-141210-7c1e$`), id);
    }
  });

  it('have an address that ends in four characters drawn from all of 0-9 and a-z', () => {
    const drawn = new Set(Array.from({ length: 500 }, () => newTestEmail(SAMPLE_RUN).slice(10, 14)).join(''));
    assert.equal([...drawn].sort().join(''), '0123456789abcdefghijklmnopqrstuvwxyz');
  });

  it('get a password of their own only when asked, and it never shows', async () => {
    const { sent, users } = byHand(created);
    const plain = await users.seed();
    assert.deepEqual([plain.password, sent[0]!.body!.skip_password_requirement, 'password' in sent[0]!.body!], [null, true, false]);
    const one = await users.seed({ password: true });
    const two = await users.seed({ password: true });
    const [first, second] = [String(sent[1]!.body!.password), String(sent[2]!.body!.password)];
    assert.notEqual(first, second, 'each user has its own password');
    for (const typed of [first, second]) assert.match(typed, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/, 'it meets the password rules of the standard settings');
    assert.deepEqual([sent[1]!.body!.bypass_client_trust, 'skip_password_requirement' in sent[1]!.body!], [true, false], 'a password sign-in on a new device asks for no second step');
    assert.equal(one.password!.use('device-input', (value) => value), first, 'the test can type the password Clerk was sent');
    for (const shown of [String(one.password), JSON.stringify(one), inspect(one), JSON.stringify(two)]) assert.equal(shown.includes(first) || shown.includes(second), false);
    assert.equal(redact(`typed ${first}`), 'typed <redacted>');
    assert.ok(usedSecretValues().includes(first));
  });

  it('sign up with the password of the run, which is a secret whole and in each piece a test types it in', () => {
    const run = newRunId();
    const password = `Verify-${run}-Pw1!`;
    assert.equal(redact(`typed ${password}`), `typed ${password}`, 'nothing knows it before the test process asks for the users of the run');
    testUsers(readClerk({ CLERK_PUBLISHABLE_KEY: SAMPLE_PUBLISHABLE_KEY, CLERK_SECRET_KEY: SECRET_KEY }), run, clerk(created).fetchImpl);
    assert.equal(redact(`typed ${password}`), 'typed <redacted>');
    assert.equal(redact(`input text ${password.slice(0, 16)}`), 'input text <redacted>');
    assert.equal(redact(`input text ${password.slice(16, 32)}`), 'input text <redacted>');
    assert.equal(redact(`input text ${password.slice(32)}`), 'input text !', 'one character is not a secret');
  });

  it('get a password that is a secret in each piece a test types it in', async () => {
    const { sent, fetchImpl } = clerk(created);
    await testUsers(readClerk({ CLERK_PUBLISHABLE_KEY: SAMPLE_PUBLISHABLE_KEY, CLERK_SECRET_KEY: SECRET_KEY }), SAMPLE_RUN, fetchImpl).seed({ password: true });
    const password = sent[0]!.body!.password as string;
    assert.equal(password.length, 28);
    assert.equal(redact(`input text ${password.slice(0, 16)} then ${password.slice(16)}`), 'input text <redacted> then <redacted>');
  });

  it('type one text made from the run id in the e2e tests, the password the run knows', () => {
    const committed = join(import.meta.dirname, '..', 'specs', 'features');
    const sources = readdirSync(committed, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.e2e.ts')).map((file) => readFileSync(join(committed, file), 'utf8'));
    const filled = sources.flatMap((source) => [...source.matchAll(/host\.fill\([^;]*?(`[^`]*\$\{host\.runId\}[^`]*`)\);/g)].map((match) => match[1]));
    assert.deepEqual([...new Set(filled)], ['`Verify-${host.runId}-Pw1!`']);
    assert.equal(runPassword(SAMPLE_RUN).use('device-input', (plain) => plain), `Verify-${SAMPLE_RUN}-Pw1!`);
  });

  it('get a test phone no user holds: a taken one moves on to the next, and one test is never handed the same phone twice', async () => {
    const free = TEST_PHONES.slice(40, 42);
    const held = new Set<string>(TEST_PHONES.filter((phone) => !free.includes(phone)));
    const { users } = byHand((sent) => {
      const asked = new URL(sent.url).searchParams.get('phone_number');
      if (asked !== null) return { status: 200, body: held.has(asked) ? [{ id: 'user_0' }] : [] };
      const [phone] = (sent.body?.phone_number as string[] | undefined) ?? [];
      if (phone !== undefined && held.has(phone)) return { status: 422, body: { errors: [{ code: 'form_identifier_exists' }] } };
      if (phone !== undefined) held.add(phone);
      return { status: 200, body: { id: `user_${held.size}` } };
    });
    const reserved = await users.newPhone();
    const seeded = (await users.seed({ phone: true })).phone!;
    assert.deepEqual([reserved, seeded].sort(), [...free].sort(), 'the lookup and the seed share out the two numbers nobody holds');
    await assert.rejects(users.newPhone(), /every 555-0100\.\.0199 test phone is taken on this instance/);
    await assert.rejects(users.seed({ phone: true }), /every 555-0100\.\.0199 test phone is taken on this instance; delete its test users, or seed without a phone/);
  });

  it('do not go through a hundred phones when the instance takes no phone at all', async () => {
    const { sent, users } = byHand(() => ({ status: 422, body: { errors: [{ code: 'form_param_unknown', long_message: 'phone_number is not a valid parameter for this request.' }] } }));
    await assert.rejects(users.seed({ phone: true }), /^Error: Clerk POST \/users answered 422: phone_number is not a valid parameter for this request\.$/);
    assert.equal(sent.length, 1);
  });

  const SEEDER = { id: 'user_1', email: newTestEmail(SAMPLE_RUN), phone: null, password: null } as const;
  const MEMBER = { id: 'user_2', email: newTestEmail(SAMPLE_RUN), phone: null, password: null } as const;
  const READER_PERMISSIONS = [{ id: 'perm_dr', key: 'org:sys_domains:read' }, { id: 'perm_mr', key: 'org:sys_memberships:read' }];
  const organizations = (roles: (n: number) => { readonly status: number; readonly body: unknown }, createRole: { readonly status: number; readonly body: unknown } = { status: 200, body: { id: 'role_1' } }) =>
    byHand((sent, n) => {
      const path = new URL(sent.url).pathname;
      if (path === '/v1/organization_roles' && sent.method === 'GET') return roles(n);
      if (path === '/v1/organization_roles') return createRole;
      if (path === '/v1/organization_permissions') return { status: 200, body: { data: [...READER_PERMISSIONS, { id: 'perm_dm', key: 'org:sys_domains:manage' }] } };
      if (path === '/v1/organizations') return { status: 200, body: { id: 'org_9' } };
      return { status: 200, body: {} };
    });

  it('seed an organization with members of a role and a domain, making the role first when the instance lacks it', async () => {
    const { sent, users } = organizations(() => ({ status: 200, body: { data: [] } }));
    const org = await users.seedOrganization({ creator: SEEDER, members: [{ user: MEMBER, role: 'org:e2e_domains_reader' }], suggestDomain: true });
    assert.deepEqual(
      sent.map((request) => [request.method, request.url, request.body]),
      [
        ['GET', 'https://api.clerk.com/v1/organization_roles?query=org%3Ae2e_domains_reader', null],
        ['GET', 'https://api.clerk.com/v1/organization_permissions?query=org%3Asys_&limit=100', null],
        ['POST', 'https://api.clerk.com/v1/organization_roles', { name: 'Domains reader', key: 'org:e2e_domains_reader', permissions: ['perm_dr', 'perm_mr'] }],
        ['POST', 'https://api.clerk.com/v1/organizations', { name: org.name, created_by: 'user_1' }],
        ['POST', 'https://api.clerk.com/v1/organizations/org_9/memberships', { user_id: 'user_2', role: 'org:e2e_domains_reader' }],
        ['POST', 'https://api.clerk.com/v1/organizations/org_9/domains', { name: org.domain, enrollment_mode: 'automatic_suggestion', verified: true }],
      ],
    );
    assert.match(org.name, /^1412107c1e [0-9a-f]{6}$/);
    assert.match(org.domain, /^1412107c1e[0-9a-z]{4}\.clerk\.test$/);
    assert.equal(org.id, 'org_9');
  });

  it('seed an organization with a default role and no domain, looking up no role', async () => {
    const { sent, users } = organizations(() => ({ status: 500, body: null }));
    const org = await users.seedOrganization({ creator: SEEDER, members: [{ user: MEMBER, role: 'org:member' }] });
    assert.deepEqual(sent.map((request) => [request.method, new URL(request.url).pathname]), [
      ['POST', '/v1/organizations'],
      ['POST', '/v1/organizations/org_9/memberships'],
    ]);
    assert.equal(org.domain, null);
  });

  it('use the role the instance holds when it has the permissions of the table, and refuse one that does not', async () => {
    const holds = organizations(() => ({ status: 200, body: { data: [{ id: 'role_1', key: 'org:e2e_domains_reader', permissions: READER_PERMISSIONS }] } }));
    await holds.users.seedOrganization({ creator: SEEDER, members: [{ user: MEMBER, role: 'org:e2e_domains_reader' }] });
    assert.deepEqual(holds.sent.map((request) => [request.method, new URL(request.url).pathname]), [
      ['GET', '/v1/organization_roles'],
      ['POST', '/v1/organizations'],
      ['POST', '/v1/organizations/org_9/memberships'],
    ]);
    const stale = organizations(() => ({ status: 200, body: { data: [{ id: 'role_1', key: 'org:e2e_domains_reader', permissions: [{ key: 'org:sys_domains:read' }] }] } }));
    await assert.rejects(
      stale.users.seedOrganization({ creator: SEEDER, members: [{ user: MEMBER, role: 'org:e2e_domains_reader' }] }),
      /^Error: role org:e2e_domains_reader on this instance has the permissions org:sys_domains:read, and the tests give it org:sys_domains:read, org:sys_memberships:read; run down so the next run creates a new application$/,
    );
    assert.equal(stale.sent.length, 1, 'no organization is created with the wrong role');
  });

  it('use the role another test made at the same moment, when Clerk says its key is taken', async () => {
    const { sent, users } = organizations(
      (n) => ({ status: 200, body: { data: n === 1 ? [] : [{ id: 'role_1', key: 'org:e2e_domains_reader', permissions: READER_PERMISSIONS }] } }),
      { status: 422, body: { errors: [{ code: 'form_identifier_exists', message: 'That key is taken. Please try another.' }] } },
    );
    const org = await users.seedOrganization({ creator: SEEDER, members: [{ user: MEMBER, role: 'org:e2e_domains_reader' }] });
    assert.equal(org.id, 'org_9');
    assert.deepEqual(sent.map((request) => [request.method, new URL(request.url).pathname]), [
      ['GET', '/v1/organization_roles'],
      ['GET', '/v1/organization_permissions'],
      ['POST', '/v1/organization_roles'],
      ['GET', '/v1/organization_roles'],
      ['POST', '/v1/organizations'],
      ['POST', '/v1/organizations/org_9/memberships'],
    ]);
  });

  it("say what Clerk said when it refuses, in Clerk's words", async () => {
    const quota = byHand(() => ({ status: 403, body: { errors: [{ code: 'user_quota_exceeded', message: 'Quota exceeded', long_message: 'You have reached your limit of 100 users.' }] } }));
    await assert.rejects(quota.users.seed(), /^Error: Clerk POST \/users answered 403: You have reached your limit of 100 users\.$/);
    const key = byHand(() => ({ status: 401, body: { errors: [{ code: 'authentication_invalid', message: 'Invalid authentication' }] } }));
    await assert.rejects(key.users.signInTicket({ id: 'user_1', email: newTestEmail(SAMPLE_RUN), phone: null, password: null }), /^Error: Clerk POST \/sign_in_tokens answered 401: Invalid authentication$/);
    const empty = byHand(() => ({ status: 500, body: null }));
    await assert.rejects(empty.users.newPhone(), /^Error: Clerk GET \/users answered 500$/);
  });
});

describe('a request to Clerk', () => {
  it('gives each address of the host longer to connect than the quarter second Node allows by default', () => {
    assert.equal(net.getDefaultAutoSelectFamilyAttemptTimeout(), CONNECT_ATTEMPT_MS);
    assert.ok(CONNECT_ATTEMPT_MS >= 2_000);
  });
});

describe('test identities', () => {
  it('are +clerk_test addresses and 555-01xx phones, and nothing else', () => {
    assert.equal(parseTestEmail('verify_1+clerk_test@example.com'), 'verify_1+clerk_test@example.com');
    assert.throws(() => parseTestEmail('someone@example.com'), /is not a \+clerk_test email/);
    assert.throws(() => parseTestEmail('verify_1@example.com'), /is not a \+clerk_test email/);
    assert.equal(parseTestPhone('+1 (201) 555-0142'), '+12015550142');
    assert.throws(() => parseTestPhone('+1 201 555 0200'), /is not a 555-0100\.\.0199 test phone/);
  });
});
