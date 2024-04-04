import { useOrganization } from '@clerk/shared/react';

import { CurrentPlanSection, PaymentMethodSection } from '../../common';
import { Button, Col, descriptors, Flex, localizationKeys, useLocalizations } from '../../customizables';
import { FullHeightLoader, Header, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';

export const OrganizationBillingPage = withCardStateProvider(() => {
  const { organization } = useOrganization();
  const { t } = useLocalizations();

  const { data: currentPlan, isLoading } = useFetch(organization?.getCurrentPlan, 'organization-current-plan');

  const handleStartPortalSession = async () => {
    const res = await organization?.createPortalSession({ returnUrl: window.location.href });
    window.location.href = res?.redirectUrl || '';
  };

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorText })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('billing')}
      >
        <Flex justify='between'>
          <Col>
            <Header.Root>
              <Header.Title
                localizationKey={localizationKeys('billing.start.headerTitle__billing')}
                sx={t => ({ marginBottom: t.space.$4 })}
                textVariant='h2'
              />
            </Header.Root>
          </Col>
          <Col>
            <Button
              variant='outline'
              sx={t => ({ color: t.colors.$colorText })}
              onClick={handleStartPortalSession}
            >
              {t(localizationKeys('billing.manageBillingInfo'))}
            </Button>
          </Col>
        </Flex>

        {isLoading ? (
          <FullHeightLoader />
        ) : (
          <>
            <CurrentPlanSection currentPlan={currentPlan} />
            <PaymentMethodSection
              currentPlan={currentPlan}
              onClickStartPortalSession={handleStartPortalSession}
            />
          </>
        )}
      </Col>
    </Col>
  );
});
