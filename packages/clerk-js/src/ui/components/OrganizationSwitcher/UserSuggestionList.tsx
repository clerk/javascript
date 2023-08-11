import type { OrganizationSuggestionResource } from '@clerk/types';

import { useCoreOrganizationList } from '../../contexts';
import { Box, Button, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { OrganizationPreview, useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { common } from '../../styledSystem';
import { handleError } from '../../utils';

export const UserSuggestionList = () => {
  const { userSuggestions } = useCoreOrganizationList({
    userSuggestions: {
      infinite: true,
    },
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
    <Flex
      direction='col'
      elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActions}
    >
      <Text
        variant='smallRegular'
        sx={t => ({
          minHeight: 'unset',
          height: t.space.$12,
          padding: `${t.space.$3} ${t.space.$6}`,
          display: 'flex',
          alignItems: 'center',
        })}
        // Handle plurals
        localizationKey={localizationKeys(
          (userSuggestions.count ?? 0) > 1
            ? 'organizationSwitcher.suggestionCountLabel_many'
            : 'organizationSwitcher.suggestionCountLabel_single',
          {
            count: userSuggestions.count,
          },
        )}
      />
      <Box
        sx={t => ({
          maxHeight: `calc(4 * ${t.sizes.$12})`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {userSuggestions?.data?.map(inv => {
          return (
            <SuggestionPreview
              key={inv.id}
              {...inv}
            />
          );
        })}

        {(userSuggestions.hasNextPage || userSuggestions.isFetching) && (
          <Box
            ref={ref}
            sx={t => ({
              width: '100%',
              height: t.space.$12,
              position: 'relative',
            })}
          >
            <Box
              sx={{
                margin: 'auto',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateY(-50%) translateX(-50%)',
              }}
            >
              <Spinner
                size='md'
                colorScheme='primary'
              />
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

const AcceptRejectSuggestionButtons = (props: OrganizationSuggestionResource) => {
  const card = useCardState();
  const { userSuggestions } = useCoreOrganizationList({
    userSuggestions: {
      infinite: true,
    },
  });

  const mutateSwrState = () => {
    (userSuggestions as any)?.unstable__mutate?.();
  };

  const handleAccept = () => {
    return card
      .runAsync(props.accept())
      .then(mutateSwrState)
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonExtraSmallBold'
      variant='solid'
      size='sm'
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationSwitcher.suggestionsAccept')}
    />
  );
};

const SuggestionPreview = withCardStateProvider((props: OrganizationSuggestionResource) => {
  return (
    <Flex
      align='center'
      gap={2}
      sx={t => ({
        minHeight: 'unset',
        height: t.space.$12,
        justifyContent: 'space-between',
        padding: `0 ${t.space.$6}`,
      })}
    >
      <OrganizationPreview
        elementId='organizationSwitcher'
        avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
        organization={props.publicOrganizationData}
        size='sm'
      />

      <AcceptRejectSuggestionButtons {...props} />
    </Flex>
  );
});
