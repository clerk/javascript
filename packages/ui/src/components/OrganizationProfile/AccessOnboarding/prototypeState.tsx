import type { FieldId } from '@clerk/shared/types';
import { useCallback, useSyncExternalStore } from 'react';

import type { LocalizationKey } from '../../../customizables';

/*
 * Prototype-only state for the Access page in <OrganizationProfile />.
 *
 * The model follows the Oct 2026 "MVP" Figma: a policy targets one or more
 * domains (or is the organization's catch-all) and is active, a draft, or
 * inactive. It carries MFA, sign-in (default or one or more SSO
 * connections), re-verification, enrollment (optionally from a directory),
 * and per-domain proof. SSO connections and directories live on the
 * Connections tab and are shared between policies. Nothing persists beyond
 * the browser tab: a module singleton mirrored to sessionStorage.
 */

export type ProtoEnrollment = 'invitation_only' | 'join_automatically' | 'request_access' | 'directory_sync';
export type ProtoSignIn = 'default' | 'sso';
export type ProtoMfa = 'off' | 'optional' | 'required';
export type ProtoPolicyStatus = 'active' | 'draft' | 'inactive';
export type ProtoProvider = 'saml_okta' | 'saml_microsoft' | 'saml_google' | 'saml_custom' | 'oidc';
export type ProtoNonDirectoryFallback = 'block' | 'request_access';
export type ProtoOwnership = 'unverified' | 'verified';
export type ProtoConnectionStatus = 'pending' | 'active' | 'broken';
export type ProtoConnectionKind = 'sso' | 'directory';

/** Proof for one domain on a policy. */
export type ProtoProof = {
  /** Someone with an email at the domain confirmed it. */
  association: boolean;
  /** DNS TXT record. Supersedes association. */
  ownership: ProtoOwnership;
};

export type ProtoPolicy = {
  id: string;
  /** Empty for the catch-all. */
  domains: string[];
  isCatchAll?: boolean;
  status: ProtoPolicyStatus;
  mfa: ProtoMfa;
  signIn: ProtoSignIn;
  /** SSO connections, in the order the policy lists them. */
  connectionIds: string[];
  /** null = the application default (24 hours). */
  reverificationHours: number | null;
  enrollment: ProtoEnrollment;
  /** The directory when enrollment is directory_sync. */
  directoryId?: string;
  nonDirectoryFallback: ProtoNonDirectoryFallback;
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
  kind: ProtoConnectionKind;
  provider: ProtoProvider;
  name: string;
  status: ProtoConnectionStatus;
  logs: ProtoTestLog[];
  /** Directories only. */
  token?: string;
};

export type ScenarioKey = 'work' | 'personal' | 'configured' | 'view_only' | 'sso_unavailable';

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  work: 'New org, work email',
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

/** The Add/Manage policy form, kept outside the page so the setup wizards can hand a new connection back to it. */
export type PolicyDraft = {
  /** The policy being edited, or 'new'. */
  policyId: string;
  domains: string[];
  proofs: Record<string, ProtoProof>;
  status: ProtoPolicyStatus;
  mfa: ProtoMfa;
  signIn: ProtoSignIn;
  connectionIds: string[];
  reverificationHours: number | null;
  enrollment: ProtoEnrollment;
  directoryId?: string;
  nonDirectoryFallback: ProtoNonDirectoryFallback;
};

export type ProtoState = {
  scenario: ScenarioKey;
  /** The signed-in member's email, so Add policy can start from their domain. */
  userEmail: string;
  policies: ProtoPolicy[];
  connections: ProtoConnection[];
  access: ProtoAccess;
  draft: PolicyDraft | null;
};

/* ----------------------------------------------------------------- labels */

export const ENROLLMENT_LABELS: Record<ProtoEnrollment, { label: string; description: string }> = {
  invitation_only: { label: 'Invitation only', description: 'Members can only join through invitation' },
  join_automatically: { label: 'Join automatically', description: 'Members can join without approval' },
  request_access: { label: 'Request access', description: 'Members can request to join with approval' },
  directory_sync: {
    label: 'Sync from directory',
    description: 'Members from the directory are automatically provisioned',
  },
};

export const NON_DIRECTORY_FALLBACK_LABELS: Record<ProtoNonDirectoryFallback, { label: string; description: string }> =
  {
    block: { label: 'Block access', description: 'Only directory members can join' },
    request_access: { label: 'Allow access requests', description: 'Members can request access from an admin' },
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

export const DOMAIN_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}$/;

/** The table's Target column. */
export const policyTarget = (policy: ProtoPolicy, policies: ProtoPolicy[]) => {
  if (policy.isCatchAll) {
    return policies.some(other => !other.isCatchAll && other.status === 'active') ? 'Everyone else' : 'Everyone';
  }
  return policy.domains.join(', ');
};

/* SSO or directory sync need ownership of the domain; anything else needs association. */
export const needsOwnership = (policy: Pick<ProtoPolicy, 'signIn' | 'enrollment'>) =>
  policy.signIn === 'sso' || policy.enrollment === 'directory_sync';

export const isProven = (policy: Pick<ProtoPolicy, 'signIn' | 'enrollment' | 'proofs'>, domain: string): boolean => {
  const proof = policy.proofs[domain];
  if (!proof) {
    return false;
  }
  if (proof.ownership === 'verified') {
    return true;
  }
  return !needsOwnership(policy) && proof.association;
};

export const connectionById = (id: string | undefined, connections: ProtoConnection[]) =>
  id ? (connections.find(connection => connection.id === id) ?? null) : null;

export const policiesUsing = (connectionId: string, policies: ProtoPolicy[]) =>
  policies.filter(policy => policy.connectionIds.includes(connectionId) || policy.directoryId === connectionId);

/** What stops a draft from going active, or null when nothing does. */
export const activationBlocker = (draft: PolicyDraft, isCatchAll: boolean): string | null => {
  if (isCatchAll) {
    return null;
  }
  if (draft.domains.length === 0) {
    return 'Add a domain';
  }
  if (!draft.domains.every(domain => isProven(draft, domain))) {
    return needsOwnership(draft) ? 'Verify domain ownership' : 'Verify the domain';
  }
  if (draft.signIn === 'sso' && draft.connectionIds.length === 0) {
    return 'Add an SSO connection';
  }
  if (draft.enrollment === 'directory_sync' && !draft.directoryId) {
    return 'Add a directory';
  }
  return null;
};

/* --------------------------------------------------------------- builders */

let counter = 0;
const nextId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(counter += 1)}`;

export const txtRecordFor = (domain: string) => ({
  name: `_clerk.${domain}`,
  value: `domain-verify=${domain.replace(/[^a-z0-9]/gi, '').slice(0, 4)}3t26nasu3yaiosjef`,
});

export const generateToken = () =>
  Array.from({ length: 18 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 34)]).join('');

const emptyProof = (): ProtoProof => ({ association: false, ownership: 'unverified' });

/** A domain's starting proof: association comes free when it is the member's own email domain. */
export const proofFor = (domain: string, userEmail: string): ProtoProof => ({
  ...emptyProof(),
  association: userEmail.toLowerCase().endsWith(`@${domain}`),
});

const policy = (domain: string, overrides: Partial<ProtoPolicy> = {}): ProtoPolicy => ({
  id: nextId('pol'),
  domains: [domain],
  status: 'active',
  mfa: 'off',
  signIn: 'default',
  connectionIds: [],
  reverificationHours: null,
  enrollment: 'invitation_only',
  nonDirectoryFallback: 'block',
  proofs: { [domain]: emptyProof() },
  createdAt: new Date().toISOString(),
  ...overrides,
});

const catchAll = (overrides: Partial<ProtoPolicy> = {}): ProtoPolicy => ({
  ...policy('', { id: 'pol_catch_all', createdAt: '2026-09-01T09:00:00.000Z' }),
  domains: [],
  proofs: {},
  isCatchAll: true,
  ...overrides,
});

export const draftFromPolicy = (source: ProtoPolicy): PolicyDraft => ({
  policyId: source.id,
  domains: source.domains,
  proofs: source.proofs,
  status: source.status,
  mfa: source.mfa,
  signIn: source.signIn,
  connectionIds: source.connectionIds,
  reverificationHours: source.reverificationHours,
  enrollment: source.enrollment,
  directoryId: source.directoryId,
  nonDirectoryFallback: source.nonDirectoryFallback,
});

/** Add policy starts from the member's own email domain when no policy has it yet. */
export const newDraft = (state: Pick<ProtoState, 'userEmail' | 'policies'>): PolicyDraft => {
  const own = state.userEmail.split('@')[1]?.toLowerCase() ?? '';
  const taken = state.policies.some(entry => entry.domains.includes(own));
  const domains = own && !taken ? [own] : [];
  return {
    policyId: 'new',
    domains,
    proofs: Object.fromEntries(domains.map(domain => [domain, proofFor(domain, state.userEmail)])),
    status: 'draft',
    mfa: 'required',
    signIn: 'default',
    connectionIds: [],
    reverificationHours: null,
    enrollment: 'invitation_only',
    nonDirectoryFallback: 'block',
  };
};

const DEFAULT_ACCESS: ProtoAccess = { canManage: true, ssoAllowed: true, ssoUnavailableMessage: '' };

const okLog = (id: string, at: string, detail: string): ProtoTestLog => ({ id, at, detail, status: 'success' });

const scenario = (key: ScenarioKey): ProtoState => {
  switch (key) {
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
      return { ...scenario('work'), scenario: key, userEmail: 'you@gmail.com' };
    case 'work':
      return {
        scenario: key,
        userEmail: 'you@acmedev.org',
        policies: [catchAll()],
        connections: [],
        access: DEFAULT_ACCESS,
        draft: null,
      };
    case 'configured':
      return {
        scenario: key,
        userEmail: 'you@acmedev.org',
        policies: [
          policy('acmedev.org', {
            id: 'pol_acmedev_org',
            mfa: 'required',
            signIn: 'sso',
            connectionIds: ['con_okta_engineering'],
            enrollment: 'directory_sync',
            directoryId: 'dir_okta',
            proofs: { 'acmedev.org': { association: true, ownership: 'verified' } },
            createdAt: '2026-09-12T10:00:00.000Z',
          }),
          policy('example.com', {
            id: 'pol_example_com',
            status: 'draft',
            proofs: { 'example.com': { association: false, ownership: 'unverified' } },
            createdAt: '2026-10-02T10:00:00.000Z',
          }),
          policy('exampledev.net', {
            id: 'pol_exampledev_net',
            status: 'inactive',
            mfa: 'required',
            signIn: 'sso',
            connectionIds: ['con_okta_marketing'],
            enrollment: 'directory_sync',
            directoryId: 'dir_okta',
            nonDirectoryFallback: 'request_access',
            proofs: { 'exampledev.net': { association: true, ownership: 'verified' } },
            createdAt: '2026-09-20T10:00:00.000Z',
          }),
          catchAll(),
        ],
        connections: [
          {
            id: 'con_okta_engineering',
            kind: 'sso',
            provider: 'saml_okta',
            name: 'Okta Engineering',
            status: 'active',
            logs: [okLog('log_1', '2026-09-22T13:15:08.000Z', 'Signed in as it-admin@acmedev.org')],
          },
          {
            id: 'con_okta_marketing',
            kind: 'sso',
            provider: 'saml_okta',
            name: 'Okta Marketing',
            status: 'active',
            logs: [okLog('log_2', '2026-09-20T08:02:41.000Z', 'Signed in as marketing@exampledev.net')],
          },
          {
            id: 'dir_okta',
            kind: 'directory',
            provider: 'saml_okta',
            name: 'Okta Directory',
            status: 'active',
            logs: [],
            token: 'FSLKJG2203498NMF02',
          },
        ],
        access: DEFAULT_ACCESS,
        draft: null,
      };
  }
};

/* ------------------------------------------------------------------ store */

const STORAGE_KEY = 'clerk-access-prototype-v2';
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

/** The catch-all is always the last row. */
const withCatchAllLast = (policies: ProtoPolicy[]) => [
  ...policies.filter(entry => !entry.isCatchAll),
  ...policies.filter(entry => entry.isCatchAll),
];

export const useAccessPrototype = () => {
  const current = useSyncExternalStore(subscribe, load, () => SERVER_STATE);

  const update = useCallback((recipe: (previous: ProtoState) => ProtoState) => commit(recipe(load())), []);

  const setScenario = useCallback((key: ScenarioKey) => commit(scenario(key)), []);

  const setDraft = useCallback(
    (next: PolicyDraft | null | ((previous: PolicyDraft) => PolicyDraft)) =>
      update(previous => ({
        ...previous,
        draft: typeof next === 'function' ? (previous.draft ? next(previous.draft) : previous.draft) : next,
      })),
    [update],
  );

  /** Writes the draft to its policy (creating it for 'new') and returns the policy id. */
  const saveDraft = useCallback(
    (draft: PolicyDraft, status: ProtoPolicyStatus) => {
      const id = draft.policyId === 'new' ? nextId('pol') : draft.policyId;
      const { policyId: _policyId, ...fields } = draft;
      update(previous => {
        const existing = previous.policies.find(entry => entry.id === id);
        const saved: ProtoPolicy = existing
          ? { ...existing, ...fields, status }
          : { ...policy(draft.domains[0] ?? ''), ...fields, id, status };
        return {
          ...previous,
          draft: null,
          policies: withCatchAllLast(
            existing
              ? previous.policies.map(entry => (entry.id === id ? saved : entry))
              : [...previous.policies, saved],
          ),
        };
      });
      return id;
    },
    [update],
  );

  const updatePolicy = useCallback(
    (id: string, patch: Partial<ProtoPolicy>) =>
      update(previous => ({
        ...previous,
        policies: previous.policies.map(entry => (entry.id === id ? { ...entry, ...patch } : entry)),
      })),
    [update],
  );

  const removePolicy = useCallback(
    (id: string) => update(previous => ({ ...previous, policies: previous.policies.filter(entry => entry.id !== id) })),
    [update],
  );

  const addConnection = useCallback(
    (connection: Omit<ProtoConnection, 'id' | 'logs'> & { logs?: ProtoTestLog[] }): ProtoConnection => {
      const created: ProtoConnection = {
        logs: [],
        ...connection,
        id: nextId(connection.kind === 'sso' ? 'con' : 'dir'),
      };
      update(previous => ({ ...previous, connections: [...previous.connections, created] }));
      return created;
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

  return {
    ...current,
    setScenario,
    setDraft,
    saveDraft,
    updatePolicy,
    removePolicy,
    addConnection,
    updateConnection,
  };
};

// Fakes network latency so buttons show their real loading states.
export const simulateRequest = (ms = 400) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Prototype-only: raw strings render fine at runtime (makeLocalizable's string branch).
export const protoKey = (value: string) => value as unknown as LocalizationKey;

// Prototype-only: readable runtime field names; FieldId only scopes descriptors.
export const protoFieldId = (value: string) => value as unknown as FieldId;
