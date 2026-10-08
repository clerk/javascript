import { Button, descriptors, Text } from '../../customizables';
import { organizationSwitcherMessages } from './organization-switcher.messages';
import type { OrganizationSwitcherSuggestionViewProps } from './organization-switcher-invitations.types';

export const OrganizationSwitcherSuggestionButtonView = (props: OrganizationSwitcherSuggestionViewProps) => {
  if (props.isAccepted) {
    return (
      <Text
        colorScheme='secondary'
        localizationKey={organizationSwitcherMessages.organizations.suggestionAccepted}
      />
    );
  }

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonSmall'
      variant='outline'
      colorScheme='neutral'
      size='sm'
      isLoading={props.isLoading}
      onClick={() => void props.onAccept()}
      localizationKey={organizationSwitcherMessages.organizations.acceptSuggestion}
    />
  );
};
