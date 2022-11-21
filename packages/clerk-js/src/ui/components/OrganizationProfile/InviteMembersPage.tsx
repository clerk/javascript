import { useWizard, Wizard } from '../../common';
import { useCoreOrganization, useOrganizationProfileContext } from '../../contexts';
import { Flex, localizationKeys, Text } from '../../customizables';
import { ContentPage, IconCircle, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { Email } from '../../icons';
import { BillingWidget } from './BillingWidget';
import { InviteMembersForm } from './InviteMembersForm';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const InviteMembersPage = withCardStateProvider(() => {
  const title = localizationKeys('organizationProfile.invitePage.title');
  const subtitle = localizationKeys('organizationProfile.invitePage.subtitle');
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const { organization } = useCoreOrganization();
  const { __unstable_manageBillingUrl, __unstable_manageBillingMembersLimit } = useOrganizationProfileContext();

  if (!organization) {
    return null;
  }

  const reachedOrganizationMemberLimit =
    !!__unstable_manageBillingMembersLimit &&
    __unstable_manageBillingMembersLimit <= organization.pendingInvitationsCount + organization.membersCount;

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        {reachedOrganizationMemberLimit && __unstable_manageBillingUrl && (
          <BillingWidget
            __unstable_manageBillingUrl={__unstable_manageBillingUrl}
            __unstable_manageBillingMembersLimit={__unstable_manageBillingMembersLimit}
          />
        )}
        <InviteMembersForm
          organization={organization}
          onSuccess={wizard.nextStep}
        />
      </ContentPage>
      <SuccessPage
        title={title}
        content={<InvitationsSentMessage />}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      />
    </Wizard>
  );
});

export const InvitationsSentMessage = () => {
  return (
    <Flex
      direction='col'
      center
      gap={4}
    >
      <IconCircle icon={Email} />
      <Text localizationKey={localizationKeys('organizationProfile.invitePage.successMessage')} />
    </Flex>
  );
};
