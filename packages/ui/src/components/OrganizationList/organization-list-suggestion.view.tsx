import { Text } from '../../customizables';
import { organizationListMessages } from './organization-list.messages';
import type { OrganizationListSuggestionViewProps } from './organization-list.types';
import { PreviewListItem, PreviewListItemButton } from './shared';

export const SuggestionButtonView = (props: OrganizationListSuggestionViewProps) => {
  if (props.isAccepted) {
    return (
      <Text
        colorScheme='secondary'
        localizationKey={organizationListMessages.organizations.suggestionAccepted}
      />
    );
  }

  return (
    <PreviewListItemButton
      isLoading={props.isLoading}
      onClick={props.onAccept}
      localizationKey={organizationListMessages.organizations.acceptSuggestion}
    />
  );
};

export const SuggestionView = (props: OrganizationListSuggestionViewProps) => (
  <PreviewListItem organizationData={props.organizationData}>
    <SuggestionButtonView {...props} />
  </PreviewListItem>
);
