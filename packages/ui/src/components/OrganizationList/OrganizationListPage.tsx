import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useOrganizationListContext } from '../../contexts';
import { CreateOrganizationForm } from '../CreateOrganization/CreateOrganizationForm';
import { useOrganizationListFlowController } from './organization-list.controller';
import { organizationListMessages } from './organization-list.messages';
import { useOrganizationListItemsModel, useOrganizationListPageModel } from './organization-list.model';
import type { OrganizationListPageData } from './organization-list.types';
import {
  OrganizationListFlowView,
  OrganizationListItemsView,
  OrganizationListPageView,
} from './organization-list.view';

export const OrganizationListPage = () => {
  const model = useOrganizationListPageModel();
  return (
    <OrganizationListPageContent
      key={model.scopeKey}
      model={model}
    />
  );
};

const OrganizationListPageContent = withCardStateProvider(({ model }: { model: OrganizationListPageData }) => {
  return (
    <OrganizationListPageView
      isLoading={model.isLoading}
      showListInitially={model.showListInitially}
      renderFlow={showListInitially => <OrganizationListFlows showListInitially={showListInitially} />}
    />
  );
});

const OrganizationListFlows = ({ showListInitially }: { showListInitially: boolean }) => {
  const { navigateAfterCreateOrganization, skipInvitationScreen } = useOrganizationListContext();
  const controller = useOrganizationListFlowController(showListInitially);

  return (
    <OrganizationListFlowView
      error={controller.error}
      isCreateOrganizationFlow={controller.isCreateOrganizationFlow}
      onCreateOrganizationClick={controller.onCreateOrganizationClick}
      renderCreateOrganization={() => (
        <CreateOrganizationForm
          flow='organizationList'
          startPage={{ headerTitle: organizationListMessages.organizations.createTitle }}
          skipInvitationScreen={skipInvitationScreen}
          navigateAfterCreateOrganization={navigateAfterCreateOrganization}
          onComplete={controller.onCreateOrganizationComplete}
          onCancel={controller.onCancel}
        />
      )}
      renderList={onCreateOrganizationClick => (
        <OrganizationListPageList onCreateOrganizationClick={onCreateOrganizationClick} />
      )}
    />
  );
};

export const OrganizationListPageList = (props: { onCreateOrganizationClick: () => void }) => {
  const model = useOrganizationListItemsModel();
  const card = useCardState();

  return (
    <OrganizationListItemsView
      applicationName={model.applicationName}
      hidePersonal={model.hidePersonal}
      paginationRef={model.paginationRef}
      personalAccount={model.personalAccount}
      memberships={model.memberships}
      invitations={model.invitations}
      suggestions={model.suggestions}
      isLoading={model.isLoading}
      hasNextPage={model.hasNextPage}
      error={card.error}
      onCreateOrganizationClick={props.onCreateOrganizationClick}
    />
  );
};
