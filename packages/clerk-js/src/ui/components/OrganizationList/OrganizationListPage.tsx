import { useCoreClerk, useCoreOrganizationList, useOrganizationListContext } from '../../contexts';
import { Button, Col, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { Card, CardAlert, Footer, useCardState, withCardStateProvider } from '../../elements';
import { UserInvitationList } from './UserInvitationList';
import { UserMembershipList } from './UserMembershipList';
import { UserSuggestionList } from './UserSuggestionList';
import { organizationListParams } from './utils';

export const OrganizationListPage = withCardStateProvider(() => {
  const card = useCardState();
  const clerk = useCoreClerk();
  const { afterSkipUrl, createOrganizationMode, afterCreateOrganizationUrl, navigateCreateOrganization } =
    useOrganizationListContext();

  const { userMemberships, userInvitations, userSuggestions } = useCoreOrganizationList(organizationListParams);

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;

  const handleCreateOrganizationClicked = () => {
    if (createOrganizationMode === 'navigation') {
      return navigateCreateOrganization();
    }
    return clerk.openCreateOrganization({ afterCreateOrganizationUrl });
  };

  return (
    <Card
      sx={t => ({
        minHeight: t.sizes.$100,
        padding: `${t.space.$8} ${t.space.$none}`,
      })}
    >
      <CardAlert>{card.error}</CardAlert>
      {isLoading && (
        <Flex
          direction={'row'}
          align={'center'}
          justify={'center'}
          sx={t => ({
            height: '100%',
            minHeight: t.sizes.$120,
          })}
        >
          <Spinner
            size={'lg'}
            colorScheme={'primary'}
          />
        </Flex>
      )}

      {!isLoading && (
        <Col gap={2}>
          <UserMembershipList />
          <UserInvitationList />
          <UserSuggestionList />

          <Flex
            align='center'
            justify='between'
            sx={t => ({
              padding: `${t.space.$none} ${t.space.$8}`,
            })}
          >
            <Text
              variant='largeMedium'
              colorScheme='neutral'
              sx={t => ({
                fontWeight: t.fontWeights.$normal,
                minHeight: 'unset',
                height: t.space.$7,
                display: 'flex',
                alignItems: 'center',
              })}
              localizationKey={localizationKeys('organizationList.createOrganization')}
            />
            <Button
              block={false}
              colorScheme='neutral'
              size='sm'
              variant='ghost'
              textVariant='buttonExtraSmallBold'
              onClick={handleCreateOrganizationClicked}
              localizationKey={localizationKeys('organizationList.action__createOrganization')}
            />
          </Flex>
        </Col>
      )}

      {!isLoading && afterSkipUrl && (
        <Footer.Root>
          <Footer.Action
            elementId='organizationList'
            sx={t => ({
              padding: `${t.space.$none} ${t.space.$8}`,
            })}
          >
            <Footer.ActionLink
              localizationKey={localizationKeys('organizationList.actionLink')}
              to={clerk.buildUrlWithAuth(afterSkipUrl)}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      )}
    </Card>
  );
});
