import {
  OrganizationPreviewButton,
  OrganizationPreviewListItem,
  OrganizationPreviewListItemButton,
  sharedMainIdentifierSx,
} from '@/ui/common/organizations/OrganizationPreview';
import { descriptors, localizationKeys, Text } from '@/ui/customizables';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';

import type {
  InvitationPreviewViewProps,
  MembershipPreviewViewProps,
  SuggestionPreviewViewProps,
} from './choose-organization-screen.types';

export const MembershipPreviewView = ({ organization, onClick }: MembershipPreviewViewProps) => (
  <OrganizationPreviewButton
    elementDescriptor={descriptors.taskChooseOrganizationPreviewButton}
    onClick={onClick}
  >
    <OrganizationPreview
      elementId='taskChooseOrganization'
      mainIdentifierSx={sharedMainIdentifierSx}
      organization={organization}
    />
  </OrganizationPreviewButton>
);

export const InvitationPreviewView = ({ organization, onAccept, isLoading }: InvitationPreviewViewProps) => (
  <OrganizationPreviewListItem
    organizationData={organization}
    elementId='taskChooseOrganization'
    elementDescriptor={descriptors.taskChooseOrganizationPreviewItem}
  >
    <OrganizationPreviewListItemButton
      isLoading={isLoading}
      onClick={() => void onAccept()}
      localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.action__invitationAccept')}
    />
  </OrganizationPreviewListItem>
);

export const SuggestionPreviewView = ({ organization, status, onAccept, isLoading }: SuggestionPreviewViewProps) => (
  <OrganizationPreviewListItem
    organizationData={organization}
    elementId='taskChooseOrganization'
    elementDescriptor={descriptors.taskChooseOrganizationPreviewItem}
  >
    {status === 'accepted' ? (
      <Text
        colorScheme='secondary'
        localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.suggestionsAcceptedLabel')}
      />
    ) : (
      <OrganizationPreviewListItemButton
        onClick={() => void onAccept()}
        isLoading={isLoading}
        localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.action__suggestionsAccept')}
      />
    )}
  </OrganizationPreviewListItem>
);
