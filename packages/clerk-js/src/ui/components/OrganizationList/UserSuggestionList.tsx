import type {
  ClerkPaginatedResponse,
  OrganizationSuggestionResource,
  UserOrganizationInvitationResource,
} from '@clerk/types';

import { useCoreOrganizationList } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { handleError } from '../../utils';
import { organizationListParams } from './utils';
import {
  PreviewList,
  PreviewListDivider,
  PreviewListItem,
  PreviewListItemButton,
  PreviewListItems,
  PreviewListSpinner,
  PreviewListSubtitle,
} from './shared';

export const UserSuggestionList = () => {
  const { userSuggestions } = useCoreOrganizationList({
    userSuggestions: organizationListParams.userSuggestions,
  });

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        userSuggestions.fetchNext?.();
      }
    },
  });

  if ((userSuggestions.count ?? 0) === 0) {
    return null;
  }

  return (
    <PreviewList elementId='suggestions'>
      <PreviewListSubtitle
        localizationKey={localizationKeys(
          (userSuggestions.count ?? 0) > 1
            ? 'organizationList.suggestionCountLabel_many'
            : 'organizationList.suggestionCountLabel_single',
          {
            count: userSuggestions.count,
          },
        )}
      />
      <PreviewListItems>
        {userSuggestions?.data?.map(inv => {
          return (
            <SuggestionPreview
              key={inv.id}
              {...inv}
            />
          );
        })}

        {userSuggestions.hasNextPage && <PreviewListSpinner ref={ref} />}
      </PreviewListItems>
      <PreviewListDivider />
    </PreviewList>
  );
};

const AcceptRejectInvitationButtons = (props: OrganizationSuggestionResource) => {
  const card = useCardState();
  const { userSuggestions } = useCoreOrganizationList({
    userSuggestions: organizationListParams.userSuggestions,
  });

  const handleAccept = () => {
    return card
      .runAsync(props.accept)
      .then(result => {
        (userSuggestions as any)?.unstable__mutate?.(result, {
          populateCache: (
            updatedInvitation: UserOrganizationInvitationResource,
            invitationInfinitePages: ClerkPaginatedResponse<UserOrganizationInvitationResource>[],
          ) => {
            const prevTotalCount = invitationInfinitePages[invitationInfinitePages.length - 1].total_count;

            return invitationInfinitePages.map(item => {
              const newData = item.data.filter(obj => {
                return obj.id !== updatedInvitation.id;
              });
              return { ...item, data: newData, total_count: prevTotalCount - 1 };
            });
          },
          // Since `accept` gives back the updated information,
          // we don't need to revalidate here.
          revalidate: false,
        });
      })
      .catch(err => handleError(err, [], card.setError));
  };

  if (props.status === 'accepted') {
    return (
      <Text
        variant='smallRegular'
        colorScheme='neutral'
      >
        Pending approval
      </Text>
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

const SuggestionPreview = withCardStateProvider((props: OrganizationSuggestionResource) => {
  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      <AcceptRejectInvitationButtons {...props} />
    </PreviewListItem>
  );
});
