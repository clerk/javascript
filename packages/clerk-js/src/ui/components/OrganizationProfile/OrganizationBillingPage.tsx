import { useOrganization } from '@clerk/shared/react';
import React from 'react';

import { CurrentPlanSection, PaymentMethodSection } from '../../common';
import { Button, Col, descriptors, Flex, localizationKeys, useLocalizations } from '../../customizables';
import { Card, FullHeightLoader, Header, useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';

export const OrganizationBillingPage = withCardStateProvider(() => {
  const [isLoadingPortalSession, setIsLoadingPortalSession] = React.useState(false);
  const { organization } = useOrganization();
  const { t } = useLocalizations();
  const card = useCardState();

  const { data: currentPlan, isLoading } = useFetch(organization?.getCurrentPlan, 'organization-current-plan');

  const handleStartPortalSession = async () => {
    setIsLoadingPortalSession(true);
    try {
      const res = await organization?.createPortalSession({ returnUrl: window.location.href });
      window.location.href = res?.redirectUrl || '';
    } catch (e) {
      handleError(e, [], card.setError);
    } finally {
      setIsLoadingPortalSession(false);
    }
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
              isLoading={isLoadingPortalSession}
            >
              {t(localizationKeys('billing.start.action__manageBillingInfo'))}
            </Button>
          </Col>
        </Flex>

        <Card.Alert>{card.error}</Card.Alert>

        {isLoading ? (
          <FullHeightLoader />
        ) : (
          <>
            <CurrentPlanSection currentPlan={currentPlan} />
            <PaymentMethodSection
              currentPlan={currentPlan}
              onClickStartPortalSession={handleStartPortalSession}
              isLoading={isLoadingPortalSession}
            />
          </>
        )}
      </Col>
    </Col>
  );
});
