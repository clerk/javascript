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
/** Users at the domain who aren't provisioned by the directory. */
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
  /** Membership only here: people at these domains can only be in this organization. */
  exclusive?: boolean;
  /** Under exclusive: when people at these domains are removed from their other organizations. */
  removeElsewhereOn?: string;
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

const SCENARIO_KEYS = [
  'domain_elsewhere',
  'domain_clear',
  'domain_taken',
  'configured',
  // Not in the picker: the parent account states the tests start from.
  'personal',
  'parent',
  'child',
  'join_request',
] as const;

export type ScenarioKey = (typeof SCENARIO_KEYS)[number];

/** What the sandbox picker offers, and the Access view each one opens on. */
export const PICKER_SCENARIOS: { key: ScenarioKey; label: string; open: Record<string, string> }[] = [
  { key: 'domain_elsewhere', label: 'Domain, users in other orgs', open: { policy: 'new' } },
  { key: 'domain_clear', label: 'Domain, nobody in other orgs', open: { policy: 'new' } },
  { key: 'domain_taken', label: 'Domain, SSO in another org', open: { policy: 'new' } },
  { key: 'configured', label: 'SSO already live', open: {} },
];

/* --------------------------------------------------------- outside people */

/** Someone with an email at a domain who isn't a member of this organization. */
export type ProtoOutsidePerson = {
  email: string;
  /** How many other organizations they belong to. Names stay hidden from the organization. */
  otherOrganizations: number;
  inactive: boolean;
};

/** How long people get between a change to their organizations and its effect. */
export const CHANGE_NOTICE_DAYS = 14;

export const addDays = (from: Date, days: number) =>
  new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* ---------------------------------------------------- parent organizations */

export type ProtoSubOrganization = { id: string; name: string; membersCount: number };

/** Where someone who signs in at a parent's domain lands. */
export type ProtoRouting = 'invited' | 'one_organization' | 'rules';

export const ROUTING_OPTIONS: Record<ProtoRouting, { label: string; description: string }> = {
  invited: {
    label: 'No organization until invited',
    description: 'They sign in, then wait for an invitation.',
  },
  one_organization: {
    label: 'One organization',
    description: 'Everyone joins an organization you pick.',
  },
  rules: {
    label: 'By directory group or domain',
    description: 'Recommended with SSO and directory sync.',
  },
};

/** Users in a directory group, or at a domain, join these organizations. Rules add up: users join every match. */
export type ProtoPlacementRule = { id: string; kind: 'group' | 'domain'; value: string; organizationIds: string[] };

/** The groups the parent's directory sends. */
export const DIRECTORY_GROUPS = [
  'Austin Clinic Staff',
  'Dallas Clinic Staff',
  'Houston Clinic Staff',
  'El Paso Clinic Staff',
  'Regional Managers',
];

/** Where users land, to finish "Where users land: …" elsewhere on the page. */
export const landingSummary = (
  hierarchy: Pick<ProtoHierarchy, 'routing' | 'landingOrganizationId' | 'subOrganizations'>,
) => {
  if (hierarchy.routing === 'one_organization') {
    return (
      hierarchy.subOrganizations.find(entry => entry.id === hierarchy.landingOrganizationId)?.name ?? 'one organization'
    );
  }
  const { label } = ROUTING_OPTIONS[hierarchy.routing];
  return label.charAt(0).toLowerCase() + label.slice(1);
};

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
  /** One organization: where everyone lands. */
  landingOrganizationId?: string | null;
  /** By directory group or domain. */
  placementRules?: ProtoPlacementRule[];
  /** By directory group or domain: where users no rule matches land. Null is no organization. */
  fallbackOrganizationId?: string | null;
  /** The member on screen is also a member of the parent, so the switcher offers a way in. */
  isParentMember: boolean;
  /** Optional: parent members can open every sub-organization. Off by default. */
  parentMembersSeeAll: boolean;
  /** Organizations outside the parent it has invited, by organization id. */
  organizationPlans?: Record<string, ProtoOrganizationPlan>;
  /** Decisions on unmanaged users, by email. */
  userPlans?: Record<string, ProtoUserPlan>;
  /** For users who migrate: the parent's organization they join, by email. */
  userDestinations?: Record<string, string>;
};

/** For an organization outside the parent: invited to join it, with all its members. */
export type ProtoOrganizationPlan = 'bring';

/** For an unmanaged user: migrate them into one of the parent's organizations, or remove them from the others. */
export type ProtoUserPlan = 'migrate' | 'remove';

/** Another organization in the application that shares a domain with this one. */
export type ProtoRelatedOrganization = {
  id: string;
  name: string;
  membersCount: number;
  domain: string;
  /** It proved the domain itself. */
  ownsDomain: boolean;
  /** It has single sign-on set up for the domain. */
  sso?: boolean;
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
  contactEmail: string;
  skipMfaForSso: boolean;
  subOrganizationIds?: string[];
  exclusive: boolean;
  removeElsewhereOn?: string;
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
  hierarchy: ProtoHierarchy | null;
  relatedOrganizations: ProtoRelatedOrganization[];
  /** A one-off message on the Access page, e.g. after creating a parent. */
  notice: string | null;
  /** Shown at the top of the policy form, e.g. after its domain moved to a parent account. */
  policyNotice?: string | null;
  /** Members here sign in with another organization's SSO, because it owns their domain. */
  externalSignIn?: ProtoExternalSignIn | null;
  /** Organizations that asked this one to manage them. */
  joinRequests?: ProtoJoinRequest[];
};

export type ProtoExternalSignIn = {
  ownerName: string;
  /** The owner's parent account, the only thing another organization can ask to join. */
  enterpriseName?: string;
  domain: string;
  members: string[];
  status: 'new' | 'requested' | 'dismissed';
};

export type ProtoJoinRequest = {
  id: string;
  name: string;
  membersCount: number;
  /** Its members at this organization's domains. */
  people: string[];
  requestedBy: string;
};

/* ----------------------------------------------------------------- labels */

export const ENROLLMENT_LABELS: Record<ProtoEnrollment, { label: string; description: string }> = {
  invitation_only: { label: 'Invitation only', description: 'Members can only join through invitation' },
  join_automatically: {
    label: 'Join automatically',
    description: 'Users at these domains join when they sign in. They’ll see this organization in their switcher.',
  },
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

/* SSO, directory sync or keeping users out of other organizations need ownership of the domain; anything else needs association. */
export const needsOwnership = (policy: Pick<ProtoPolicy, 'signIn' | 'enrollment' | 'exclusive'>) =>
  policy.signIn === 'sso' || policy.enrollment === 'directory_sync' || Boolean(policy.exclusive);

export const isProven = (
  policy: Pick<ProtoPolicy, 'signIn' | 'enrollment' | 'exclusive' | 'proofs'>,
  domain: string,
): boolean => {
  const proof = policy.proofs[domain];
  if (!proof) {
    return false;
  }
  if (proof.ownership === 'verified') {
    return true;
  }
  return !needsOwnership(policy) && proof.association;
};

/** Every domain the organization has proven it owns, on any of its policies. */
export const provenDomains = (policies: Pick<ProtoPolicy, 'domains' | 'proofs'>[]) => [
  ...new Set(policies.flatMap(entry => entry.domains.filter(domain => entry.proofs[domain]?.ownership === 'verified'))),
];

/** Every domain the policies target, with the strongest proof any of them holds for it. */
const orgDomains = (state: Pick<ProtoState, 'policies'>) => {
  const proofs = new Map<string, ProtoProof>();
  state.policies.forEach(entry =>
    entry.domains.forEach(domain => {
      const proof = entry.proofs[domain];
      if (!proofs.has(domain) || proof?.ownership === 'verified') {
        proofs.set(domain, proof ?? emptyProof());
      }
    }),
  );
  return [...proofs].map(([domain, proof]) => ({ domain, proof }));
};

/** A domain's proof when it's added to a policy: whatever the organization already proved. */
export const knownProof = (state: Pick<ProtoState, 'policies' | 'userEmail'>, domain: string) =>
  orgDomains(state).find(entry => entry.domain === domain)?.proof ?? proofFor(domain, state.userEmail);

export const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

export const joinList = (items: string[]) =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export const connectionById = (id: string | undefined, connections: ProtoConnection[]) =>
  id ? (connections.find(connection => connection.id === id) ?? null) : null;

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
  mfa: 'optional',
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
  exclusive: source.exclusive ?? false,
  removeElsewhereOn: source.removeElsewhereOn,
});

/** Another organization that owns the member's own email domain, so it can't start a new policy. */
export const ownDomainOwner = (state: Pick<ProtoState, 'userEmail' | 'relatedOrganizations'>) => {
  const own = state.userEmail.split('@')[1]?.toLowerCase() ?? '';
  return state.relatedOrganizations.find(entry => entry.domain === own && entry.ownsDomain) ?? null;
};

/** Add policy starts from the member's own email domain when no policy has it yet. */
export const newDraft = (state: Pick<ProtoState, 'userEmail' | 'policies' | 'relatedOrganizations'>): PolicyDraft => {
  const own = state.userEmail.split('@')[1]?.toLowerCase() ?? '';
  const taken = state.policies.some(entry => entry.domains.includes(own)) || Boolean(ownDomainOwner(state));
  const domains = own && !taken ? [own] : [];
  return {
    policyId: 'new',
    domains,
    proofs: Object.fromEntries(domains.map(domain => [domain, knownProof(state, domain)])),
    status: 'draft',
    mfa: 'optional',
    signIn: 'default',
    connectionIds: [],
    reverificationHours: null,
    enrollment: 'invitation_only',
    nonDirectoryFallback: 'create_own',
    contactEmail: '',
    skipMfaForSso: false,
    exclusive: false,
  };
};

const DEFAULT_ACCESS: ProtoAccess = {
  canManage: true,
  ssoAllowed: true,
  ssoUnavailableMessage: '',
};

const person = (
  email: string,
  otherOrganizations: number,
  extra: Partial<ProtoOutsidePerson> = {},
): ProtoOutsidePerson => ({
  email,
  otherOrganizations,
  inactive: false,
  ...extra,
});

const ACME_OUTSIDE: ProtoOutsidePerson[] = [
  person('sam.ortiz@acmedev.org', 1),
  person('lee.park@acmedev.org', 1),
  person('jordan.wu@acmedev.org', 2),
  person('riley.shah@acmedev.org', 0),
  person('alex.kim@acmedev.org', 1, { inactive: true }),
];

const OUTSIDE_PEOPLE: Record<string, ProtoOutsidePerson[]> = {
  'acme.com': [person('dana@acme.com', 1), person('eli@acme.com', 2), person('fran@acme.com', 0)],
  'acmedev.org': ACME_OUTSIDE,
  'exampledev.net': [person('casey@exampledev.net', 1), person('morgan@exampledev.net', 1)],
  'meridianvet.com': [
    person('nadia.ross@meridianvet.com', 1),
    person('owen.cho@meridianvet.com', 2),
    person('ines.duarte@meridianvet.com', 0),
    person('ben.fowler@meridianvet.com', 1, { inactive: true }),
  ],
  'meridianpets.com': [person('kai.morgan@meridianpets.com', 1)],
};

/** An organization outside this one that people at a domain belong to. */
export type ProtoOutsideOrganization = {
  id: string;
  name: string;
  membersCount: number;
  /** Emails at the domain that are members there. */
  people: string[];
  /** The member on screen administers it, so it can move without asking. */
  isAdmin: boolean;
};

const outsideOrganization = (
  id: string,
  name: string,
  membersCount: number,
  people: string[],
  isAdmin = false,
): ProtoOutsideOrganization => ({ id, name, membersCount, people, isAdmin });

/** Keyed by domain; matches each person's otherOrganizations count. */
export const OUTSIDE_ORGANIZATIONS: Record<string, ProtoOutsideOrganization[]> = {
  'acme.com': [
    outsideOrganization('org_out_dana', 'Dana’s workspace', 1, ['dana@acme.com']),
    outsideOrganization('org_out_northwind', 'Northwind Partners', 9, ['eli@acme.com']),
    outsideOrganization('org_out_globex', 'Globex Consulting', 23, ['eli@acme.com']),
  ],
  'acmedev.org': [
    outsideOrganization(
      'org_acme_research',
      'Acme Research',
      12,
      ['lee.park@acmedev.org', 'jordan.wu@acmedev.org'],
      true,
    ),
    outsideOrganization('org_acme_design', 'Acme Design', 7, ['jordan.wu@acmedev.org']),
    outsideOrganization('org_out_sam', 'Sam’s workspace', 1, ['sam.ortiz@acmedev.org']),
    outsideOrganization('org_out_alex', 'Alex’s side project', 1, ['alex.kim@acmedev.org']),
  ],
  'exampledev.net': [
    outsideOrganization('org_out_casey', 'Casey’s workspace', 1, ['casey@exampledev.net']),
    outsideOrganization('org_out_initech', 'Initech', 14, ['morgan@exampledev.net']),
  ],
  'meridianvet.com': [
    outsideOrganization('org_out_nadia', 'Nadia’s workspace', 1, ['nadia.ross@meridianvet.com']),
    outsideOrganization('org_out_paws', 'Paws Partners Network', 30, ['owen.cho@meridianvet.com']),
    outsideOrganization('org_out_lonestar', 'Lone Star Vet Collective', 18, ['owen.cho@meridianvet.com']),
    outsideOrganization('org_out_ben', 'Ben’s practice notes', 1, ['ben.fowler@meridianvet.com']),
  ],
  'meridianpets.com': [outsideOrganization('org_out_supply', 'Pet Supply Co-op', 11, ['kai.morgan@meridianpets.com'])],
};

export const outsideOrganizationsAt = (domains: string[]) =>
  domains.flatMap(domain => OUTSIDE_ORGANIZATIONS[domain] ?? []);

/** Organizations the member on screen can bring in without asking: ones they administer, or a one-user workspace. */
export const joinsRightAway = (organization: ProtoOutsideOrganization) =>
  organization.isAdmin || organization.membersCount === 1;

/** A parent's proven domains, and the organizations outside it that have users there. */
export const outsideOfParent = (state: Pick<ProtoState, 'policies' | 'draft' | 'hierarchy'>) => {
  // A policy that moved here unsaved still counts: its domain is already proven.
  const domains = provenDomains(state.draft ? [...state.policies, state.draft] : state.policies);
  const managed = new Set(state.hierarchy?.subOrganizations.map(entry => entry.id) ?? []);
  return { domains, organizations: outsideOrganizationsAt(domains).filter(entry => !managed.has(entry.id)) };
};

/** Members of this organization who are also in other organizations, keyed by domain. */
const MEMBERS_ELSEWHERE: Record<string, { people: ProtoOutsidePerson[]; organizations: ProtoOutsideOrganization[] }> = {
  'acme.com': {
    people: [person('gus@acme.com', 1)],
    organizations: [outsideOrganization('org_out_gus', 'Gus’s workspace', 1, ['gus@acme.com'])],
  },
  'acmedev.org': {
    people: [person('priya.nair@acmedev.org', 1)],
    organizations: [outsideOrganization('org_out_labs', 'Side Project Labs', 3, ['priya.nair@acmedev.org'])],
  },
};

/** Who at these domains is in other organizations: members, and people who'd have to leave them to join. */
export const peopleElsewhereAt = (domains: string[], outsidePeople: Record<string, ProtoOutsidePerson[]>) => {
  const members = domains.flatMap(domain => MEMBERS_ELSEWHERE[domain]?.people ?? []);
  const others = domains.flatMap(domain => (outsidePeople[domain] ?? []).filter(entry => entry.otherOrganizations > 0));
  return {
    members,
    others,
    people: [...members, ...others],
    organizations: domains.flatMap(domain => [
      ...(MEMBERS_ELSEWHERE[domain]?.organizations ?? []),
      ...(OUTSIDE_ORGANIZATIONS[domain] ?? []),
    ]),
  };
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
  routing: 'rules',
  placementRules: [
    { id: 'rule_houston', kind: 'group', value: 'Houston Clinic Staff', organizationIds: ['org_sub_houston'] },
    {
      id: 'rule_regional',
      kind: 'group',
      value: 'Regional Managers',
      organizationIds: ['org_sub_houston', 'org_sub_el_paso'],
    },
    { id: 'rule_pets', kind: 'domain', value: 'meridianpets.com', organizationIds: ['org_sub_el_paso'] },
  ],
  fallbackOrganizationId: null,
  isParentMember: true,
  parentMembersSeeAll: false,
  // A mix for the Unmanaged users tab: one invited organization, one decided user, the rest undecided.
  organizationPlans: { org_out_supply: 'bring' },
  userPlans: { 'nadia.ross@meridianvet.com': 'migrate' },
  userDestinations: { 'nadia.ross@meridianvet.com': 'org_sub_houston' },
};

const ACME_RELATED: ProtoRelatedOrganization[] = [
  { id: 'org_acme_labs', name: 'Acme Labs', membersCount: 19, domain: 'acmelabs.io', ownsDomain: true },
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
    value: `${PARENT_NAME} owns meridianvet.com`,
    audience: 'Everyone with a meridianvet.com email',
  },
];

/** Domains the parent manages, which a sub-organization can't target. */
export const PARENT_DOMAINS = ['meridianvet.com', 'meridianpets.com'];

const okLog = (id: string, at: string, detail: string): ProtoTestLog => ({ id, at, detail, status: 'success' });

const scenario = (key: ScenarioKey): ProtoState => {
  switch (key) {
    case 'domain_clear':
      return {
        ...scenario('domain_elsewhere'),
        scenario: key,
        userEmail: 'you@acme.io',
        relatedOrganizations: [],
      };
    case 'domain_taken':
      return {
        ...scenario('domain_elsewhere'),
        scenario: key,
        userEmail: 'jordan.wu@acmedev.org',
        organizationName: 'Acme Design',
        relatedOrganizations: [
          {
            id: 'org_acme',
            name: 'Acme',
            membersCount: 24,
            domain: 'acmedev.org',
            ownsDomain: true,
            sso: true,
          },
        ],
        externalSignIn: {
          ownerName: 'Acme',
          enterpriseName: 'Acme Enterprise',
          domain: 'acmedev.org',
          members: ['jordan.wu@acmedev.org'],
          status: 'new',
        },
      };
    case 'personal':
      return { ...scenario('domain_elsewhere'), scenario: key, userEmail: 'you@gmail.com' };
    case 'domain_elsewhere':
      return {
        scenario: key,
        userEmail: 'you@acmedev.org',
        policies: [catchAll()],
        connections: [],
        access: DEFAULT_ACCESS,
        draft: null,
        organizationName: 'Acme',
        outsidePeople: OUTSIDE_PEOPLE,
        hierarchy: null,
        relatedOrganizations: ACME_RELATED,
        notice: null,
      };
    case 'join_request':
      return {
        ...scenario('configured'),
        scenario: key,
        organizationName: 'Acme Enterprise',
        hierarchy: {
          role: 'parent',
          parentName: 'Acme Enterprise',
          subOrganizations: [{ id: 'org_current', name: 'Acme', membersCount: 24 }],
          routing: 'invited',
          isParentMember: true,
          parentMembersSeeAll: false,
        },
        joinRequests: [
          {
            id: 'org_acme_design',
            name: 'Acme Design',
            membersCount: 7,
            people: ['jordan.wu@acmedev.org'],
            requestedBy: 'pat@acmedesign.studio',
          },
        ],
      };
    case 'child':
      return {
        ...scenario('domain_elsewhere'),
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
            exclusive: true,
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
        hierarchy: null,
        relatedOrganizations: ACME_RELATED,
        notice: null,
      };
  }
};

/* ------------------------------------------------------------------ store */

const STORAGE_KEY = 'clerk-access-prototype-v9';
const SERVER_STATE = scenario('domain_elsewhere');

let state: ProtoState | null = null;
const listeners = new Set<() => void>();

const isScenarioKey = (value: unknown): value is ScenarioKey =>
  typeof value === 'string' && (SCENARIO_KEYS as readonly string[]).includes(value);

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
        policyNotice: next === null ? null : previous.policyNotice,
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
          policyNotice: null,
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

  /*
   * From a policy: create a parent account and move only this policy's
   * domains, with the policy and its proof, up to it. The organization's other
   * policies stay with it, and the draft keeps its unsaved changes.
   */
  const moveDomainToEnterprise = useCallback(
    (name: string, draft: PolicyDraft) =>
      update(previous => {
        const moving = previous.policies.find(entry => entry.id === draft.policyId);
        const owned = draft.domains.filter(domain => draft.proofs[domain]?.ownership === 'verified');
        return {
          ...previous,
          organizationName: name,
          hierarchy: {
            role: 'parent',
            parentName: name,
            subOrganizations: [{ id: 'org_current', name: previous.organizationName, membersCount: 24 }],
            routing: 'invited',
            isParentMember: true,
            parentMembersSeeAll: false,
          },
          policies: withCatchAllLast([...(moving ? [moving] : []), catchAll()]),
          notice: owned.length
            ? `${name} is ready. Decide what happens to unmanaged users on the Members page.`
            : `${name} is ready.`,
          policyNotice: `${joinList(draft.domains)} now belongs to ${name}. Your changes are still here.`,
        };
      }),
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

  const updateHierarchy = useCallback(
    (patch: Partial<ProtoHierarchy>) =>
      update(previous =>
        previous.hierarchy ? { ...previous, hierarchy: { ...previous.hierarchy, ...patch } } : previous,
      ),
    [update],
  );

  /** Invites organizations outside the parent. Ones the member can bring in without asking join right away. */
  const inviteOrganizations = useCallback(
    (ids: string[]) =>
      update(previous => {
        const hierarchy = previous.hierarchy;
        if (!hierarchy) {
          return previous;
        }
        const chosen = outsideOfParent(previous).organizations.filter(entry => ids.includes(entry.id));
        const joining = chosen.filter(joinsRightAway);
        const organizationPlans = { ...hierarchy.organizationPlans };
        chosen.forEach(entry => {
          if (joinsRightAway(entry)) {
            delete organizationPlans[entry.id];
          } else {
            organizationPlans[entry.id] = 'bring';
          }
        });
        return {
          ...previous,
          hierarchy: {
            ...hierarchy,
            organizationPlans,
            subOrganizations: [
              ...hierarchy.subOrganizations,
              ...joining.map(entry => ({ id: entry.id, name: entry.name, membersCount: entry.membersCount })),
            ],
          },
          notice: joining.length
            ? `${joinList(joining.map(entry => entry.name))} joined ${hierarchy.parentName}.`
            : previous.notice,
        };
      }),
    [update],
  );

  const cancelInvitation = useCallback(
    (id: string) =>
      update(previous => {
        if (!previous.hierarchy) {
          return previous;
        }
        const organizationPlans = { ...previous.hierarchy.organizationPlans };
        delete organizationPlans[id];
        return { ...previous, hierarchy: { ...previous.hierarchy, organizationPlans } };
      }),
    [update],
  );

  /** Puts a parent on top of this organization. It keeps its ID and data; domain proof moves up so nobody verifies again. */
  const createParent = useCallback(
    (name: string, notice: string) =>
      update(previous => ({
        ...previous,
        organizationName: name,
        hierarchy: {
          role: 'parent',
          parentName: name,
          subOrganizations: [{ id: 'org_current', name: previous.organizationName, membersCount: 24 }],
          routing: 'invited',
          isParentMember: true,
          parentMembersSeeAll: false,
        },
        notice,
      })),
    [update],
  );

  const setExternalSignInStatus = useCallback(
    (status: ProtoExternalSignIn['status']) =>
      update(previous =>
        previous.externalSignIn ? { ...previous, externalSignIn: { ...previous.externalSignIn, status } } : previous,
      ),
    [update],
  );

  /** Accepting brings the organization under the parent; only a parent receives requests. */
  const resolveJoinRequest = useCallback(
    (id: string, accept: boolean) =>
      update(previous => {
        const request = previous.joinRequests?.find(entry => entry.id === id);
        if (!request) {
          return previous;
        }
        const hierarchy =
          accept && previous.hierarchy
            ? {
                ...previous.hierarchy,
                subOrganizations: [
                  ...previous.hierarchy.subOrganizations,
                  { id: request.id, name: request.name, membersCount: request.membersCount },
                ],
              }
            : previous.hierarchy;
        return {
          ...previous,
          hierarchy,
          joinRequests: previous.joinRequests?.filter(entry => entry.id !== id),
          relatedOrganizations: accept
            ? previous.relatedOrganizations.filter(entry => entry.id !== id)
            : previous.relatedOrganizations,
        };
      }),
    [update],
  );

  const dismissNotice = useCallback(() => update(previous => ({ ...previous, notice: null })), [update]);

  return {
    ...current,
    createParent,
    moveDomainToEnterprise,
    setExternalSignInStatus,
    resolveJoinRequest,
    dismissNotice,
    updateHierarchy,
    inviteOrganizations,
    cancelInvitation,
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
