import { useOrganizationList } from '@clerk/shared/react';
import type { OrganizationSuggestionResource } from '@clerk/types';

import { localizationKeys, Text } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { handleError } from '../../utils';
import { populateCacheUpdateItem } from '../OrganizationSwitcher/utils';
import { PreviewListItem, PreviewListItemButton } from './shared';
import { organizationListParams } from './utils';

export const AcceptRejectInvitationButtons = (props: OrganizationSuggestionResource) => {
  const card = useCardState();
  const { userSuggestions, userMemberships } = useOrganizationList({
    userSuggestions: organizationListParams.userSuggestions,
    userMemberships: organizationListParams.userMemberships,
  });

  const handleAccept = () => {
    return card
      .runAsync(props.accept)
      .then(updatedItem => {
        userMemberships?.revalidate();
        userSuggestions?.setData?.(pages => populateCacheUpdateItem(updatedItem, pages));
      })
      .catch(err => handleError(err, [], card.setError));
  };

  if (props.status === 'accepted') {
    return (
      <Text
        colorScheme='neutral'
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
