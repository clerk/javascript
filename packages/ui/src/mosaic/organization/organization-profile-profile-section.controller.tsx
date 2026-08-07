import { useOrganization, useSession } from '@clerk/shared/react';

import { isDefaultImage } from '../../utils/image';
import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type {
  OrganizationProfileProfileSectionDetailsContext,
  OrganizationProfileProfileSectionDetailsEvent,
} from './organization-profile-profile-section-details.machine';
import { organizationProfileProfileSectionDetailsMachine } from './organization-profile-profile-section-details.machine';
import type {
  OrganizationProfileProfileSectionLogoContext,
  OrganizationProfileProfileSectionLogoEvent,
} from './organization-profile-profile-section-logo.machine';
import { organizationProfileProfileSectionLogoMachine } from './organization-profile-profile-section-logo.machine';

interface OrganizationProfileDetailsFlow {
  snapshot: Snapshot<OrganizationProfileProfileSectionDetailsContext>;
  send: (event: OrganizationProfileProfileSectionDetailsEvent) => void;
  canSubmit: boolean;
}

interface OrganizationProfileLogoFlow {
  snapshot: Snapshot<OrganizationProfileProfileSectionLogoContext>;
  send: (event: OrganizationProfileProfileSectionLogoEvent) => void;
  canRemove: boolean;
}

type OrganizationProfileProfileSectionController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      details: OrganizationProfileDetailsFlow;
      logo: OrganizationProfileLogoFlow;
    };

export function useOrganizationProfileProfileSectionController(): OrganizationProfileProfileSectionController {
  const { isLoaded: isOrganizationLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const slugEnabled = !(useMosaicEnvironment()?.organizationSettings?.slug?.disabled ?? false);

  const [detailsSnapshot, sendDetails, detailsActor] = useMachine(organizationProfileProfileSectionDetailsMachine, {
    context: {
      committedName: organization?.name ?? '',
      committedSlug: organization?.slug ?? '',
      slugEnabled,
      updateOrganization: async params => {
        await organization?.update(params);
      },
    },
  });

  const [logoSnapshot, sendLogo] = useMachine(organizationProfileProfileSectionLogoMachine, {
    context: {
      setLogo: async file => {
        await organization?.setLogo({ file });
      },
    },
  });

  // The permission check needs both the organization and the session resolved. Treat either still
  // loading as 'loading' so a not-yet-known session is never collapsed into a definitive 'hidden'.
  if (!isOrganizationLoaded || !isSessionLoaded) {
    return { status: 'loading' };
  }

  const canManage = session?.checkAuthorization({ permission: 'org:sys_profile:manage' }) ?? false;
  if (!organization || !canManage) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    details: {
      snapshot: detailsSnapshot,
      send: sendDetails,
      canSubmit: detailsActor.can({ type: 'SUBMIT' }),
    },
    logo: {
      snapshot: logoSnapshot,
      send: sendLogo,
      // Mirror legacy: removing is only offered when the org has a non-default logo.
      canRemove: !isDefaultImage(organization.imageUrl),
    },
  };
}
