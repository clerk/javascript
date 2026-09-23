import type { FieldId } from '@clerk/shared/types';
import { useCallback, useSyncExternalStore } from 'react';

import type { LocalizationKey } from '../../../customizables';

/*
 * Prototype-only state for the Access page in <OrganizationProfile />.
 *
 * The model follows the Sept 2026 design: a policy targets one or more
 * domains (or is the organization's catch-all), and carries enrollment,
 * sign-in, MFA, re-verification, and per-domain proof. Connections (SSO,
 * directory) hang off a policy. Nothing persists beyond the browser tab: a
 * module singleton mirrored to sessionStorage, so navigating between the
 * table and the Configure policy page keeps state, and a refresh does too.
 */

export type ProtoEnrollment = 'invitation_only' | 'request_access' | 'join_automatically' | 'directory_sync';
export type ProtoSignIn = 'default' | 'sso';
export type ProtoProvider = 'saml_okta' | 'saml_microsoft' | 'saml_google' | 'saml_custom' | 'oidc';
export type ProtoNonDirectoryFallback = 'request_access' | 'block';
export type ProtoOwnership = 'unverified' | 'pending' | 'verified' | 'waived';
export type ProtoConnectionStatus = 'pending' | 'active' | 'broken';

/** Proof for one domain on a policy. */
export type ProtoProof = {
  /** Someone with an email at the domain confirmed a code. */
  affiliation: boolean;
  /** DNS TXT record, or the application owner vouching ("waived"). */
  ownership: ProtoOwnership;
  /** The address the affiliation code went to, for the "sent to" line. */
  affiliationEmail?: string;
};

export type ProtoPolicy = {
  id: string;
  /** Empty for the catch-all. */
  domains: string[];
  isCatchAll?: boolean;
  enrollment: ProtoEnrollment;
  /** Only read when enrollment is directory_sync. */
  nonDirectoryFallback: ProtoNonDirectoryFallback;
  signIn: ProtoSignIn;
  mfaRequired: boolean;
  /** null = the application default (24 hours). */
  reverificationHours: number | null;
  /** The SSO connection when signIn is 'sso'. */
  connectionId?: string;
  /** Directory credentials once directory sync is configured. */
  directory?: { configured: boolean; token: string; provider: ProtoProvider };
  proofs: Record<string, ProtoProof>;
  createdAt: string;
};

export type ProtoTestLog = {
  id: string;
  at: string;
  detail: string;
  status: 'pending' | 'success' | 'failed';
};

export type ProtoConnection = {
  id: string;
  provider: ProtoProvider;
  name: string;
  status: ProtoConnectionStatus;
  logs: ProtoTestLog[];
};

export type ScenarioKey = 'work' | 'unverified' | 'personal' | 'configured' | 'view_only' | 'sso_unavailable';

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  work: 'New org, work email',
  unverified: 'Domain added, nothing verified',
  personal: 'New org, personal email',
  configured: 'Configured org',
  view_only: 'Configured org, view only',
  sso_unavailable: 'New org, SSO not allowed',
};

/** What the application owner allows this organization's members to do. */
export type ProtoAccess = {
  /** org:sys_domains:manage. Off = view only. */
  canManage: boolean;
  /** The application owner allowed SSO and directory sync for this org. */
  ssoAllowed: boolean;
  /** Shown on the SSO option when ssoAllowed is off. */
  ssoUnavailableMessage: string;
};

export type ProtoState = {
  scenario: ScenarioKey;
  policies: ProtoPolicy[];
  connections: ProtoConnection[];
  access: ProtoAccess;
};

/* ----------------------------------------------------------------- labels */

export const ENROLLMENT_LABELS: Record<
  ProtoEnrollment,
  { label: string; short: string; description: (domain: string) => string }
> = {
  join_automatically: {
    label: 'Join automatically',
    short: 'Join automatically',
    description: domain => `Anyone with a verified @${domain} email joins when they sign up.`,
  },
  request_access: {
    label: 'Request access',
    short: 'Request access',
    description: domain => `People with an @${domain} email can ask to join. An admin approves them.`,
  },
  invitation_only: {
    label: 'Invitation only',
    short: 'Invitation',
    description: () => 'Nobody joins on their own. Admins invite each person.',
  },
  directory_sync: {
    label: 'Sync from directory',
    short: 'Directory sync',
    description: () => 'Members are created and removed by your directory.',
  },
};

export const NON_DIRECTORY_FALLBACK_LABELS: Record<ProtoNonDirectoryFallback, { label: string; description: string }> =
  {
    request_access: {
      label: 'Request access',
      description: 'Users can request access from an admin',
    },
    block: {
      label: 'Block access',
      description: 'Only directory members can join',
    },
  };

export const PROVIDER_LABELS: Record<ProtoProvider, { label: string; iconId: string; kind: 'saml' | 'oidc' }> = {
  saml_okta: { label: 'Okta Workforce', iconId: 'okta', kind: 'saml' },
  saml_microsoft: { label: 'Microsoft Entra', iconId: 'microsoft', kind: 'saml' },
  saml_google: { label: 'Google Workspace', iconId: 'google', kind: 'saml' },
  saml_custom: { label: 'Custom SAML Provider', iconId: 'saml', kind: 'saml' },
  oidc: { label: 'OIDC Provider', iconId: 'oidc', kind: 'oidc' },
};

/** Provider marks that ship as a single-colour glyph and take the text colour. */
export const MONOCHROMATIC_PROVIDER_ICONS: ReadonlySet<string> = new Set(['okta', 'saml', 'oidc']);

export const APP_REVERIFICATION_HOURS = 24;
export const REVERIFICATION_OPTIONS = [1, 4, 8, 12, 24, 168] as const;
export const formatReverification = (hours: number) =>
  hours === 1 ? 'Every hour' : hours === 168 ? 'Every 7 days' : `Every ${hours} hours`;

/** The table's Target column. */
export const policyTarget = (policy: ProtoPolicy, policies: ProtoPolicy[]) => {
  if (policy.isCatchAll) {
    return policies.some(other => !other.isCatchAll) ? 'Everyone else' : 'Everyone';
  }
  return policy.domains.join(', ');
};

/*
 * Proof rule (Stephen, Sept 22): SSO or directory sync need ownership of
 * the domain, and ownership supersedes affiliation. Anything else needs
 * affiliation only. A domain the application owner vouched for needs
 * nothing.
 */
export const needsOwnership = (policy: Pick<ProtoPolicy, 'signIn' | 'enrollment'>) =>
  policy.signIn === 'sso' || policy.enrollment === 'directory_sync';

export const isProven = (policy: ProtoPolicy, domain: string) => {
  const proof = policy.proofs[domain];
  if (!proof) {
    return false;
  }
  if (proof.ownership === 'verified' || proof.ownership === 'waived') {
    return true;
  }
  return !needsOwnership(policy) && proof.affiliation;
};

export const connectionFor = (policy: ProtoPolicy, connections: ProtoConnection[]) =>
  policy.connectionId ? (connections.find(connection => connection.id === policy.connectionId) ?? null) : null;

export const policiesForConnection = (connectionId: string, policies: ProtoPolicy[]) =>
  policies.filter(policy => policy.connectionId === connectionId);

/* --------------------------------------------------------------- builders */

let counter = 0;
const nextId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(counter += 1)}`;

export const txtRecordFor = (domain: string) => ({
  name: `_clerk.${domain}`,
  value: `domain-verify=${domain.replace(/[^a-z0-9]/gi, '').slice(0, 8)}nasu3yaiosjef`,
});

/** The row a domain starts as: the application's defaults, nothing proven. */
export const newPolicy = (domain: string, overrides: Partial<ProtoPolicy> = {}): ProtoPolicy => ({
  id: nextId('pol'),
  domains: [domain],
  enrollment: 'invitation_only',
  nonDirectoryFallback: 'request_access',
  signIn: 'default',
  mfaRequired: false,
  reverificationHours: null,
  proofs: { [domain]: { affiliation: false, ownership: 'unverified' } },
  createdAt: new Date().toISOString(),
  ...overrides,
});

const catchAll = (overrides: Partial<ProtoPolicy> = {}): ProtoPolicy => ({
  id: 'pol_catch_all',
  domains: [],
  isCatchAll: true,
  enrollment: 'invitation_only',
  nonDirectoryFallback: 'request_access',
  signIn: 'default',
  mfaRequired: false,
  reverificationHours: null,
  proofs: {},
  createdAt: '2026-09-01T09:00:00.000Z',
  ...overrides,
});

const DEFAULT_ACCESS: ProtoAccess = { canManage: true, ssoAllowed: true, ssoUnavailableMessage: '' };

const scenario = (key: ScenarioKey): ProtoState => {
  switch (key) {
    // The two states the application owner's settings produce: a member
    // without the manage permission, and an org the owner has not allowed
    // SSO for. Both reuse another scenario's rows with the flags flipped.
    // A second domain added by hand: no affiliation, no ownership, so every
    // proof step is exercised from the start.
    case 'unverified': {
      const base = scenario('work');
      return {
        ...base,
        scenario: key,
        policies: [
          ...base.policies.filter(policy => !policy.isCatchAll),
          newPolicy('acme-labs.com', { id: 'pol_acme_labs_com', createdAt: '2026-09-22T09:30:00.000Z' }),
          ...base.policies.filter(policy => policy.isCatchAll),
        ],
      };
    }
    case 'view_only':
      return { ...scenario('configured'), scenario: key, access: { ...DEFAULT_ACCESS, canManage: false } };
    case 'sso_unavailable':
      return {
        ...scenario('work'),
        scenario: key,
        access: {
          ...DEFAULT_ACCESS,
          ssoAllowed: false,
          ssoUnavailableMessage: 'Single sign-on is available on the Business plan. Contact your account owner.',
        },
      };
    case 'personal':
      return { scenario: key, policies: [catchAll()], connections: [], access: DEFAULT_ACCESS };
    case 'work':
      return {
        scenario: key,
        policies: [
          newPolicy('acmedev.org', {
            id: 'pol_acmedev_org',
            // The creator's own email domain: affiliation came with sign-up.
            proofs: {
              'acmedev.org': { affiliation: true, ownership: 'unverified', affiliationEmail: 'you@acmedev.org' },
            },
            createdAt: '2026-09-21T15:04:00.000Z',
          }),
          catchAll(),
        ],
        connections: [],
        access: DEFAULT_ACCESS,
      };
    case 'configured':
      return {
        scenario: key,
        policies: [
          newPolicy('acme.com', {
            id: 'pol_acme_com',
            enrollment: 'directory_sync',
            nonDirectoryFallback: 'block',
            signIn: 'sso',
            connectionId: 'con_okta_acme_com',
            directory: { configured: true, token: 'FSLKJG2203498NMF02', provider: 'saml_okta' },
            proofs: { 'acme.com': { affiliation: true, ownership: 'verified' } },
            createdAt: '2026-08-12T10:00:00.000Z',
          }),
          newPolicy('acme.dev', {
            id: 'pol_acme_dev',
            enrollment: 'directory_sync',
            nonDirectoryFallback: 'request_access',
            signIn: 'sso',
            connectionId: 'con_okta_acme_dev',
            directory: { configured: true, token: 'QWERT9981273LKJH01', provider: 'saml_okta' },
            proofs: { 'acme.dev': { affiliation: true, ownership: 'verified' } },
            createdAt: '2026-08-20T10:00:00.000Z',
          }),
          newPolicy('acmedev.org', {
            id: 'pol_acmedev_org',
            enrollment: 'join_automatically',
            proofs: {
              'acmedev.org': { affiliation: true, ownership: 'unverified', affiliationEmail: 'you@acmedev.org' },
            },
            createdAt: '2026-09-02T10:00:00.000Z',
          }),
          catchAll(),
        ],
        connections: [
          {
            id: 'con_okta_acme_com',
            provider: 'saml_okta',
            name: 'Okta',
            status: 'active',
            logs: [
              {
                id: 'log_1',
                at: '2026-08-12T10:15:08.000Z',
                detail: 'Signed in as it-admin@acme.com',
                status: 'success',
              },
            ],
          },
          {
            id: 'con_okta_acme_dev',
            provider: 'saml_okta',
            name: 'Okta My Custom Name',
            // Certificate rotated on the IdP side: sign-in from acme.dev fails.
            status: 'broken',
            logs: [{ id: 'log_2', at: '2026-09-20T08:02:41.000Z', detail: 'Invalid signature', status: 'failed' }],
          },
        ],
        access: DEFAULT_ACCESS,
      };
  }
};

/* ------------------------------------------------------------------ store */

const STORAGE_KEY = 'clerk-access-prototype';
const SERVER_STATE = scenario('work');

let state: ProtoState | null = null;
const listeners = new Set<() => void>();

const isScenarioKey = (value: unknown): value is ScenarioKey =>
  typeof value === 'string' && Object.keys(SCENARIO_LABELS).includes(value);

const load = (): ProtoState => {
  if (state) {
    return state;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Partial<ProtoState>;
      if (isScenarioKey(stored.scenario)) {
        state = { ...scenario(stored.scenario), ...stored };
        return state;
      }
    }
  } catch {
    // Storage blocked or unreadable: fall through to the seed.
  }
  state = SERVER_STATE;
  return state;
};

const commit = (next: ProtoState) => {
  state = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the in-memory copy still works for this page.
  }
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useAccessPrototype = () => {
  const current = useSyncExternalStore(subscribe, load, () => SERVER_STATE);

  const update = useCallback((recipe: (previous: ProtoState) => ProtoState) => commit(recipe(load())), []);

  const setScenario = useCallback((key: ScenarioKey) => commit(scenario(key)), []);

  const setAccess = useCallback(
    (patch: Partial<ProtoAccess>) => update(previous => ({ ...previous, access: { ...previous.access, ...patch } })),
    [update],
  );

  // Adding a domain creates the row at the defaults. Configuration happens
  // by editing the policy afterwards (Stephen, Sept 22).
  const addDomain = useCallback(
    (name: string) => {
      const domain = name.trim().toLowerCase();
      const policy = newPolicy(domain);
      // The catch-all is always the last row.
      update(previous => ({
        ...previous,
        policies: [
          ...previous.policies.filter(entry => !entry.isCatchAll),
          policy,
          ...previous.policies.filter(entry => entry.isCatchAll),
        ],
      }));
      return policy;
    },
    [update],
  );

  const updatePolicy = useCallback(
    (id: string, patch: Partial<ProtoPolicy> | ((policy: ProtoPolicy) => Partial<ProtoPolicy>)) =>
      update(previous => ({
        ...previous,
        policies: previous.policies.map(policy =>
          policy.id === id ? { ...policy, ...(typeof patch === 'function' ? patch(policy) : patch) } : policy,
        ),
      })),
    [update],
  );

  const removePolicy = useCallback(
    (id: string) =>
      update(previous => {
        const removed = previous.policies.find(policy => policy.id === id);
        return {
          ...previous,
          policies: previous.policies.filter(policy => policy.id !== id),
          // A connection nothing points at goes with its policy.
          connections: previous.connections.filter(
            connection =>
              connection.id !== removed?.connectionId ||
              previous.policies.some(policy => policy.id !== id && policy.connectionId === connection.id),
          ),
        };
      }),
    [update],
  );

  const addConnection = useCallback(
    (provider: ProtoProvider, name = PROVIDER_LABELS[provider].label): ProtoConnection => {
      const connection: ProtoConnection = { id: nextId('con'), provider, name, status: 'pending', logs: [] };
      update(previous => ({ ...previous, connections: [...previous.connections, connection] }));
      return connection;
    },
    [update],
  );

  const updateConnection = useCallback(
    (id: string, patch: Partial<ProtoConnection> | ((connection: ProtoConnection) => Partial<ProtoConnection>)) =>
      update(previous => ({
        ...previous,
        connections: previous.connections.map(connection =>
          connection.id === id
            ? { ...connection, ...(typeof patch === 'function' ? patch(connection) : patch) }
            : connection,
        ),
      })),
    [update],
  );

  // Removing a connection drops the policies that used it back to default
  // sign-in; the policies themselves stay.
  const removeConnection = useCallback(
    (id: string) =>
      update(previous => ({
        ...previous,
        connections: previous.connections.filter(connection => connection.id !== id),
        policies: previous.policies.map(policy =>
          policy.connectionId === id
            ? {
                ...policy,
                connectionId: undefined,
                signIn: 'default',
                enrollment: policy.enrollment === 'directory_sync' ? 'invitation_only' : policy.enrollment,
                directory: undefined,
              }
            : policy,
        ),
      })),
    [update],
  );

  return {
    ...current,
    setScenario,
    setAccess,
    addDomain,
    updatePolicy,
    removePolicy,
    addConnection,
    updateConnection,
    removeConnection,
  };
};

// Fakes network latency so buttons show their real loading states.
export const simulateRequest = (ms = 400) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Prototype-only: raw strings render fine at runtime (makeLocalizable's string branch).
export const protoKey = (value: string) => value as unknown as LocalizationKey;

// Prototype-only: readable runtime field names; FieldId only scopes descriptors.
export const protoFieldId = (value: string) => value as unknown as FieldId;
