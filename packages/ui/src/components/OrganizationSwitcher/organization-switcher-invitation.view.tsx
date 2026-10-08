import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';

import { Button, descriptors } from '../../customizables';
import { ArrowRight } from '../../icons';
import { organizationSwitcherMessages } from './organization-switcher.messages';
import type { OrganizationSwitcherInvitationViewProps } from './organization-switcher-invitations.types';
import { OrganizationSwitcherInvitationPreview } from './organization-switcher-invitations.view';

export const OrganizationSwitcherInvitationView = (props: OrganizationSwitcherInvitationViewProps) => {
  if (props.isHidden) {
    return null;
  }

  if (props.isAccepted) {
    return (
      <PreviewButton
        elementDescriptor={descriptors.organizationSwitcherPreviewButton}
        icon={ArrowRight}
        onClick={props.onAcceptedClick}
      >
        <OrganizationPreview
          elementId='organizationSwitcherListedOrganization'
          organization={props.organizationData}
          sx={t => ({
            color: t.colors.$colorMutedForeground,
            ':hover': { color: t.colors.$colorMutedForeground },
          })}
        />
      </PreviewButton>
    );
  }

  return (
    <OrganizationSwitcherInvitationPreview organizationData={props.organizationData}>
      <Button
        elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
        textVariant='buttonSmall'
        variant='outline'
        colorScheme='neutral'
        size='xs'
        isLoading={props.isLoading}
        onClick={() => void props.onAccept()}
        localizationKey={organizationSwitcherMessages.organizations.acceptInvitation}
      />
    </OrganizationSwitcherInvitationPreview>
  );
};
