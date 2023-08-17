import { useCoreOrganizationList } from '../../contexts';
import { Button, Col, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { Card, CardAlert, Footer, useCardState, withCardStateProvider } from '../../elements';
import { UserInvitationList } from './UserInvitationList';
import { UserMembershipList } from './UserMembershipList';
import { UserSuggestionList } from './UserSuggestionList';
import { organizationListParams } from './utils';

export const OrganizationListPage = withCardStateProvider(() => {
  const card = useCardState();

  const { userMemberships, userInvitations, userSuggestions } = useCoreOrganizationList(organizationListParams);

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;

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
            >
              Create an organization
            </Text>
            <Button
              block={false}
              colorScheme='neutral'
              size='sm'
              variant='ghost'
              textVariant='buttonExtraSmallBold'
            >
              Create
            </Button>
          </Flex>
        </Col>
      )}

      <Footer.Root>
        <Footer.Action
          elementId='organizationList'
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$8}`,
          })}
        >
          <Footer.ActionLink
            localizationKey={localizationKeys('signIn.start.actionLink')}
            // to={clerk.buildUrlWithAuth(signUpUrl)}
          />
        </Footer.Action>
        <Footer.Links />
      </Footer.Root>
    </Card>
  );
});
