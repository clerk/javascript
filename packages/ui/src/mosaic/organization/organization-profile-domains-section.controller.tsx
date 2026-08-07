import { useOrganization, useSession } from '@clerk/shared/react';
import type { OrganizationDomainResource, OrganizationEnrollmentMode } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type {
  OrganizationProfileDomainsSectionAddVerifyContext,
  OrganizationProfileDomainsSectionAddVerifyEvent,
} from './organization-profile-domains-section-add-verify.machine';
import { organizationProfileDomainsSectionAddVerifyMachine } from './organization-profile-domains-section-add-verify.machine';
import type {
  OrganizationProfileDomainsSectionEnrollmentContext,
  OrganizationProfileDomainsSectionEnrollmentEvent,
} from './organization-profile-domains-section-enrollment.machine';
import { organizationProfileDomainsSectionEnrollmentMachine } from './organization-profile-domains-section-enrollment.machine';
import type {
  OrganizationProfileDomainsSectionRemoveContext,
  OrganizationProfileDomainsSectionRemoveEvent,
} from './organization-profile-domains-section-remove.machine';
import { organizationProfileDomainsSectionRemoveMachine } from './organization-profile-domains-section-remove.machine';

/** The paginated list of domains the section renders, plus its loading/pagination controls. */
export interface OrganizationProfileDomainsList {
  data: OrganizationDomainResource[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNext: () => void;
}

/** A selectable enrollment mode with its human-readable copy, derived from instance settings. */
export interface OrganizationProfileEnrollmentOption {
  value: OrganizationEnrollmentMode;
  label: string;
  description: string;
}

interface OrganizationProfileDomainsAddVerifyFlow {
  snapshot: Snapshot<OrganizationProfileDomainsSectionAddVerifyContext>;
  send: (event: OrganizationProfileDomainsSectionAddVerifyEvent) => void;
}

interface OrganizationProfileDomainsEnrollmentFlow {
  snapshot: Snapshot<OrganizationProfileDomainsSectionEnrollmentContext>;
  send: (event: OrganizationProfileDomainsSectionEnrollmentEvent) => void;
  canSubmit: boolean;
}

interface OrganizationProfileDomainsRemoveFlow {
  snapshot: Snapshot<OrganizationProfileDomainsSectionRemoveContext>;
  send: (event: OrganizationProfileDomainsSectionRemoveEvent) => void;
}

type OrganizationProfileDomainsSectionController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      /** Whether the current user may add / edit / verify / remove domains. */
      canManage: boolean;
      list: OrganizationProfileDomainsList;
      enrollmentOptions: OrganizationProfileEnrollmentOption[];
      addVerify: OrganizationProfileDomainsAddVerifyFlow;
      enrollment: OrganizationProfileDomainsEnrollmentFlow;
      remove: OrganizationProfileDomainsRemoveFlow;
    };

// The three selectable modes, in a stable display order. `enterprise_sso` is intentionally
// excluded — it is not user-selectable, mirroring the legacy form's buildEnrollmentOptions.
const ENROLLMENT_OPTION_COPY: Array<{ value: OrganizationEnrollmentMode; label: string; description: string }> = [
  {
    value: 'manual_invitation',
    label: 'No automatic enrollment',
    description: 'Users can only be invited manually to the organization.',
  },
  {
    value: 'automatic_invitation',
    label: 'Automatic invitations',
    description: 'Users are automatically invited to join the organization when they sign up and can join anytime.',
  },
  {
    value: 'automatic_suggestion',
    label: 'Automatic suggestions',
    description:
      'Users receive a suggestion to request to join, but must be approved by an admin before they can join the organization.',
  },
];

function buildEnrollmentOptions(enrollmentModes: OrganizationEnrollmentMode[]): OrganizationProfileEnrollmentOption[] {
  return ENROLLMENT_OPTION_COPY.filter(option => enrollmentModes.includes(option.value));
}

export function useOrganizationProfileDomainsSectionController(): OrganizationProfileDomainsSectionController {
  const { isLoaded: isOrganizationLoaded, organization, domains } = useOrganization({ domains: { infinite: true } });
  const { isLoaded: isSessionLoaded, session } = useSession();
  const settingsDomains = useMosaicEnvironment()?.organizationSettings?.domains;

  // Shared mutation, keyed by domainId. Resolving the resource via getDomain works even for a
  // freshly-created domain not yet in the list, mirroring the legacy screens.
  const updateEnrollmentMode = async ({
    domainId,
    enrollmentMode,
    deletePending,
  }: {
    domainId: string;
    enrollmentMode: OrganizationEnrollmentMode;
    deletePending: boolean;
  }) => {
    const domain = await organization?.getDomain({ domainId });
    await domain?.updateEnrollmentMode({ enrollmentMode, deletePending });
    void domains?.revalidate?.();
  };

  const [addVerifySnapshot, sendAddVerify] = useMachine(organizationProfileDomainsSectionAddVerifyMachine, {
    context: {
      createDomain: async name => {
        const domain = await organization?.createDomain(name);
        void domains?.revalidate?.();
        return {
          id: domain?.id ?? '',
          name: domain?.name ?? name,
          verified: domain?.verification?.status === 'verified',
        };
      },
      prepareVerification: async ({ domainId, affiliationEmailAddress }) => {
        const domain = await organization?.getDomain({ domainId });
        await domain?.prepareAffiliationVerification({ affiliationEmailAddress });
      },
      attemptVerification: async ({ domainId, code }) => {
        const domain = await organization?.getDomain({ domainId });
        const result = await domain?.attemptAffiliationVerification({ code });
        void domains?.revalidate?.();
        return { verified: result?.verification?.status === 'verified' };
      },
      updateEnrollmentMode,
    },
  });

  const [enrollmentSnapshot, sendEnrollment, enrollmentActor] = useMachine(
    organizationProfileDomainsSectionEnrollmentMachine,
    {
      context: { updateEnrollmentMode },
    },
  );

  const [removeSnapshot, sendRemove] = useMachine(organizationProfileDomainsSectionRemoveMachine, {
    context: {
      // TODO: wrap deletion in step-up reverification to match the classic RemoveDomainForm,
      // which deletes through `useReverification(deleteResource)`. Today removal proceeds
      // without a reverification prompt even when the instance requires one.
      deleteDomain: async ({ domainId }) => {
        const domain = await organization?.getDomain({ domainId });
        await domain?.delete();
        // Fire-and-forget: a stale list must not make a successful removal look like a failure.
        void domains?.revalidate?.();
      },
    },
  });

  // Both the organization and the session must resolve before the permission check;
  // a not-yet-known session must never collapse into a definitive 'hidden'.
  if (!isOrganizationLoaded || !isSessionLoaded) {
    return { status: 'loading' };
  }

  const canRead = session?.checkAuthorization({ permission: 'org:sys_domains:read' }) ?? false;
  const canManage = session?.checkAuthorization({ permission: 'org:sys_domains:manage' }) ?? false;

  if (!organization || !settingsDomains?.enabled || !canRead) {
    return { status: 'hidden' };
  }

  const data = domains?.data ?? [];
  const isLoading = domains?.isLoading ?? false;

  // A user who cannot manage has nothing to do in an empty section, so hide it — but wait
  // for the first page before deciding, so we don't hide then re-show once domains land.
  if (!canManage) {
    if (isLoading && data.length === 0) {
      return { status: 'loading' };
    }
    if (data.length === 0) {
      return { status: 'hidden' };
    }
  }

  return {
    status: 'ready',
    canManage,
    list: {
      data,
      isLoading,
      hasNextPage: domains?.hasNextPage ?? false,
      fetchNext: () => void domains?.fetchNext?.(),
    },
    enrollmentOptions: buildEnrollmentOptions(settingsDomains.enrollmentModes),
    addVerify: { snapshot: addVerifySnapshot, send: sendAddVerify },
    enrollment: {
      snapshot: enrollmentSnapshot,
      send: sendEnrollment,
      canSubmit: enrollmentActor.can({ type: 'SUBMIT' }),
    },
    remove: { snapshot: removeSnapshot, send: sendRemove },
  };
}
