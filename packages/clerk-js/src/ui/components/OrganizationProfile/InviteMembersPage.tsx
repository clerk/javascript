import { useOrganization } from '@clerk/shared/react';

import { runIfFunctionOrReturn } from '../../../utils';
import { useWizard, Wizard } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';
import { descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { FormContent, IconCircle, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { Email } from '../../icons';
import { BillingWidget } from './BillingWidget';
import { InviteMembersForm } from './InviteMembersForm';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const InviteMembersPage = withCardStateProvider(() => {
  const title = localizationKeys('organizationProfile.invitePage.title');
  const subtitle = localizationKeys('organizationProfile.invitePage.subtitle');
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const { organization } = useOrganization();
  //@ts-expect-error
  const { __unstable_manageBillingUrl, __unstable_manageBillingMembersLimit } = useOrganizationProfileContext();

  if (!organization) {
    return null;
  }

  const reachedOrganizationMemberLimit =
    !!__unstable_manageBillingMembersLimit &&
    runIfFunctionOrReturn(__unstable_manageBillingMembersLimit) <=
      organization.pendingInvitationsCount + organization.membersCount;

  return (
    <Wizard {...wizard.props}>
      <FormContent
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
        <InviteMembersForm onSuccess={wizard.nextStep} />
      </FormContent>
      <SuccessPage
        title={title}
        contents={<InvitationsSentMessage />}
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
