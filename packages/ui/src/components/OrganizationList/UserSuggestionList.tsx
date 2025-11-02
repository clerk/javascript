import { useOrganizationList } from '@clerk/shared/react';
import type { OrganizationSuggestionResource } from '@clerk/shared/types';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { localizationKeys, Text } from '../../customizables';
import { populateCacheUpdateItem } from '../OrganizationSwitcher/utils';
import { PreviewListItem, PreviewListItemButton } from './shared';
import { organizationListParams } from './utils';

export const AcceptRejectInvitationButtons = (props: OrganizationSuggestionResource) => {
  const card = useCardState();
  const { userSuggestions } = useOrganizationList({
    userSuggestions: organizationListParams.userSuggestions,
  });

  const handleAccept = () => {
    return (
      card
        // When accepting a suggestion, a membership is not getting generated, so we don't need to revalidate memberships, only update suggestions in place
        .runAsync(props.accept)
        .then(updatedItem => userSuggestions?.setData?.(pages => populateCacheUpdateItem(updatedItem, pages)))
        .catch(err => handleError(err, [], card.setError))
    );
  };

  if (props.status === 'accepted') {
    return (
      <Text
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationList.suggestionsAcceptedLabel')}
      />
    );
  }

  return (
    <PreviewListItemButton
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationList.action__suggestionsAccept')}
    />
  );
};

export const SuggestionPreview = withCardStateProvider((props: OrganizationSuggestionResource) => {
  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      <AcceptRejectInvitationButtons {...props} />
    </PreviewListItem>
  );
});
