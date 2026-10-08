import { CreateOrganizationAction } from '@/common/CreateOrganizationAction';
import { OrganizationPreviewSpinner } from '@/ui/common/organizations/OrganizationPreview';
import { Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { Box, Col, descriptors, Flex, Flow, Spinner } from '../../customizables';
import { Route, Switch } from '../../router';
import { organizationListMessages } from './organization-list.messages';
import type {
  OrganizationListFlowViewProps,
  OrganizationListItemsViewProps,
  OrganizationListPageData,
} from './organization-list.types';
import { PreviewListItems } from './shared';
import { InvitationPreview } from './UserInvitationList';
import { MembershipPreview, PersonalAccountPreview } from './UserMembershipList';
import { SuggestionPreview } from './UserSuggestionList';

export const OrganizationListRootView = ({ children }: { children: React.ReactNode }) => (
  <Flow.Root flow='organizationList'>
    <Flow.Part>
      <Switch>
        <Route>{children}</Route>
      </Switch>
    </Flow.Part>
  </Flow.Root>
);

const CreateOrganizationButton = ({ onClick }: { onClick: React.MouseEventHandler }) => (
  <CreateOrganizationAction
    elementDescriptor={descriptors.organizationListCreateOrganizationActionButton}
    label={organizationListMessages.organizations.create}
    onClick={onClick}
    sx={t => ({
      borderTopWidth: t.borderWidths.$normal,
      borderTopStyle: t.borderStyles.$solid,
      borderTopColor: t.colors.$borderAlpha100,
      padding: `${t.space.$5} ${t.space.$5}`,
    })}
    iconSx={t => ({
      width: t.sizes.$9,
      height: t.sizes.$6,
    })}
  />
);

export const OrganizationListPageView = ({
  isLoading,
  showListInitially,
  renderFlow,
}: {
  isLoading: OrganizationListPageData['isLoading'];
  showListInitially: OrganizationListPageData['showListInitially'];
  renderFlow: (showListInitially: boolean) => React.ReactNode;
}) => (
  <Card.Root>
    <Card.Content sx={t => ({ padding: `${t.space.$4} ${t.space.$none} ${t.space.$none}` })}>
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
            elementDescriptor={descriptors.spinner}
          />
        </Flex>
      )}
      {!isLoading && renderFlow(showListInitially)}
    </Card.Content>
    <Card.Footer />
  </Card.Root>
);

export const OrganizationListFlowView = ({
  error,
  isCreateOrganizationFlow,
  onCreateOrganizationClick,
  renderList,
  renderCreateOrganization,
}: {
  renderList: (onCreateOrganizationClick: () => void) => React.ReactNode;
  renderCreateOrganization: () => React.ReactNode;
} & OrganizationListFlowViewProps) => (
  <>
    {!isCreateOrganizationFlow && renderList(onCreateOrganizationClick)}
    {isCreateOrganizationFlow && (
      <>
        <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{error}</Card.Alert>
        <Box sx={t => ({ padding: `${t.space.$none} ${t.space.$5} ${t.space.$5}` })}>{renderCreateOrganization()}</Box>
      </>
    )}
  </>
);

export const OrganizationListItemsView = ({
  applicationName,
  hidePersonal,
  paginationRef,
  personalAccount,
  memberships,
  invitations,
  suggestions,
  isLoading,
  hasNextPage,
  error,
  onCreateOrganizationClick,
}: OrganizationListItemsViewProps) => (
  <>
    <Header.Root
      sx={t => ({ padding: `${t.space.$4} ${t.space.$4} ${t.space.$none}` })}
      showLogo
    >
      <Header.Title localizationKey={organizationListMessages.header.title(hidePersonal)} />
      <Header.Subtitle localizationKey={organizationListMessages.header.subtitle(applicationName)} />
    </Header.Root>
    <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{error}</Card.Alert>
    <Col elementDescriptor={descriptors.main}>
      <PreviewListItems>
        <Actions>
          <PersonalAccountPreview model={personalAccount} />
          {memberships.map(item => (
            <MembershipPreview
              key={item.id}
              model={item.model}
            />
          ))}
          {invitations.map(item => (
            <InvitationPreview
              key={item.id}
              model={item.model}
            />
          ))}
          {suggestions.map(item => (
            <SuggestionPreview
              key={item.id}
              model={item.model}
            />
          ))}
          {(hasNextPage || isLoading) && <OrganizationPreviewSpinner ref={paginationRef} />}
          <CreateOrganizationButton onClick={onCreateOrganizationClick} />
        </Actions>
      </PreviewListItems>
    </Col>
  </>
);
