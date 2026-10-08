import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';

import { InfiniteListSpinner } from '../../common';
import { Box, descriptors } from '../../customizables';
import { ArrowRight } from '../../icons';
import { common } from '../../styledSystem';
import { organizationSwitcherMessages } from './organization-switcher.messages';
import type { OrganizationSwitcherMembershipData } from './organization-switcher-membership.types';
import type { UserMembershipListProps } from './UserMembershipList';

export const OrganizationSwitcherMembershipView = (
  props: OrganizationSwitcherMembershipData & Pick<UserMembershipListProps, 'onPersonalWorkspaceClick'>,
) => {
  if (!props.isVisible) {
    return null;
  }

  return (
    <Box
      sx={t => ({
        maxHeight: `calc((4 * ${t.sizes.$17}) + 4px)`,
        overflowY: 'auto',
        '> button,div': { border: `0 solid ${t.colors.$borderAlpha100}` },
        '>:not([hidden])~:not([hidden])': {
          borderTopWidth: '1px',
          borderBottomWidth: '0',
        },
        ...common.unstyledScrollbar(t),
      })}
      role='group'
      aria-label={props.hidePersonal ? 'List of all organization memberships' : 'List of all accounts'}
    >
      {props.showPersonal && (
        <PreviewButton
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          elementId={descriptors.organizationSwitcherPreviewButton.setId('personal')}
          icon={ArrowRight}
          onClick={props.onPersonalWorkspaceClick}
        >
          <PersonalWorkspacePreview
            user={props.personalPreview}
            mainIdentifierVariant={'buttonLarge'}
            title={organizationSwitcherMessages.organizations.personal}
          />
        </PreviewButton>
      )}
      {props.organizations.map(organization => (
        <PreviewButton
          key={organization.id}
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          elementId={descriptors.organizationSwitcherPreviewButton.setId('organization')}
          icon={ArrowRight}
          onClick={organization.onClick}
          sx={t => ({ border: `0 solid ${t.colors.$borderAlpha100}` })}
        >
          <OrganizationPreview
            elementId='organizationSwitcherListedOrganization'
            organization={organization.preview}
          />
        </PreviewButton>
      ))}
      {(props.hasNextPage || props.isLoading) && <InfiniteListSpinner ref={props.paginationRef} />}
    </Box>
  );
};
