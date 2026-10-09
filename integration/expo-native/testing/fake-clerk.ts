import { configLeaves, standardFile } from '../src/core/instances/settings.ts';
import type { Json } from '../src/core/types.ts';

export const WORKSPACE = 'org_3KHungJxbvIscuSvy8oos5MHAli';
export const PLATFORM_KEY = 'ak_unitTestPlatformKey0123456789';
export const SECRET_KEY_SCOPE = 'application_secret_keys:read';
export const PLATFORM_SCOPES: readonly string[] = ['applications:read', 'applications:manage', 'applications:delete', SECRET_KEY_SCOPE];

interface FakeApplication {
  readonly id: string;
  readonly name: string;
  readonly instanceId: string;
  readonly pk: string;
  readonly sk: string;
  config: Record<string, Json>;
  environment: Record<string, Json>;
  users: number;
  created: { readonly id: string; readonly email_addresses: readonly { readonly email_address: string }[] }[];
  deleted: boolean;
}

type JsonObject = { readonly [key: string]: Json };
const isObject = (value: Json | undefined): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);

function merged(base: JsonObject, over: JsonObject): Record<string, Json> {
  const out: Record<string, Json> = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const under = out[key];
    out[key] = isObject(value) && isObject(under) ? merged(under, value) : value;
  }
  return out;
}

const SHOWN: readonly { readonly config: string; readonly leaf: string; readonly as?: (value: Json) => Json }[] = [
  { config: 'organization_settings.force_organization_selection', leaf: 'organization_settings.force_organization_selection' },
  { config: 'auth_multi_factor.required_for_sign_up', leaf: 'user_settings.sign_up.mfa.required' },
  { config: 'session_settings.multi_session_enabled', leaf: 'auth_config.single_session_mode', as: (value) => value !== true },
  { config: 'auth_password.min_length', leaf: 'user_settings.password_settings.min_length' },
];

export interface FakeRefusal {
  readonly path: string;
  readonly value?: Json;
  readonly status: number;
  readonly code: string;
  readonly param?: string | readonly string[];
  readonly message: string;
}

export interface FakeClerkOptions {
  readonly workspace?: string;
  readonly attachesKey?: boolean;
  readonly replacesAuthorizationOnCom?: boolean;
  readonly now?: () => number;
}

function unflatten(leaves: Readonly<Record<string, Json>>): Json {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(leaves)) {
    const parts = path.split('.').flatMap((part) => {
      const match = /^([^[]+)((?:\[\d+\])*)$/.exec(part);
      if (match === null) return [part];
      return [match[1]!, ...[...match[2]!.matchAll(/\[(\d+)\]/g)].map((index) => Number(index[1]))];
    });
    let node = root as Record<string | number, unknown>;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) node[part] = value;
      else node = (node[part] ??= typeof parts[index + 1] === 'number' ? [] : {}) as Record<string | number, unknown>;
    });
  }
  return root as Json;
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

const nested = (path: string, value: Json): JsonObject => path.split('.').reduceRight<Json>((inner, key) => ({ [key]: inner }), value) as JsonObject;

export function fakeClerk(options: FakeClerkOptions = {}) {
  const now = options.now ?? Date.now;
  const applications: FakeApplication[] = [];
  const requests: { readonly method: string; readonly url: string; readonly authorization: string | null; readonly body: unknown }[] = [];
  let counter = 0;
  let rateLimited: { left: number; retryAfter: string | null } = { left: 0, retryAfter: null };
  const state = {
    listShape: 'array' as 'array' | 'envelope' | 'unreadable',
    pageSize: 2,
    failConfigure: 0,
    loseCreateAnswer: false,
    refuseDelete: false,
    noDate: false,
    refuseInstanceKeys: false,
    scopes: PLATFORM_SCOPES as readonly string[] | undefined,
    ignoreConfigKey: null as string | null,
    refusals: [] as FakeRefusal[],
    alsoMoves: {} as Record<string, Json>,
    dropFromAfter: null as string | null,
    storesInstead: {} as Record<string, Json>,
  };

  const json = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
    new Response(JSON.stringify(body), { status, headers: { ...(state.noDate ? {} : { date: new Date(now()).toUTCString() }), ...headers } });
  const error = (status: number, code: string): Response => json(status, { errors: [{ code, message: code }] });
  const live = () => applications.filter((application) => !application.deleted);

  const freshEnvironment = (): Record<string, Json> => ({ 'auth_config.reverification': true, ...standardFile().environment, 'auth_config.single_session_mode': true, 'user_settings.password_settings.min_length': 15 });

  const fresh = (): Pick<FakeApplication, 'config' | 'environment' | 'users' | 'created' | 'deleted'> => ({ config: {}, environment: freshEnvironment(), users: 0, created: [], deleted: false });

  function platform(method: string, path: string, authorization: string | null, body: unknown): Response {
    if (rateLimited.left > 0) {
      rateLimited.left -= 1;
      return json(429, { errors: [{ code: 'too_many_requests' }] }, rateLimited.retryAfter === null ? {} : { 'retry-after': rateLimited.retryAfter });
    }
    if (authorization === null) return error(401, 'authorization_header_format_invalid');
    if (authorization !== `Bearer ${PLATFORM_KEY}`) return error(401, 'could_not_authenticate_request');
    if (method === 'GET' && path === '/me') return json(200, { object: 'platform_principal', subject: options.workspace ?? WORKSPACE, actor: PLATFORM_KEY, ...(state.scopes === undefined ? {} : { scopes: state.scopes }) });
    const listed = (application: FakeApplication, withSecretKey: boolean): { readonly application_id: string; readonly name: string; readonly instances: readonly Readonly<Record<string, string>>[] } => ({
      application_id: application.id,
      name: application.name,
      instances: [{ environment_type: 'development', instance_id: application.instanceId, ...(withSecretKey ? { secret_key: application.sk } : {}), publishable_key: application.pk }],
    });
    const read = /^\/applications\/([^/?]+)(\?include_secret_keys=true)?$/.exec(path);
    if (method === 'GET' && read !== null) {
      if (read[2] !== undefined && state.scopes?.includes(SECRET_KEY_SCOPE) !== true) return json(403, { errors: [{ code: 'authorization_missing_scopes', message: 'Missing scopes', meta: { scopes: [SECRET_KEY_SCOPE] } }] });
      const application = live().find((candidate) => candidate.id === read[1]);
      return application === undefined ? error(404, 'resource_not_found') : json(200, listed(application, read[2] !== undefined));
    }
    if (method === 'GET' && path.startsWith('/applications')) {
      const all = live().map((application) => listed(application, false));
      if (state.listShape === 'array') return json(200, all);
      if (state.listShape === 'unreadable') return json(200, { applications: all });
      const offset = Number(new URL(`https://x${path}`).searchParams.get('offset') ?? 0);
      return json(200, { data: all.slice(offset, offset + state.pageSize), total_count: all.length });
    }
    if (method === 'POST' && path === '/applications') {
      counter += 1;
      const slug = `fake-${counter}`;
      const application: FakeApplication = {
        id: `app_fake${counter}`,
        name: (body as { name: string }).name,
        instanceId: `ins_fake${counter}`,
        pk: `pk_test_${Buffer.from(`${slug}.clerk.accounts.dev$`).toString('base64url')}`,
        sk: `sk_test_fakeSecret${counter}xxxxxxxxxxxxxxxx`,
        ...fresh(),
      };
      applications.push(application);
      if (state.loseCreateAnswer) return error(500, 'internal');
      return json(200, { application_id: application.id, name: application.name, instances: [{ environment_type: 'development', instance_id: application.instanceId, publishable_key: application.pk, secret_key: application.sk }] });
    }
    const config = /^\/applications\/([^/]+)\/instances\/([^/?]+)\/config(\?dry_run=true)?$/.exec(path);
    if (method === 'PATCH' && config !== null) {
      if (state.failConfigure > 0) {
        state.failConfigure -= 1;
        return error(500, 'internal');
      }
      const application = live().find((candidate) => candidate.id === config[1]);
      if (application === undefined) return error(404, 'resource_not_found');
      const sent = body as JsonObject;
      const leaves = configLeaves(sent);
      const refusal = state.refusals.find((candidate) => candidate.path in leaves && (candidate.value === undefined || same(leaves[candidate.path], candidate.value)));
      if (refusal !== undefined) {
        const named = refusal.param === undefined ? [undefined] : [refusal.param].flat();
        return json(refusal.status, { errors: named.map((param) => ({ code: refusal.code, message: refusal.message, long_message: refusal.message, ...(param === undefined ? {} : { meta: { param_name: param } }) })) });
      }
      let after = merged(application.config, sent);
      for (const [path, value] of Object.entries(state.storesInstead)) if (path in leaves) after = merged(after, nested(path, value));
      const named = (from: JsonObject): JsonObject => Object.fromEntries(Object.keys(sent).flatMap((key) => (key in from ? [[key, from[key]!]] : [])));
      const reordered = (value: Json): Json => (Array.isArray(value) ? [...value].sort().reverse() : typeof value === 'object' && value !== null ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, reordered(child)])) : value);
      const answer = { config_version: '2026-10-05', dry_run: config[3] !== undefined, before: named(application.config), after: reordered(named(after)) };
      if (state.dropFromAfter !== null) {
        const [top, ...rest] = state.dropFromAfter.split('.');
        const pruned = structuredClone(answer.after) as Record<string, Record<string, Json>>;
        let node: Record<string, Json> | undefined = pruned[top!];
        for (const part of rest.slice(0, -1)) node = node?.[part] as Record<string, Json> | undefined;
        if (node !== undefined) delete node[rest.at(-1)!];
        answer.after = pruned;
      }
      if (config[3] !== undefined) return json(200, answer);
      application.config = after;
      const set = configLeaves(after);
      for (const shown of SHOWN) {
        if (!(shown.config in set) || shown.leaf === state.ignoreConfigKey) continue;
        application.environment[shown.leaf] = shown.as === undefined ? set[shown.config]! : shown.as(set[shown.config]!);
      }
      Object.assign(application.environment, state.alsoMoves);
      return json(200, answer);
    }
    const one = /^\/applications\/([^/?]+)$/.exec(path);
    if (method === 'DELETE' && one !== null) {
      if (state.refuseDelete) return error(403, 'authorization_missing_scopes');
      const application = applications.find((candidate) => candidate.id === one[1]);
      if (application === undefined) return error(404, 'resource_not_found');
      application.deleted = true;
      return json(200, { id: application.id, object: 'application', deleted: true });
    }
    return error(404, 'resource_not_found');
  }

  const fetchImpl = (async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    const sent = new Headers(init?.headers).get('authorization');
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    requests.push({ method, url: `${url.host}${url.pathname}${url.search}`, authorization: sent, body });
    const onCom = url.host === 'api.clerk.com';
    if (onCom && url.pathname.startsWith('/v1/platform/')) {
      const authorization = options.attachesKey === true ? `Bearer ${PLATFORM_KEY}` : sent;
      return platform(method, `${url.pathname.slice('/v1/platform'.length)}${url.search}`, authorization, body);
    }
    if (onCom) {
      const authorization = options.replacesAuthorizationOnCom === true ? `Bearer ${PLATFORM_KEY}` : sent;
      const application = live().find((candidate) => authorization === `Bearer ${candidate.sk}`);
      if (application === undefined || state.refuseInstanceKeys) return error(401, 'clerk_key_invalid');
      if (method === 'GET' && url.pathname === '/v1/users/count') return json(200, { object: 'total_count', total_count: application.users });
      if (method === 'POST' && url.pathname === '/v1/users') {
        if (application.users >= 100) return error(403, 'user_quota_exceeded');
        application.users += 1;
        const user = { id: `user_${application.id}_${application.users}`, email_addresses: ((body as { email_address?: string[] } | undefined)?.email_address ?? []).map((email_address) => ({ email_address })) };
        application.created.push(user);
        return json(200, user);
      }
      if (method === 'POST' && url.pathname === '/v1/sign_in_tokens') return json(200, { token: `ticket_${application.id}_${(counter += 1)}` });
      const query = url.searchParams.get('email_address_query');
      if (method === 'GET' && url.pathname === '/v1/users' && query !== null) return json(200, application.created.filter((user) => user.email_addresses.some((address) => address.email_address.includes(query))));
      return json(200, []);
    }
    const application = applications.find((candidate) => `${Buffer.from(candidate.pk.slice('pk_test_'.length), 'base64url').toString().replace(/\$$/, '')}` === url.host);
    if (application === undefined || application.deleted) return error(404, 'resource_not_found');
    return json(200, unflatten(application.environment));
  }) as typeof fetch;

  return {
    fetch: fetchImpl,
    requests,
    state,
    applications,
    live,
    platformRequests: () => requests.filter((request) => request.url.startsWith('api.clerk.com/v1/platform/')),
    rateLimit: (times: number, retryAfter: string | null = null) => (rateLimited = { left: times, retryAfter }),
    plant(name: string, secretKey?: string): FakeApplication {
      counter += 1;
      const application: FakeApplication = { id: `app_planted${counter}`, name, instanceId: `ins_planted${counter}`, pk: `pk_test_${Buffer.from(`planted-${counter}.clerk.accounts.dev$`).toString('base64url')}`, sk: secretKey ?? `sk_test_planted${counter}xxxxxxxxxxxxxxxxxxx`, ...fresh() };
      applications.push(application);
      return application;
    },
  };
}
