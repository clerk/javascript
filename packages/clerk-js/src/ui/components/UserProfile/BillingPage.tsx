import { useUser } from '@clerk/shared/react';
import React from 'react';

import { CurrentPlanSection, PaymentMethodSection } from '../../common';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, FullHeightLoader, Header, useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';

export const BillingPage = withCardStateProvider(() => {
  const [isLoadingPortalSession, setIsLoadingPortalSession] = React.useState(false);
  const { user } = useUser();
  const card = useCardState();

  const { data: currentPlan, isLoading } = useFetch(user?.getCurrentPlan, 'user-current-plan');

  const handleStartPortalSession = async () => {
    setIsLoadingPortalSession(true);
    try {
      const res = await user?.createPortalSession({ returnUrl: window.location.href });
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
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('billing.start.headerTitle__billing')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
          />
        </Header.Root>

        <Card.Alert>{card.error}</Card.Alert>

        <Card.Alert>{card.error}</Card.Alert>

        {isLoading ? (
          <FullHeightLoader />
        ) : (
          <>
            <CurrentPlanSection currentPlan={currentPlan} />
            <PaymentMethodSection
              currentPlan={currentPlan}
              onClickManageBilling={handleStartPortalSession}
              isLoadingPortalSession={isLoadingPortalSession}
            />
          </>
        )}
      </Col>
    </Col>
  );
});
