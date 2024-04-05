import type { BillingPlanResource } from '@clerk/types';
import React from 'react';

import { Box, Col, descriptors, localizationKeys, Text, useLocalizations } from '../../customizables';
import { Card, Header, ProfileSection, useCardState } from '../../elements';
import { mqu } from '../../styledSystem';
import { centsToUnit, getRelativeToNowDateKey, handleError } from '../../utils';
import { useBillingContext } from './BillingProvider';

const ManagePaymentMethodButton = () => {
  const { createPortalSession } = useBillingContext();
  const [isLoadingPortalSession, setIsLoadingPortalSession] = React.useState(false);
  const card = useCardState();

  const handleStartPortalSession = async () => {
    setIsLoadingPortalSession(true);
    try {
      const res = await createPortalSession({ returnUrl: window.location.href });
      window.location.href = res?.redirectUrl || '';
    } catch (e) {
      handleError(e, [], card.setError);
    } finally {
      setIsLoadingPortalSession(false);
    }
  };

  return (
    <ProfileSection.Button
      id='paymentMethod'
      localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton__manageBillingInfo')}
      onClick={handleStartPortalSession}
      isLoading={isLoadingPortalSession}
    />
  );
};

type PaymentMethodSectionProps = {
  currentPlan?: BillingPlanResource | null;
};

export const PaymentMethodSection = ({ currentPlan }: PaymentMethodSectionProps) => {
  const { t } = useLocalizations();

  if (!currentPlan) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('billing.paymentMethodSection.title')}
      id='paymentMethod'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='paymentMethod'>
        {currentPlan.paymentMethod ? (
          <>
            <Box>
              <Text>•••• {currentPlan.paymentMethod.card.last4}</Text>
              <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>
                {t(localizationKeys('billing.paymentMethodSection.expires'))} {currentPlan.paymentMethod.card.expMonth}/
                {currentPlan.paymentMethod.card.expYear}
              </Text>
            </Box>
            <ManagePaymentMethodButton />
          </>
        ) : (
          <ProfileSection.ArrowButton
            id='paymentMethod'
            localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton')}
          />
        )}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};

const CurrentPlanSection = ({ currentPlan }: { currentPlan?: BillingPlanResource | null }) => {
  const { t, locale } = useLocalizations();
  const { goToManageBillingPlan } = useBillingContext();

  if (!currentPlan) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('billing.currentPlanSection.title')}
      id='currentPlan'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='currentPlan'>
        <Box>
          <Text
            variant='subtitle'
            sx={t => ({ marginBottom: t.space.$2 })}
          >
            {currentPlan.name}
          </Text>
          <Text sx={t => ({ fontWeight: t.fontWeights.$semibold, fontSize: t.fontSizes.$lg })}>
            {centsToUnit({ cents: currentPlan.priceInCents, locale })}{' '}
            <Text
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$md })}
            >
              {t(localizationKeys('billing.currentPlanSection.perMonth'))}
            </Text>
          </Text>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {t(localizationKeys('billing.currentPlanSection.renewsOn'))}{' '}
            {t(getRelativeToNowDateKey(currentPlan.billingCycle?.endDate))}
          </Text>
        </Box>
        <ProfileSection.Button
          onClick={goToManageBillingPlan}
          id='currentPlan'
          localizationKey={localizationKeys('billing.currentPlanSection.primaryButton')}
        />
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};

export const PlanAndBillingScreen = () => {
  const card = useCardState();
  const { currentPlan } = useBillingContext();

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

        <CurrentPlanSection currentPlan={currentPlan} />
        <PaymentMethodSection currentPlan={currentPlan} />
      </Col>
    </Col>
  );
};
