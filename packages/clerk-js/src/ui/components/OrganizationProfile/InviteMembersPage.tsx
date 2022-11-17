import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { ContentPage, IconCircle, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { Email } from '../../icons';
import { InviteMembersForm } from './InviteMembersForm';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const InviteMembersPage = withCardStateProvider(() => {
  const title = localizationKeys('organizationProfile.invitePage.title');
  const subtitle = localizationKeys('organizationProfile.invitePage.subtitle');
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const { organization } = useCoreOrganization();

  if (!organization) {
    return null;
  }

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
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
      <IconCircle
        boxElementDescriptor={descriptors.invitationsSentIconBox}
        iconElementDescriptor={descriptors.invitationsSentIcon}
        icon={Email}
      />
      <Text localizationKey={localizationKeys('organizationProfile.invitePage.successMessage')} />
    </Flex>
  );
};
