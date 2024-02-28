import { useState } from 'react';

import { useCoreOrganizationList, useEnvironment, useOrganizationListContext } from '../../contexts';
import { Box, Button, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { Card, CardAlert, Divider, Header, useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { CreateOrganizationForm } from '../CreateOrganization/CreateOrganizationForm';
import { PreviewListItems, PreviewListSpinner } from './shared';
import { InvitationPreview } from './UserInvitationList';
import { MembershipPreview, PersonalAccountPreview } from './UserMembershipList';
import { SuggestionPreview } from './UserSuggestionList';
import { organizationListParams } from './utils';

const useCoreOrganizationListInView = () => {
  const { userMemberships, userInvitations, userSuggestions } = useCoreOrganizationList(organizationListParams);

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!inView) {
        return;
      }
      if (userMemberships.hasNextPage) {
        userMemberships.fetchNext?.();
      } else if (userInvitations.hasNextPage) {
        userInvitations.fetchNext?.();
      } else {
        userSuggestions.fetchNext?.();
      }
    },
  });

  return {
    userMemberships,
    userInvitations,
    userSuggestions,
    ref,
  };
};

export const OrganizationListPage = withCardStateProvider(() => {
  const card = useCardState();
  const { userMemberships, userSuggestions, userInvitations } = useCoreOrganizationListInView();
  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasAnyData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  const { hidePersonal } = useOrganizationListContext();

  return (
    <Card
      sx={t => ({
        padding: `${t.space.$8} ${t.space.$none}`,
      })}
      insideAppLogoSx={t => ({
        padding: `${t.space.$none} ${t.space.$8}`,
      })}
      gap={6}
    >
      <CardAlert>{card.error}</CardAlert>
      {isLoading && (
        <Flex
          direction={'row'}
          align={'center'}
          justify={'center'}
          sx={t => ({
            height: '100%',
            minHeight: t.sizes.$60,
          })}
        >
          <Spinner
            size={'lg'}
            colorScheme={'primary'}
          />
        </Flex>
      )}

      {!isLoading && <OrganizationListFlows showListInitially={!(hidePersonal && !hasAnyData)} />}
    </Card>
  );
});

export const OrgListCreateOrganizationPage = withCardStateProvider(
  (props: {
    setCreateOrganizationFlow: React.Dispatch<React.SetStateAction<boolean>>;
    isCreateOrganizationFlow: boolean;
    showListInitially: boolean;
  }) => {
    const { showListInitially, isCreateOrganizationFlow, setCreateOrganizationFlow } = props;
    const environment = useEnvironment();
    const { navigateAfterSelectOrganization, skipInvitationScreen } = useOrganizationListContext();
    return (
      <>
        <Box
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$8}`,
          })}
        >
          <CreateOrganizationForm
            flow='organizationList'
            skipInvitationScreen={skipInvitationScreen}
            startPage={{
              headerTitle: localizationKeys('createOrganization.title'),
              headerSubtitle: localizationKeys('organizationList.subtitle', {
                applicationName: environment.displayConfig.applicationName,
              }),
            }}
            navigateAfterCreateOrganization={org =>
              navigateAfterSelectOrganization(org).then(() => setCreateOrganizationFlow(false))
            }
            onCancel={
              showListInitially && isCreateOrganizationFlow ? () => setCreateOrganizationFlow(false) : undefined
            }
          />
        </Box>
      </>
    );
  },
);

const OrganizationListFlows = ({ showListInitially }: { showListInitially: boolean }) => {
  const [isCreateOrganizationFlow, setCreateOrganizationFlow] = useState(!showListInitially);
  return (
    <>
      {!isCreateOrganizationFlow && (
        <OrganizationListPageList onCreateOrganizationClick={() => setCreateOrganizationFlow(true)} />
      )}

      {isCreateOrganizationFlow && (
        <OrgListCreateOrganizationPage
          {...{
            isCreateOrganizationFlow,
            setCreateOrganizationFlow,
            showListInitially,
          }}
        />
      )}
    </>
  );
};

const OrganizationListPageList = withCardStateProvider((props: { onCreateOrganizationClick: () => void }) => {
  const card = useCardState();
  const environment = useEnvironment();

  const { ref, userMemberships, userSuggestions, userInvitations } = useCoreOrganizationListInView();
  const { hidePersonal } = useOrganizationListContext();

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasNextPage = userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage;

  const handleCreateOrganizationClicked = () => {
    props.onCreateOrganizationClick();
  };
  return (
    <>
      <CardAlert>{card.error}</CardAlert>
      <Header.Root
        sx={t => ({
          padding: `${t.space.$none} ${t.space.$8}`,
        })}
      >
        <Header.Title
          localizationKey={localizationKeys(
            !hidePersonal ? 'organizationList.title' : 'organizationList.titleWithoutPersonal',
          )}
        />
        <Header.Subtitle
          localizationKey={localizationKeys('organizationList.subtitle', {
            applicationName: environment.displayConfig.applicationName,
          })}
        />
      </Header.Root>
      <Col
        elementDescriptor={descriptors.main}
        gap={6}
      >
        <PreviewListItems>
          <PersonalAccountPreview />
          {(userMemberships.count || 0) > 0 &&
            userMemberships.data?.map(inv => {
              return (
                <MembershipPreview
                  key={inv.id}
                  {...inv}
                />
              );
            })}

          {!userMemberships.hasNextPage &&
            (userInvitations.count || 0) > 0 &&
            userInvitations.data?.map(inv => {
              return (
                <InvitationPreview
                  key={inv.id}
                  {...inv}
                />
              );
            })}

          {!userMemberships.hasNextPage &&
            !userInvitations.hasNextPage &&
            (userSuggestions.count || 0) > 0 &&
            userSuggestions.data?.map(inv => {
              return (
                <SuggestionPreview
                  key={inv.id}
                  {...inv}
                />
              );
            })}

          {(hasNextPage || isLoading) && <PreviewListSpinner ref={ref} />}
        </PreviewListItems>

        <Divider
          key={`divider`}
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$8}`,
          })}
        />

        <Flex
          align='center'
          justify='between'
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$8}`,
          })}
        >
          <Button
            elementDescriptor={descriptors.button}
            block
            colorScheme='neutral'
            // size='sm'
            variant='outline'
            textVariant='buttonExtraSmallBold'
            onClick={handleCreateOrganizationClicked}
            localizationKey={localizationKeys('organizationList.action__createOrganization')}
          />
        </Flex>
      </Col>
    </>
  );
});
