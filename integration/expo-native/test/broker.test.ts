import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import net from 'node:net';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { TEST_PHONES, aboutToLaunch, newTestDomain, newTestEmail, runEmailPrefix, testUsers } from '../specs/support/clerk.ts';
import { Secret, usedSecretValues } from '../specs/support/secret.ts';
import { startBroker, type Broker } from '../src/core/broker.ts';
import { REPLACE_AT_USERS } from '../src/core/clerk.ts';
import { VerifyFailure, type PublishableKey, type RunId } from '../src/core/types.ts';
import { openWorkspace } from '../src/core/workspace.ts';

const SECRET_KEY = 'sk_test_standInUnitTest0123456789';
const keys = { pk: 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey, sk: new Secret('clerk-secret-key', SECRET_KEY) };

interface Forwarded {
  readonly method: string;
  readonly url: string;
  readonly authorization: string | null;
  readonly body: Record<string, unknown> | null;
  readonly text: string | null;
}

type Clerk = (request: Forwarded) => { readonly status: number; readonly body: unknown };

let minted = 0;

const emptyClerk: Clerk = (request) => {
  if (request.method === 'GET') return { status: 200, body: [] };
  if (request.url.endsWith('/sign_in_tokens')) return { status: 200, body: { object: 'sign_in_token', token: `ticket_${(minted += 1)}_for_${String(request.body?.user_id)}_0123456789` } };
  return { status: 200, body: { object: 'user', id: 'user_created_1', email_addresses: [{ email_address: 'private@example.com' }] } };
};

async function standIn(clerk: Clerk = emptyClerk, beforeLaunch: () => Promise<void> = async () => undefined) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-stand-in-'));
  const workspace = openWorkspace({ packageDir: dir, worktree: dir, home: join(dir, 'home') });
  const { run, scratch } = workspace.newRun();
  const forwarded: Forwarded[] = [];
  const bapi = (async (url: string | URL, init?: RequestInit) => {
    const request: Forwarded = {
      method: init?.method ?? 'GET',
      url: String(url),
      authorization: new Headers(init?.headers).get('authorization'),
      body: typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : null,
      text: typeof init?.body === 'string' ? init.body : null,
    };
    forwarded.push(request);
    const answer = clerk(request);
    return new Response(JSON.stringify(answer.body), { status: answer.status });
  }) as typeof fetch;
  const broker = await startBroker(run, workspace, scratch, { keys: () => keys, fetch: bapi, beforeLaunch });
  const ask = async (method: string, path: string, body?: unknown, token: string = readFileSync(broker.tokenFile, 'utf8')) => {
    const response = await fetch(`${broker.url}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
    const text = await response.text();
    return { status: response.status, json: (text === '' ? null : JSON.parse(text)) as { errors?: { code: string; long_message: string }[] } & Record<string, unknown> };
  };
  const access = { kind: 'stand-in', url: broker.url, tokenFile: broker.tokenFile } as const;
  const users = testUsers({ publishableKey: keys.pk, access }, run);
  return { broker, workspace, run, forwarded, ask, users, access };
}

function organizationClerk({ roleExists = false } = {}): Clerk {
  let users = 0;
  let organizations = 0;
  const permissions = [
    { object: 'permission', id: 'perm_domains_read', key: 'org:sys_domains:read', name: 'Read domains', type: 'system' },
    { object: 'permission', id: 'perm_memberships_read', key: 'org:sys_memberships:read', name: 'Read members', type: 'system' },
    { object: 'permission', id: 'perm_domains_manage', key: 'org:sys_domains:manage', name: 'Manage domains', type: 'system' },
  ];
  const role = { object: 'role', id: 'role_1', key: 'org:e2e_domains_reader', name: 'Domains reader', description: '', permissions: permissions.slice(0, 2) };
  return (request) => {
    const path = new URL(request.url).pathname.replace('/v1', '');
    if (request.method === 'GET' && path === '/organization_permissions') return { status: 200, body: { data: permissions, total_count: permissions.length } };
    if (request.method === 'GET' && path === '/organization_roles') return { status: 200, body: roleExists ? { data: [role], total_count: 1 } : { data: [], total_count: 0 } };
    if (request.method === 'POST' && path === '/organization_roles') return (roleExists = true), { status: 200, body: role };
    if (request.method === 'POST' && path === '/users') return { status: 200, body: { object: 'user', id: `user_${(users += 1)}` } };
    if (request.method === 'POST' && path === '/organizations') return { status: 200, body: { object: 'organization', id: `org_${(organizations += 1)}`, name: request.body?.name, private_metadata: {} } };
    if (request.method === 'POST' && path.endsWith('/memberships')) return { status: 200, body: { object: 'organization_membership', id: 'orgmem_1', role: request.body?.role } };
    if (request.method === 'POST' && path.endsWith('/domains')) return { status: 200, body: { object: 'organization_domain', id: 'orgdmn_1', name: request.body?.name } };
    return emptyClerk(request);
  };
}

const stopping = async <T>(broker: Broker, body: () => Promise<T>): Promise<T> => {
  try {
    return await body();
  } finally {
    await broker.stop();
  }
};

const whyRefused = (answer: { readonly json: { errors?: { long_message: string }[] } }): string => answer.json.errors?.[0]?.long_message ?? '';

describe("the CLI's stand-in for the Backend API", () => {
  it('forwards the three calls the tests make with the instance key, which the test process never holds', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const user = await s.users.seed({ password: true });
      const ticket = await s.users.signInTicket(user);
      await s.users.newPhone();
      assert.deepEqual(
        s.forwarded.map((request) => [request.method, request.url.split('?')[0], request.authorization]),
        [
          ['POST', 'https://api.clerk.com/v1/users', `Bearer ${SECRET_KEY}`],
          ['POST', 'https://api.clerk.com/v1/sign_in_tokens', `Bearer ${SECRET_KEY}`],
          ['GET', 'https://api.clerk.com/v1/users', `Bearer ${SECRET_KEY}`],
        ],
      );
      assert.equal(readFileSync(s.broker.tokenFile, 'utf8').includes(SECRET_KEY), false, 'the token the test process reads is not the key');
      assert.deepEqual(s.forwarded[1]!.body, { user_id: 'user_created_1', expires_in_seconds: 120 });
      assert.equal(user.email.startsWith(runEmailPrefix(s.run)), true);
      assert.deepEqual(
        s.workspace.entries().flatMap((entry) => (entry.kind === 'user' ? [[entry.run, entry.userId, entry.email]] : [])),
        [[s.run, 'user_created_1', user.email]],
        'the run ledgers each user it created',
      );
      assert.match(ticket.use('launch-argument', (plain) => plain), /^ticket_\d+_for_user_created_1_/);
    });
  });

  it('learns the password and the ticket that pass through it, so the CLI redacts them and scans the evidence for them', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const password = 'a-password-only-the-test-process-made-Aa1!';
      const created = await s.ask('POST', '/users', { email_address: [newTestEmail(s.run)], password, bypass_client_trust: true });
      assert.equal(usedSecretValues().includes(password), true);
      const ticket = await s.ask('POST', '/sign_in_tokens', { user_id: created.json.id, expires_in_seconds: 120 });
      assert.equal(typeof ticket.json.token, 'string');
      assert.equal(usedSecretValues().includes(String(ticket.json.token)), true);
    });
  });

  it('learns the pieces a test types the password in, and its own token', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const password = 'a-password-typed-in-pieces-of-sixteen-Aa1!';
      await s.ask('POST', '/users', { email_address: [newTestEmail(s.run)], password, bypass_client_trust: true });
      for (const piece of ['a-password-typed', '-in-pieces-of-si', 'xteen-Aa1!']) assert.equal(usedSecretValues().includes(piece), true, piece);
      assert.equal(usedSecretValues().includes(readFileSync(s.broker.tokenFile, 'utf8')), true);
    });
  });

  it('refuses a request without the run token before anything is forwarded', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const body = { email_address: [newTestEmail(s.run)], skip_password_requirement: true };
      assert.equal((await s.ask('POST', '/users', body, 'not-the-token')).status, 401);
      assert.equal((await s.ask('POST', '/users', body, SECRET_KEY)).status, 401);
      assert.equal((await fetch(`${s.broker.url}/users`, { method: 'POST', body: JSON.stringify(body) })).status, 401);
      assert.deepEqual(s.forwarded, []);
    });
  });

  it('lets the CLI get ready each time a test is about to launch the app, answers when it is, and sends Clerk nothing', async () => {
    const launches: string[] = [];
    const s = await standIn(emptyClerk, async () => {
      launches.push('asked');
      await new Promise((resolve) => setTimeout(resolve, 20));
      launches.push('ready');
    });
    await stopping(s.broker, async () => {
      await aboutToLaunch(s.access);
      launches.push('launch 1');
      await aboutToLaunch(s.access);
      launches.push('launch 2');
      assert.deepEqual(launches, ['asked', 'ready', 'launch 1', 'asked', 'ready', 'launch 2']);
      assert.equal((await s.ask('POST', '/about_to_launch', undefined, 'not-the-token')).status, 401);
      assert.equal(launches.length, 6, 'a process without the run token starts nothing');
      assert.deepEqual(s.forwarded, []);
    });
  });

  it('stops the launch with the reason and the fix when the CLI could not get ready', async () => {
    const s = await standIn(emptyClerk, async () => Promise.reject(new VerifyFailure('NOT_READY', 'simctl recordVideo exited 1: no such device', 'rerun with --no-video')));
    await stopping(s.broker, async () => {
      await assert.rejects(aboutToLaunch(s.access), { message: 'the verify CLI was not ready for the app to launch: simctl recordVideo exited 1: no such device (fix: rerun with --no-video)' });
    });
    const other = await standIn(emptyClerk, async () => Promise.reject(new Error('spawn xcrun ENOENT')));
    await stopping(other.broker, async () => {
      await assert.rejects(aboutToLaunch(other.access), { message: 'the verify CLI was not ready for the app to launch: spawn xcrun ENOENT' });
    });
  });

  it('asks nothing of anyone before a launch in a run by hand, which has a secret key and no CLI', async () => {
    const asked: string[] = [];
    const recording = (async (url: string | URL, init?: RequestInit) => (asked.push(`${init?.method} ${String(url)} ${new Headers(init?.headers).get('authorization')}`), new Response('{}'))) as typeof fetch;
    await aboutToLaunch({ kind: 'secret-key', key: new Secret('clerk-secret-key', SECRET_KEY) }, recording);
    assert.deepEqual(asked, []);
    const s = await standIn();
    await stopping(s.broker, async () => {
      await aboutToLaunch(s.access, recording);
      assert.deepEqual(asked, [`POST ${s.broker.url}/about_to_launch Bearer ${readFileSync(s.broker.tokenFile, 'utf8')}`]);
    });
  });

  it('refuses any other kind of call: nothing but the calls that seed users and organizations and mint a ticket reaches Clerk', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const others: readonly (readonly [string, string])[] = [
        ['GET', '/users/count'],
        ['GET', '/users/user_created_1'],
        ['DELETE', '/users/user_created_1'],
        ['PATCH', '/users/user_created_1'],
        ['POST', '/users/user_created_1/ban'],
        ['GET', '/organizations'],
        ['DELETE', '/organizations/org_1'],
        ['PATCH', '/organizations/org_1'],
        ['POST', '/organizations/org_1/invitations'],
        ['POST', '/organizations/org_1/domains/orgdmn_1/verify'],
        ['POST', '/organizations/org%2F1/memberships'],
        ['PATCH', '/organization_roles/role_1'],
        ['DELETE', '/organization_roles/role_1'],
        ['GET', '/sign_in_tokens'],
        ['POST', '/sign_in_tokens/sit_1/revoke'],
        ['GET', '/instance'],
        ['POST', '/users/'],
      ];
      for (const [method, path] of others) {
        const answer = await s.ask(method, path, method === 'GET' || method === 'DELETE' ? undefined : {});
        assert.equal(answer.status, 404, `${method} ${path}`);
        assert.equal(answer.json.errors?.[0]?.code, 'verify_stand_in_unknown_call');
      }
      const outsideTheApi = await fetch(`${s.broker.url.replace(/\/v1$/, '')}/users`, { method: 'POST', headers: { Authorization: `Bearer ${readFileSync(s.broker.tokenFile, 'utf8')}` }, body: '{}' });
      assert.equal(outsideTheApi.status, 404);
      assert.deepEqual(s.forwarded, []);
    });
  });

  it('seeds an organization through it with the instance key: the custom role once, the organization, its members, and a verified domain', async () => {
    const s = await standIn(organizationClerk());
    await stopping(s.broker, async () => {
      const admin = await s.users.seed();
      const reader = await s.users.seed();
      const org = await s.users.seedOrganization({ creator: admin, members: [{ user: reader, role: 'org:e2e_domains_reader' }], suggestDomain: true });
      assert.deepEqual(
        s.forwarded.slice(2).map((request) => [request.method, request.url, request.authorization]),
        [
          ['GET', 'https://api.clerk.com/v1/organization_roles?query=org%3Ae2e_domains_reader', `Bearer ${SECRET_KEY}`],
          ['GET', 'https://api.clerk.com/v1/organization_permissions?query=org%3Asys_&limit=100', `Bearer ${SECRET_KEY}`],
          ['GET', 'https://api.clerk.com/v1/organization_permissions?query=org%3Asys_&limit=100', `Bearer ${SECRET_KEY}`],
          ['POST', 'https://api.clerk.com/v1/organization_roles', `Bearer ${SECRET_KEY}`],
          ['POST', 'https://api.clerk.com/v1/organizations', `Bearer ${SECRET_KEY}`],
          ['POST', 'https://api.clerk.com/v1/organizations/org_1/memberships', `Bearer ${SECRET_KEY}`],
          ['POST', 'https://api.clerk.com/v1/organizations/org_1/domains', `Bearer ${SECRET_KEY}`],
        ],
      );
      const prefix = runEmailPrefix(s.run);
      assert.deepEqual(s.forwarded[5]!.body, { name: 'Domains reader', key: 'org:e2e_domains_reader', permissions: ['perm_domains_read', 'perm_memberships_read'] });
      assert.deepEqual(s.forwarded[6]!.body, { name: org.name, created_by: 'user_1' });
      assert.deepEqual(s.forwarded[7]!.body, { user_id: 'user_2', role: 'org:e2e_domains_reader' });
      assert.deepEqual(s.forwarded[8]!.body, { name: org.domain, enrollment_mode: 'automatic_suggestion', verified: true });
      assert.equal(org.id, 'org_1');
      assert.match(org.name, new RegExp(`^${prefix} [0-9a-f]{6}$`));
      assert.match(org.domain, new RegExp(`^${prefix}[0-9a-z]{4}\\.clerk\\.test$`));

      const again = await s.users.seedOrganization({ creator: reader, members: [{ user: admin, role: 'org:e2e_domains_reader' }] });
      assert.deepEqual([again.id, again.domain], ['org_2', null]);
      assert.deepEqual(
        s.forwarded.slice(9).map((request) => [request.method, request.url.replace('https://api.clerk.com/v1', '')]),
        [
          ['GET', '/organization_roles?query=org%3Ae2e_domains_reader'],
          ['POST', '/organizations'],
          ['POST', '/organizations/org_2/memberships'],
        ],
        'a role that the instance already holds is not created again',
      );
    });
  });

  it('tells the tests only the id and key of each permission and role it lists', async () => {
    const s = await standIn(organizationClerk({ roleExists: true }));
    await stopping(s.broker, async () => {
      const permissions = await s.ask('GET', '/organization_permissions?query=org:sys_&limit=100');
      assert.deepEqual(permissions.json, {
        data: [
          { id: 'perm_domains_read', key: 'org:sys_domains:read' },
          { id: 'perm_memberships_read', key: 'org:sys_memberships:read' },
          { id: 'perm_domains_manage', key: 'org:sys_domains:manage' },
        ],
        total_count: 3,
      });
      const roles = await s.ask('GET', '/organization_roles?query=org:e2e_domains_reader');
      assert.deepEqual(roles.json, { data: [{ id: 'role_1', key: 'org:e2e_domains_reader', permissions: [{ key: 'org:sys_domains:read' }, { key: 'org:sys_memberships:read' }] }], total_count: 1 });
    });
  });

  it('refuses each organization call outside its guard, and sends Clerk none of it', async () => {
    const s = await standIn(organizationClerk());
    await stopping(s.broker, async () => {
      const user = await s.users.seed();
      const org = await s.users.seedOrganization({ creator: user });
      const sent = s.forwarded.length;
      const prefix = runEmailPrefix(s.run);
      const otherRun = 'r20200101-000000-aaaa' as RunId;
      const refusedRequests: readonly (readonly [string, string, string, Record<string, unknown> | undefined, RegExp])[] = [
        ['an organization of a user from elsewhere', 'POST', '/organizations', { name: `${prefix} abcdef`, created_by: 'user_of_someone_else' }, /user user_of_someone_else was not created by this run/],
        ['an organization with a name of no run', 'POST', '/organizations', { name: 'Acme', created_by: user.id }, /Acme is not an organization name of run/],
        ['an organization with a name of another run', 'POST', '/organizations', { name: `${runEmailPrefix(otherRun)} abcdef`, created_by: user.id }, /is not an organization name of run/],
        ['an organization with metadata', 'POST', '/organizations', { name: `${prefix} abcdef`, created_by: user.id, private_metadata: { plan: 'x' } }, /it carries private_metadata/],
        ['a member of an organization from elsewhere', 'POST', '/organizations/org_someone_else/memberships', { user_id: user.id, role: 'org:member' }, /organization org_someone_else was not created by this run/],
        ['a member from elsewhere', 'POST', `/organizations/${org.id}/memberships`, { user_id: 'user_of_someone_else', role: 'org:member' }, /user user_of_someone_else was not created by this run/],
        ['a role the tests do not give', 'POST', `/organizations/${org.id}/memberships`, { user_id: user.id, role: 'org:owner' }, /org:owner is not a role the tests give/],
        ['a member with metadata', 'POST', `/organizations/${org.id}/memberships`, { user_id: user.id, role: 'org:member', public_metadata: {} }, /it carries public_metadata/],
        ['a domain of an organization from elsewhere', 'POST', '/organizations/org_someone_else/domains', { name: newTestDomain(s.run), enrollment_mode: 'automatic_suggestion', verified: true }, /organization org_someone_else was not created by this run/],
        ['a real domain', 'POST', `/organizations/${org.id}/domains`, { name: 'clerk.com', enrollment_mode: 'automatic_suggestion', verified: true }, /clerk\.com is not a domain of run/],
        ['a domain of another run', 'POST', `/organizations/${org.id}/domains`, { name: newTestDomain(otherRun), enrollment_mode: 'automatic_suggestion', verified: true }, /is not a domain of run/],
        ['a domain under a real one', 'POST', `/organizations/${org.id}/domains`, { name: `${prefix}abcd.clerk.test.clerk.com`, enrollment_mode: 'automatic_suggestion', verified: true }, /is not a domain of run/],
        ['a domain with invitations', 'POST', `/organizations/${org.id}/domains`, { name: newTestDomain(s.run), enrollment_mode: 'automatic_invitation', verified: true }, /verified, with automatic suggestions/],
        ['an unverified domain', 'POST', `/organizations/${org.id}/domains`, { name: newTestDomain(s.run), enrollment_mode: 'automatic_suggestion', verified: false }, /verified, with automatic suggestions/],
        ['every permission', 'GET', '/organization_permissions', undefined, /listed with query org:sys_ only/],
        ['a search for other permissions', 'GET', '/organization_permissions?query=org:billing', undefined, /listed with query org:sys_ only/],
        ['a permission list ordered', 'GET', '/organization_permissions?query=org:sys_&order_by=key', undefined, /it carries order_by/],
        ['every role', 'GET', '/organization_roles', undefined, /looked up by one custom role of the tests/],
        ['a system role', 'GET', '/organization_roles?query=org:admin', undefined, /looked up by one custom role of the tests/],
        ['a page of roles', 'GET', '/organization_roles?query=org:e2e_domains_reader&limit=500', undefined, /it carries limit/],
        ['a system role made again', 'POST', '/organization_roles', { name: 'Admin', key: 'org:admin', permissions: [] }, /org:admin is not a custom role of the tests/],
        ['a role of no table', 'POST', '/organization_roles', { name: 'Owner', key: 'org:owner', permissions: [] }, /org:owner is not a custom role of the tests/],
        ['a role with another name', 'POST', '/organization_roles', { name: 'Reader', key: 'org:e2e_domains_reader', permissions: ['perm_domains_read', 'perm_memberships_read'] }, /is named Domains reader/],
        ['a role with metadata', 'POST', '/organization_roles', { name: 'Domains reader', key: 'org:e2e_domains_reader', permissions: [], description: 'x' }, /it carries description/],
      ];
      for (const [what, method, path, body, why] of refusedRequests) {
        const answer = await s.ask(method, path, body);
        assert.equal(answer.status, 403, what);
        assert.match(whyRefused(answer), why, what);
      }
      assert.equal(s.forwarded.length, sent, 'no refused request reached Clerk');

      const moreThanTheTable = await s.ask('POST', '/organization_roles', { name: 'Domains reader', key: 'org:e2e_domains_reader', permissions: ['perm_domains_read', 'perm_memberships_read', 'perm_domains_manage'] });
      assert.equal(moreThanTheTable.status, 403);
      assert.match(whyRefused(moreThanTheTable), /has exactly the permissions org:sys_domains:read, org:sys_memberships:read, and the request gives org:sys_domains:manage, org:sys_domains:read, org:sys_memberships:read/);
      assert.deepEqual(s.forwarded.slice(sent).map((request) => [request.method, request.url]), [['GET', 'https://api.clerk.com/v1/organization_permissions?query=org%3Asys_&limit=100']], 'only the lookup of the permission ids reached Clerk');
    });
  });

  it('creates a user only with one test address of this run, test phones, and the fields the tests send', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const mine = newTestEmail(s.run);
      const refusedBodies: readonly (readonly [string, Record<string, unknown>, RegExp])[] = [
        ['a real address', { email_address: ['someone@example.com'] }, /is not a \+clerk_test email/],
        ['an address of another run', { email_address: [newTestEmail('r20200101-000000-aaaa' as RunId)] }, /is not an address of run/],
        ['two addresses', { email_address: [mine, newTestEmail(s.run)] }, /exactly one email address/],
        ['no address', { phone_number: [TEST_PHONES[0]] }, /exactly one email address/],
        ['a real phone', { email_address: [mine], phone_number: ['+14155552671'] }, /is not a 555-0100\.\.0199 test phone/],
        ['a phone that is not a list', { email_address: [mine], phone_number: TEST_PHONES[0] }, /not a list of phone numbers/],
        ['a phone list that is null', { email_address: [mine], phone_number: null }, /not a list of phone numbers/],
        ['metadata', { email_address: [mine], public_metadata: { role: 'admin' } }, /it carries public_metadata/],
        ['an external id', { email_address: [mine], external_id: 'x', skip_password_requirement: true }, /it carries external_id/],
      ];
      for (const [what, body, why] of refusedBodies) {
        const answer = await s.ask('POST', '/users', body);
        assert.equal(answer.status, 403, what);
        assert.match(whyRefused(answer), why, what);
      }
      assert.equal((await s.ask('POST', '/users', [mine])).status, 403, 'a body that is not an object');
      assert.deepEqual(s.forwarded, [], 'no refused request reached Clerk');
      assert.equal((await s.ask('POST', '/users', { email_address: [mine], phone_number: [TEST_PHONES[3]], password: 'a-password-Aa1!', bypass_client_trust: true })).status, 200);
      assert.equal(s.forwarded.length, 1);
    });
  });

  it('mints a ticket only for a user this run created, and only a short one', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const foreign = await s.ask('POST', '/sign_in_tokens', { user_id: 'user_of_someone_else', expires_in_seconds: 120 });
      assert.equal(foreign.status, 403);
      assert.match(whyRefused(foreign), /user user_of_someone_else was not created by this run/);
      assert.deepEqual(s.forwarded, []);

      const user = await s.users.seed();
      const refusedBodies: readonly (readonly [string, Record<string, unknown>, RegExp])[] = [
        ['a long life', { user_id: user.id, expires_in_seconds: 121 }, /120 seconds at most/],
        ['a month, which is Clerk\'s default when no life is named', { user_id: user.id }, /120 seconds at most/],
        ['a life that is not a number', { user_id: user.id, expires_in_seconds: '60' }, /120 seconds at most/],
        ['no user', { expires_in_seconds: 60 }, /was not created by this run/],
        ['another field', { user_id: user.id, expires_in_seconds: 60, actor: { sub: 'user_x' } }, /it carries actor/],
      ];
      for (const [what, body, why] of refusedBodies) {
        const answer = await s.ask('POST', '/sign_in_tokens', body);
        assert.equal(answer.status, 403, what);
        assert.match(whyRefused(answer), why, what);
      }
      assert.equal(s.forwarded.length, 1, 'only the create reached Clerk');
      assert.equal((await s.ask('POST', '/sign_in_tokens', { user_id: user.id, expires_in_seconds: 60 })).status, 200);
    });
  });

  it('does not sign in a user that an earlier run created on the same instance', async () => {
    const earlier = await standIn();
    const user = await stopping(earlier.broker, () => earlier.users.seed());
    const later = await standIn();
    await stopping(later.broker, async () => {
      await assert.rejects(later.users.signInTicket(user), /answered 403: .*was not created by this run; sign in only users from host\.seedUser/);
      assert.deepEqual(later.forwarded, []);
    });
  });

  it('looks users up by one test phone only, and tells the test nothing but their ids', async () => {
    const s = await standIn((request) => (request.method === 'GET' ? { status: 200, body: [{ id: 'user_7', email_addresses: [{ email_address: 'private@example.com' }], phone_numbers: [{ phone_number: '+12015550107' }] }] } : emptyClerk(request)));
    await stopping(s.broker, async () => {
      const phone = encodeURIComponent(TEST_PHONES[7]!);
      const refusedQueries: readonly (readonly [string, string, RegExp])[] = [
        ['every user', '/users', /looked up by one test phone/],
        ['a page of users', '/users?limit=500', /looked up by one test phone/],
        ['a real phone', '/users?phone_number=%2B14155552671', /is not a 555-0100\.\.0199 test phone/],
        ['a phone and an address', `/users?phone_number=${phone}&email_address=someone@example.com`, /it carries email_address/],
        ['a phone and a search', `/users?phone_number=${phone}&query=a`, /it carries query/],
        ['two phones', `/users?phone_number=${phone}&phone_number=${phone}`, /looked up by one test phone/],
      ];
      for (const [what, path, why] of refusedQueries) {
        const answer = await s.ask('GET', path);
        assert.equal(answer.status, 403, what);
        assert.match(whyRefused(answer), why, what);
      }
      assert.equal(s.forwarded.length, 0, 'no refused lookup reached Clerk');
      const answer = await s.ask('GET', `/users?phone_number=${phone}`);
      assert.deepEqual([answer.status, answer.json], [200, [{ id: 'user_7' }]]);
      assert.equal(s.forwarded[0]!.url, `https://api.clerk.com/v1/users?phone_number=${phone}`);
    });
  });

  it('sends Clerk the request it checked, not the text it was sent: one value for each field, each phone in one spelling, and no query on a request that has a body', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const mine = newTestEmail(s.run);
      const twice = `{"email_address":["someone@example.com"],"email_address":[${JSON.stringify(mine)}],"phone_number":["+1 (201) 555-0100; DROP"],"skip_password_requirement":true}`;
      assert.equal((await s.ask('POST', '/users?limit=500&email_address=someone@example.com', twice)).status, 200);
      assert.deepEqual([s.forwarded[0]!.url, s.forwarded[0]!.text], ['https://api.clerk.com/v1/users', JSON.stringify({ email_address: [mine], phone_number: ['+12015550100'], skip_password_requirement: true })]);
      assert.equal((await s.ask('POST', '/sign_in_tokens?user_id=user_of_someone_else', { user_id: 'user_created_1', expires_in_seconds: 60 })).status, 200);
      assert.deepEqual([s.forwarded[1]!.url, s.forwarded[1]!.text], ['https://api.clerk.com/v1/sign_in_tokens', '{"user_id":"user_created_1","expires_in_seconds":60}']);
      assert.equal((await s.ask('GET', `/users?phone_number=${encodeURIComponent('(201) 555-0107; DROP')}`)).status, 200);
      assert.deepEqual([s.forwarded[2]!.url, s.forwarded[2]!.text], ['https://api.clerk.com/v1/users?phone_number=%2B12015550107', null]);
    });
  });

  it('listens on 127.0.0.1 only, so no other address of this machine reaches it', async (t) => {
    const others = Object.values(networkInterfaces()).flatMap((addresses) => addresses ?? []).filter((address) => address.address !== '127.0.0.1' && !address.address.startsWith('fe80:')).map((address) => address.address);
    if (others.length === 0) return t.skip('this machine has no other address to try');
    const s = await standIn();
    await stopping(s.broker, async () => {
      const port = Number(new URL(s.broker.url).port);
      const accepts = (host: string): Promise<boolean> =>
        new Promise((resolve) => {
          const socket = net.connect({ host, port, timeout: 2_000 });
          const done = (connected: boolean): void => void (socket.destroy(), resolve(connected));
          socket.on('connect', () => done(true));
          socket.on('timeout', () => done(false));
          socket.on('error', () => done(false));
        });
      assert.equal(await accepts('127.0.0.1'), true);
      assert.deepEqual(await Promise.all(others.map(accepts)), others.map(() => false), others.join(', '));
    });
  });

  it('keeps its token in a file that only the user can read', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      assert.equal(statSync(s.broker.tokenFile).mode & 0o777, 0o600);
    });
  });

  it('refuses a body larger than any request the tests make, and sends none of it to Clerk', async () => {
    const s = await standIn();
    await stopping(s.broker, async () => {
      const user = (password: string) => ({ email_address: [newTestEmail(s.run)], password, bypass_client_trust: true });
      const large = await s.ask('POST', '/users', user('p'.repeat(64 * 1024)));
      assert.equal(large.status, 403);
      assert.match(whyRefused(large), /its body is larger than any request the tests make/);
      assert.deepEqual(s.forwarded, []);
      assert.equal((await s.ask('POST', '/users', user('p'.repeat(1024)))).status, 200);
    });
  });

  it("hands Clerk's own answer back, so a taken phone moves the test to the next one", async () => {
    const held = new Set<string>(TEST_PHONES.slice(0, 99));
    const s = await standIn((request) => {
      const [phone] = (request.body?.phone_number as string[] | undefined) ?? [];
      if (request.method === 'POST' && phone !== undefined && held.has(phone)) return { status: 422, body: { errors: [{ code: 'form_identifier_exists', message: 'That phone number is taken.' }] } };
      return emptyClerk(request);
    });
    await stopping(s.broker, async () => {
      const taken = await s.ask('POST', '/users', { email_address: [newTestEmail(s.run)], phone_number: [TEST_PHONES[0]] });
      assert.deepEqual([taken.status, taken.json.errors?.[0]?.code], [422, 'form_identifier_exists']);
      assert.equal((await s.users.seed({ phone: true })).phone, TEST_PHONES[99]);
    });
  });

  it('puts the fix in the answer when Clerk refuses the key or one user too many', async () => {
    const full = await standIn(() => ({ status: 403, body: { errors: [{ code: 'user_quota_exceeded', message: 'quota' }] } }));
    await stopping(full.broker, async () => {
      await assert.rejects(full.users.seed(), new RegExp(`answered 403: the instance holds the 100 users .* \\(fix: the next \`\\{cli\\} run\` replaces the instance once it holds ${REPLACE_AT_USERS} users; rerun\\)`));
    });
    const replaced = await standIn(() => ({ status: 401, body: { errors: [{ code: 'authentication_invalid' }] } }));
    await stopping(replaced.broker, async () => {
      await assert.rejects(replaced.users.seed(), /answered 401: api\.clerk\.com answered 401 to the instance's own secret key.*\(fix: set Path prefixes/);
    });
    const other = await standIn(() => ({ status: 403, body: { errors: [{ code: 'something_else', long_message: 'Clerk said no.' }] } }));
    await stopping(other.broker, async () => {
      await assert.rejects(other.users.seed(), /^Error: Clerk POST \/users answered 403: Clerk said no\.$/);
    });
  });

  it('answers with a reason when Clerk cannot be reached', async () => {
    const unreachable: Clerk = () => {
      throw new Error('fetch failed');
    };
    const s = await standIn(unreachable);
    await stopping(s.broker, async () => {
      const answer = await s.ask('POST', '/users', { email_address: [newTestEmail(s.run)] });
      assert.equal(answer.status, 502);
      assert.match(whyRefused(answer), /could not forward this request: fetch failed/);
    });
  });
});
