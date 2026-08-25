import React, { createContext, useContext, useReducer } from 'react';

import type { LocalizationKey } from '../../../customizables';

/*
 * Prototype-only state for the Access & onboarding page. The model here
 * deliberately diverges from OrganizationDomainResource: enrollment and
 * authentication are independent axes (enterprise_sso is NOT an enrollment
 * mode), and affiliation/ownership are proof levels that gate which options a
 * self-serve admin can enable. Nothing persists — state is local to the page.
 */

export type ProtoEnrollment = 'invitation_only' | 'request_access' | 'join_automatically' | 'directory_synced';

export type ProtoProvider = 'saml_okta' | 'saml_microsoft' | 'saml_google' | 'saml_custom';

export type ProtoAuthentication =
  | { mode: 'default' }
  | { mode: 'sso'; provider: ProtoProvider; status: 'setting_up' | 'active' };

export type ProtoOwnership = 'unverified' | 'verified' | 'waived';

export type ProtoNonDirectoryFallback = 'block' | 'request_access';

export type ProtoDomain = {
  id: string;
  name: string;
  enrollment: ProtoEnrollment;
  authentication: ProtoAuthentication;
  affiliationVerified: boolean;
  ownership: ProtoOwnership;
  txtRecordName: string;
  txtRecordValue: string;
  /** Restrict-only extras the C2 can demand on top of the app baseline. */
  twoStepRequired: boolean;
  sessionLifetimeHours: number;
  /** Only read when enrollment is directory_synced. */
  nonDirectoryFallback: ProtoNonDirectoryFallback;
  /**
   * Set by the C1, never by the C2 (crosses the org boundary into the
   * application's tenancy model) — surfaces here as a read-only fact.
   */
  membershipRequired?: boolean;
};

/*
 * Mirrors the dashboard prototype's application defaults: a rule can require
 * re-verification more often than the application setting, never less.
 */
export const APP_SESSION_LIFETIME_HOURS = 12;
export const SESSION_LIFETIME_OPTIONS = [1, 8, 12] as const;
export const formatSessionLifetime = (hours: number) => (hours === 1 ? '1 hour' : `${hours} hours`);

export const NON_DIRECTORY_FALLBACK_LABELS: Record<ProtoNonDirectoryFallback, { label: string; description: string }> =
  {
    block: {
      label: 'Block them',
      description: 'The directory is the only way in. They see an error telling them to contact an admin.',
    },
    request_access: {
      label: 'Let them request access',
      description: 'An admin approves them one by one. Useful when the directory only covers part of the company.',
    },
  };

/** The recommendation tracks who is vouching, same as the dashboard wizard. */
export const recommendedEnrollmentFor = (signInMode: 'default' | 'sso'): ProtoEnrollment =>
  signInMode === 'sso' ? 'join_automatically' : 'request_access';

export const ENROLLMENT_LABELS: Record<ProtoEnrollment, { label: string; description: string }> = {
  join_automatically: {
    label: 'Join automatically',
    description: 'Anyone who signs up with an email at this domain becomes a member right away.',
  },
  request_access: {
    label: 'Request access',
    description: 'People with an email at this domain can ask to join. An admin approves each request.',
  },
  invitation_only: {
    label: 'Invitation only',
    description: 'Nobody joins on their own. Admins invite each person.',
  },
  directory_synced: {
    label: 'Sync from a directory',
    description: 'Members are created and removed by the directory. Nobody joins on their own.',
  },
};

export const PROVIDER_LABELS: Record<ProtoProvider, { label: string; iconId: string }> = {
  saml_okta: { label: 'Okta Workforce', iconId: 'okta' },
  saml_microsoft: { label: 'Microsoft Entra', iconId: 'microsoft' },
  saml_google: { label: 'Google Workspace', iconId: 'google' },
  saml_custom: { label: 'Custom SAML', iconId: 'saml' },
};

const txtRecordFor = (name: string) => ({
  txtRecordName: `_clerk_domain_verification.${name}`,
  txtRecordValue: `clerk-domain-verification=${name.replace(/[^a-z0-9]/gi, '').slice(0, 6)}8f3k2m`,
});

const SEED_DOMAINS: ProtoDomain[] = [
  {
    id: 'proto_dom_acme',
    name: 'acme.com',
    enrollment: 'join_automatically',
    authentication: { mode: 'sso', provider: 'saml_okta', status: 'active' },
    affiliationVerified: true,
    ownership: 'verified',
    twoStepRequired: false,
    sessionLifetimeHours: APP_SESSION_LIFETIME_HOURS,
    nonDirectoryFallback: 'block',
    // Seeded so the read-only membership fact has something to show.
    membershipRequired: true,
    ...txtRecordFor('acme.com'),
  },
  {
    id: 'proto_dom_contractors',
    name: 'contractors.acme.com',
    enrollment: 'request_access',
    authentication: { mode: 'default' },
    affiliationVerified: true,
    ownership: 'unverified',
    twoStepRequired: false,
    sessionLifetimeHours: APP_SESSION_LIFETIME_HOURS,
    nonDirectoryFallback: 'block',
    ...txtRecordFor('contractors.acme.com'),
  },
];

type ProtoAction =
  | { type: 'addDomain'; name: string }
  | { type: 'markAffiliationVerified'; id: string }
  | { type: 'markOwnershipVerified'; id: string }
  | { type: 'setEnrollment'; id: string; enrollment: ProtoEnrollment }
  | {
      type: 'configureRule';
      id: string;
      enrollment: ProtoEnrollment;
      twoStepRequired: boolean;
      sessionLifetimeHours: number;
      nonDirectoryFallback: ProtoNonDirectoryFallback;
      ssoProvider: ProtoProvider | null;
    }
  | { type: 'setSsoProvider'; id: string; provider: ProtoProvider }
  | { type: 'completeSsoSetup'; id: string }
  | { type: 'simulateFirstSignIn'; id: string }
  | { type: 'removeDomain'; id: string };

const patch = (domains: ProtoDomain[], id: string, changes: Partial<ProtoDomain>) =>
  domains.map(domain => (domain.id === id ? { ...domain, ...changes } : domain));

const reducer = (domains: ProtoDomain[], action: ProtoAction): ProtoDomain[] => {
  switch (action.type) {
    case 'addDomain': {
      const name = action.name.trim().toLowerCase();
      return [
        ...domains,
        {
          id: `proto_dom_${name.replace(/[^a-z0-9]/g, '_')}`,
          name,
          enrollment: 'invitation_only',
          authentication: { mode: 'default' },
          affiliationVerified: false,
          ownership: 'unverified',
          twoStepRequired: false,
          sessionLifetimeHours: APP_SESSION_LIFETIME_HOURS,
          nonDirectoryFallback: 'block',
          ...txtRecordFor(name),
        },
      ];
    }
    case 'markAffiliationVerified':
      return patch(domains, action.id, { affiliationVerified: true });
    case 'markOwnershipVerified':
      return patch(domains, action.id, { ownership: 'verified' });
    case 'setEnrollment':
      return patch(domains, action.id, { enrollment: action.enrollment });
    case 'configureRule':
      return patch(domains, action.id, {
        enrollment: action.enrollment,
        twoStepRequired: action.twoStepRequired,
        sessionLifetimeHours: action.sessionLifetimeHours,
        nonDirectoryFallback: action.nonDirectoryFallback,
        authentication: action.ssoProvider
          ? { mode: 'sso', provider: action.ssoProvider, status: 'setting_up' }
          : { mode: 'default' },
      });
    case 'setSsoProvider':
      return patch(domains, action.id, {
        authentication: { mode: 'sso', provider: action.provider, status: 'setting_up' },
      });
    case 'completeSsoSetup':
      return domains.map(domain =>
        domain.id === action.id && domain.authentication.mode === 'sso'
          ? { ...domain, authentication: { ...domain.authentication, status: 'setting_up' as const } }
          : domain,
      );
    case 'simulateFirstSignIn':
      return domains.map(domain =>
        domain.id === action.id && domain.authentication.mode === 'sso'
          ? { ...domain, authentication: { ...domain.authentication, status: 'active' as const } }
          : domain,
      );
    case 'removeDomain':
      return domains.filter(domain => domain.id !== action.id);
    default:
      return domains;
  }
};

type AccessOnboardingContextValue = {
  domains: ProtoDomain[];
  dispatch: React.Dispatch<ProtoAction>;
};

const AccessOnboardingContext = createContext<AccessOnboardingContextValue | null>(null);

export const AccessOnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [domains, dispatch] = useReducer(reducer, SEED_DOMAINS);
  return <AccessOnboardingContext.Provider value={{ domains, dispatch }}>{children}</AccessOnboardingContext.Provider>;
};

export const useAccessOnboarding = (): AccessOnboardingContextValue => {
  const context = useContext(AccessOnboardingContext);
  if (!context) {
    throw new Error('Clerk: useAccessOnboarding called outside AccessOnboardingProvider.');
  }
  return context;
};

export const hasOwnership = (domain: ProtoDomain) => domain.ownership === 'verified' || domain.ownership === 'waived';

// Fakes network latency so buttons show their real loading states.
export const simulateRequest = () => new Promise<void>(resolve => setTimeout(resolve, 400));

// Prototype-only: raw strings render fine at runtime (makeLocalizable's string branch).
export const protoKey = (value: string) => value as unknown as LocalizationKey;
