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
/** People at the domain who aren't provisioned by the directory. */
export type ProtoNonDirectoryFallback = 'join' | 'create_own' | 'error';
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
  /** Shown in the error when nonDirectoryFallback is 'error'. */
  contactEmail: string;
  proofs: Record<string, ProtoProof>;
  /** MFA is skipped for people who signed in with one of the policy's SSO connections. */
  skipMfaForSso: boolean;
  /** Parent organizations only: the sub-organizations the policy's rules reach. Undefined = all. */
  subOrganizationIds?: string[];
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
  /** SSO only: who can sign in with an email code if the connection breaks. */
  bypassEmails?: string[];
};

export type ScenarioKey =
  | 'work'
  | 'personal'
  | 'configured'
  | 'view_only'
  | 'sso_unavailable'
  | 'claims_off'
  | 'parent'
  | 'child';

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  work: 'New org, work email',
  personal: 'New org, personal email',
  configured: 'Configured org',
  view_only: 'Configured org, view only',
  sso_unavailable: 'New org, SSO not allowed',
  claims_off: 'Configured org, claiming not allowed',
  parent: 'Parent organization',
  child: 'Sub-organization',
};

/* --------------------------------------------------------------- claiming */

/** Someone with an email at a domain who isn't a member of this organization. */
export type ProtoOutsidePerson = {
  email: string;
  lastSignIn: string;
  /** How many other organizations they belong to. Names stay hidden from the organization. */
  otherOrganizations: number;
  /** Their only organization is one where they are the sole member. */
  inSingleMemberOrganization: boolean;
  inactive: boolean;
};

export type ProtoClaimStatus = 'notice' | 'claimed' | 'proof_lost';

/** Claiming a domain: people there join this organization. No entry = not claimed. */
export type ProtoClaim = {
  status: ProtoClaimStatus;
  /** When the notice period ends, or ended. */
  startsAt: string;
  /** When a claim with lost proof is released. */
  endsAt?: string;
  /** Also bring in single-member organizations and ask owners of shared ones. */
  includeOrganizations: boolean;
};

export const CLAIM_NOTICE_DAYS = 14;
export const CLAIM_RELEASE_DAYS = 30;

const addDays = (from: Date, days: number) => new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* ---------------------------------------------------- parent organizations */

export type ProtoSubOrganization = { id: string; name: string; membersCount: number };

/** How someone who signs in at a parent's domain ends up in a sub-organization. */
export type ProtoRouting = 'application' | 'org_rules' | 'directory_groups' | 'group_per_organization';

export const ROUTING_LABELS: Record<ProtoRouting, { label: string; description: string }> = {
  application: {
    label: 'Your application adds them',
    description: 'They can sign in straight away, and belong to no sub-organization until the application adds them.',
  },
  org_rules: {
    label: 'Each sub-organization decides',
    description: 'Sub-organizations use their own enrollment rules. Best when each has its own domain.',
  },
  directory_groups: {
    label: 'Directory groups',
    description: 'Map groups from your identity provider to existing sub-organizations.',
  },
  group_per_organization: {
    label: 'One sub-organization per directory group',
    description: 'Each group becomes a sub-organization, and its members stay in sync with the group.',
  },
};

export type ProtoGroupMapping = { group: string; subOrganizationId: string | null };

/**
 * A parent is an organization with a type flag and sub-organizations. Nobody
 * joins it by domain. Its sign-in follows the domain, so it reaches everyone
 * there; its MFA and enrollment rules reach members of its sub-organizations.
 */
export type ProtoHierarchy = {
  /** Which side of the hierarchy is on screen. */
  role: 'parent' | 'child';
  parentName: string;
  subOrganizations: ProtoSubOrganization[];
  routing: ProtoRouting;
  groupMappings: ProtoGroupMapping[];
  /** The member on screen is also a member of the parent, so the switcher offers a way in. */
  isParentMember: boolean;
  /** Optional: parent members can open every sub-organization. Off by default. */
  parentMembersSeeAll: boolean;
};

/** Another organization in the application that shares a domain with this one. */
export type ProtoRelatedOrganization = {
  id: string;
  name: string;
  membersCount: number;
  domain: string;
  /** It proved the domain itself. */
  ownsDomain: boolean;
  /** The member on screen is an admin there. */
  isAdmin: boolean;
};

/** What the application owner allows this organization's members to do. */
export type ProtoAccess = {
  /** org:sys_domains:manage. Off = view only. */
  canManage: boolean;
  /** The application owner allowed SSO and directory sync for this org. */
  ssoAllowed: boolean;
  /** Shown on the SSO option when ssoAllowed is off. */
  ssoUnavailableMessage: string;
  /** The application owner lets members claim domains they own. */
  claimsAllowed: boolean;
  /** ...and bring in other organizations on those domains. */
  organizationClaimsAllowed: boolean;
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
  contactEmail: string;
  skipMfaForSso: boolean;
  subOrganizationIds?: string[];
};

export type ProtoState = {
  scenario: ScenarioKey;
  /** The signed-in member's email, so Add policy can start from their domain. */
  userEmail: string;
  policies: ProtoPolicy[];
  connections: ProtoConnection[];
  access: ProtoAccess;
  draft: PolicyDraft | null;
  organizationName: string;
  /** Keyed by domain. */
  outsidePeople: Record<string, ProtoOutsidePerson[]>;
  /** Keyed by domain. */
  claims: Record<string, ProtoClaim>;
  hierarchy: ProtoHierarchy | null;
  relatedOrganizations: ProtoRelatedOrganization[];
  /** A one-off message on the Access page, e.g. after creating a parent. */
  notice: string | null;
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
    create_own: {
      label: 'Let them create their own organization',
      description: 'They can sign in and start a separate organization',
    },
    join: {
      label: 'Add them to this organization',
      description: 'They join even though the directory doesn’t list them',
    },
    error: { label: 'Show an error', description: 'They can’t continue and see who to contact' },
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
  nonDirectoryFallback: 'create_own',
  contactEmail: '',
  proofs: { [domain]: emptyProof() },
  skipMfaForSso: false,
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
  contactEmail: source.contactEmail,
  skipMfaForSso: source.skipMfaForSso,
  subOrganizationIds: source.subOrganizationIds,
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
    nonDirectoryFallback: 'create_own',
    contactEmail: '',
    skipMfaForSso: false,
  };
};

const DEFAULT_ACCESS: ProtoAccess = {
  canManage: true,
  ssoAllowed: true,
  ssoUnavailableMessage: '',
  claimsAllowed: true,
  organizationClaimsAllowed: true,
};

const person = (
  email: string,
  lastSignIn: string,
  otherOrganizations: number,
  extra: Partial<ProtoOutsidePerson> = {},
): ProtoOutsidePerson => ({
  email,
  lastSignIn,
  otherOrganizations,
  inSingleMemberOrganization: false,
  inactive: false,
  ...extra,
});

const ACME_OUTSIDE: ProtoOutsidePerson[] = [
  person('sam.ortiz@acmedev.org', '2 days ago', 1, { inSingleMemberOrganization: true }),
  person('lee.park@acmedev.org', '5 days ago', 1),
  person('jordan.wu@acmedev.org', '3 weeks ago', 2),
  person('riley.shah@acmedev.org', 'Yesterday', 0),
  person('alex.kim@acmedev.org', '4 months ago', 1, { inSingleMemberOrganization: true, inactive: true }),
];

const OUTSIDE_PEOPLE: Record<string, ProtoOutsidePerson[]> = {
  'acmedev.org': ACME_OUTSIDE,
  'exampledev.net': [
    person('casey@exampledev.net', '1 week ago', 1, { inSingleMemberOrganization: true }),
    person('morgan@exampledev.net', '2 months ago', 1),
  ],
  'meridianvet.com': [
    person('nadia.ross@meridianvet.com', '3 days ago', 1, { inSingleMemberOrganization: true }),
    person('owen.cho@meridianvet.com', '1 week ago', 1),
    person('ines.duarte@meridianvet.com', 'Yesterday', 0),
    person('ben.fowler@meridianvet.com', '5 months ago', 1, { inSingleMemberOrganization: true, inactive: true }),
  ],
  'meridianpets.com': [person('kai.morgan@meridianpets.com', '2 weeks ago', 1)],
};

export const PARENT_NAME = 'Meridian Vet Group';

const MERIDIAN_SUB_ORGANIZATIONS: ProtoSubOrganization[] = [
  { id: 'org_sub_austin', name: 'Austin Clinic', membersCount: 42 },
  { id: 'org_sub_dallas', name: 'Dallas Clinic', membersCount: 31 },
  { id: 'org_sub_houston', name: 'Houston Clinic', membersCount: 58 },
  { id: 'org_sub_el_paso', name: 'El Paso Clinic', membersCount: 17 },
];

const MERIDIAN_HIERARCHY: ProtoHierarchy = {
  role: 'parent',
  parentName: PARENT_NAME,
  subOrganizations: MERIDIAN_SUB_ORGANIZATIONS,
  routing: 'application',
  groupMappings: [
    { group: 'Austin staff', subOrganizationId: 'org_sub_austin' },
    { group: 'Dallas staff', subOrganizationId: 'org_sub_dallas' },
    { group: 'Houston staff', subOrganizationId: 'org_sub_houston' },
    { group: 'El Paso staff', subOrganizationId: 'org_sub_el_paso' },
    { group: 'Regional managers', subOrganizationId: null },
  ],
  isParentMember: true,
  parentMembersSeeAll: false,
};

const ACME_RELATED: ProtoRelatedOrganization[] = [
  {
    id: 'org_acme_research',
    name: 'Acme Research',
    membersCount: 12,
    domain: 'acmedev.org',
    ownsDomain: false,
    isAdmin: true,
  },
  {
    id: 'org_acme_design',
    name: 'Acme Design',
    membersCount: 7,
    domain: 'acmedev.org',
    ownsDomain: false,
    isAdmin: false,
  },
  { id: 'org_acme_labs', name: 'Acme Labs', membersCount: 19, domain: 'acmelabs.io', ownsDomain: true, isAdmin: true },
];

/** The parent's rules, as a sub-organization sees them. */
export const PARENT_RULES = [
  { rule: 'Sign-in', value: 'SSO with Meridian Okta', audience: 'Everyone with a meridianvet.com email' },
  {
    rule: 'Multi-factor authentication',
    value: 'Required, skipped after SSO',
    audience: 'Members of this organization',
  },
  {
    rule: 'Domain',
    value: `meridianvet.com is claimed by ${PARENT_NAME}`,
    audience: 'Everyone with a meridianvet.com email',
  },
];

/** Domains the parent manages, which a sub-organization can't target. */
export const PARENT_DOMAINS = ['meridianvet.com', 'meridianpets.com'];

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
        organizationName: 'Acme',
        outsidePeople: OUTSIDE_PEOPLE,
        claims: {},
        hierarchy: null,
        relatedOrganizations: ACME_RELATED,
        notice: null,
      };
    case 'claims_off':
      return {
        ...scenario('configured'),
        scenario: key,
        access: { ...DEFAULT_ACCESS, claimsAllowed: false, organizationClaimsAllowed: false },
      };
    case 'child':
      return {
        ...scenario('work'),
        scenario: key,
        userEmail: 'dana@meridianvet.com',
        organizationName: 'Austin Clinic',
        relatedOrganizations: [],
        hierarchy: { ...MERIDIAN_HIERARCHY, role: 'child' },
      };
    case 'parent':
      return {
        scenario: key,
        userEmail: 'dana@meridianvet.com',
        organizationName: PARENT_NAME,
        policies: [
          policy('meridianvet.com', {
            id: 'pol_meridianvet',
            mfa: 'required',
            skipMfaForSso: true,
            signIn: 'sso',
            connectionIds: ['con_meridian_okta'],
            proofs: { 'meridianvet.com': { association: true, ownership: 'verified' } },
            createdAt: '2025-03-11T15:04:00.000Z',
          }),
          policy('meridianpets.com', {
            id: 'pol_meridianpets',
            mfa: 'required',
            signIn: 'sso',
            connectionIds: ['con_meridian_okta'],
            subOrganizationIds: ['org_sub_houston', 'org_sub_el_paso'],
            proofs: { 'meridianpets.com': { association: true, ownership: 'verified' } },
            createdAt: '2025-06-19T15:04:00.000Z',
          }),
          catchAll(),
        ],
        connections: [
          {
            id: 'con_meridian_okta',
            kind: 'sso',
            provider: 'saml_okta',
            name: 'Meridian Okta',
            status: 'active',
            logs: [okLog('log_m1', '2026-11-02T09:12:00.000Z', 'Signed in as dana@meridianvet.com')],
            bypassEmails: ['dana@meridianvet.com'],
          },
          {
            id: 'dir_meridian_okta',
            kind: 'directory',
            provider: 'saml_okta',
            name: 'Meridian Okta Directory',
            status: 'active',
            logs: [],
            token: 'MRDN8842KQ0PLX73ZB',
          },
        ],
        access: DEFAULT_ACCESS,
        draft: null,
        outsidePeople: OUTSIDE_PEOPLE,
        claims: {
          'meridianpets.com': { status: 'claimed', startsAt: '2026-10-20T09:00:00.000Z', includeOrganizations: false },
        },
        hierarchy: MERIDIAN_HIERARCHY,
        relatedOrganizations: [],
        notice: null,
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
            nonDirectoryFallback: 'error',
            contactEmail: 'it@exampledev.net',
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
            bypassEmails: ['it-admin@acmedev.org'],
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
        organizationName: 'Acme',
        outsidePeople: OUTSIDE_PEOPLE,
        claims: {
          'exampledev.net': { status: 'notice', startsAt: '2026-11-18T09:00:00.000Z', includeOrganizations: true },
        },
        hierarchy: null,
        relatedOrganizations: ACME_RELATED,
        notice: null,
      };
  }
};

/* ------------------------------------------------------------------ store */

const STORAGE_KEY = 'clerk-access-prototype-v4';
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

  const startClaim = useCallback(
    (domain: string, startNow: boolean, includeOrganizations: boolean) => {
      const now = new Date();
      const claim: ProtoClaim = startNow
        ? { status: 'claimed', startsAt: now.toISOString(), includeOrganizations }
        : { status: 'notice', startsAt: addDays(now, CLAIM_NOTICE_DAYS), includeOrganizations };
      update(previous => ({ ...previous, claims: { ...previous.claims, [domain]: claim } }));
    },
    [update],
  );

  const startClaimNow = useCallback(
    (domain: string) =>
      update(previous => {
        const claim = previous.claims[domain];
        return claim
          ? {
              ...previous,
              claims: {
                ...previous.claims,
                [domain]: { ...claim, status: 'claimed', startsAt: new Date().toISOString() },
              },
            }
          : previous;
      }),
    [update],
  );

  const endClaim = useCallback(
    (domain: string) =>
      update(previous => {
        const { [domain]: _removed, ...claims } = previous.claims;
        return { ...previous, claims };
      }),
    [update],
  );

  /** Prototype-only: the DNS record disappears, so the claim winds down. */
  const loseOwnership = useCallback(
    (domain: string) =>
      update(previous => {
        const claim = previous.claims[domain];
        return claim
          ? {
              ...previous,
              claims: {
                ...previous.claims,
                [domain]: { ...claim, status: 'proof_lost', endsAt: addDays(new Date(), CLAIM_RELEASE_DAYS) },
              },
            }
          : previous;
      }),
    [update],
  );

  /** Ownership proven again: a winding-down claim is back in force. */
  const restoreClaim = useCallback(
    (domain: string) =>
      update(previous => {
        const claim = previous.claims[domain];
        return claim?.status === 'proof_lost'
          ? {
              ...previous,
              claims: { ...previous.claims, [domain]: { ...claim, status: 'claimed', endsAt: undefined } },
            }
          : previous;
      }),
    [update],
  );

  const updateHierarchy = useCallback(
    (patch: Partial<ProtoHierarchy>) =>
      update(previous =>
        previous.hierarchy ? { ...previous, hierarchy: { ...previous.hierarchy, ...patch } } : previous,
      ),
    [update],
  );

  /**
   * Puts a parent on top of this organization and the chosen others. They keep
   * their IDs and data; domain proof moves up so nobody verifies again.
   * Organizations the member doesn't administer join once their owner agrees.
   */
  const createParent = useCallback(
    (name: string, organizationIds: string[]) =>
      update(previous => {
        const chosen = previous.relatedOrganizations.filter(entry => organizationIds.includes(entry.id));
        const joined = chosen.filter(entry => entry.isAdmin);
        const pending = chosen.filter(entry => !entry.isAdmin);
        const proven = previous.policies.flatMap(policy =>
          policy.domains.filter(domain => policy.proofs[domain]?.ownership === 'verified'),
        );
        const moved = [...new Set([...proven, ...joined.filter(entry => entry.ownsDomain).map(entry => entry.domain)])];
        return {
          ...previous,
          organizationName: name,
          hierarchy: {
            role: 'parent',
            parentName: name,
            subOrganizations: [
              { id: 'org_current', name: previous.organizationName, membersCount: 24 },
              ...joined.map(entry => ({ id: entry.id, name: entry.name, membersCount: entry.membersCount })),
            ],
            routing: 'application',
            groupMappings: [],
            isParentMember: true,
            parentMembersSeeAll: false,
          },
          relatedOrganizations: previous.relatedOrganizations.filter(entry => !joined.includes(entry)),
          notice: [
            `${name} now manages ${joined.length + 1} organization${joined.length ? 's' : ''}. You’re its first member; others join by invitation.`,
            moved.length ? `Proof for ${moved.join(', ')} moved to ${name}, so nobody needs to verify again.` : null,
            pending.length
              ? `${pending.map(entry => entry.name).join(', ')} ${pending.length === 1 ? 'joins' : 'join'} once ${pending.length === 1 ? 'its owner agrees' : 'their owners agree'}.`
              : null,
          ]
            .filter(Boolean)
            .join(' '),
        };
      }),
    [update],
  );

  const dismissNotice = useCallback(() => update(previous => ({ ...previous, notice: null })), [update]);

  return {
    ...current,
    createParent,
    dismissNotice,
    startClaim,
    startClaimNow,
    endClaim,
    loseOwnership,
    restoreClaim,
    updateHierarchy,
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
