import type { CurrentBillingPlanResource } from '@clerk/types';
import React from 'react';

import { Box, Col, descriptors, Flex, Icon, localizationKeys, Text, useLocalizations } from '../../customizables';
import { Card, Header, ProfileSection, useCardState } from '../../elements';
import { DefaultCard, VisaCard } from '../../icons';
import { mqu } from '../../styledSystem';
import { centsToUnit, formatCardDate, getRelativeToNowDateKey, handleError } from '../../utils';
import { Protect } from '../Gate';
import { useBillingContext } from './BillingProvider';

const ManagePaymentMethodButton = ({ currentPlan }: { currentPlan: CurrentBillingPlanResource }) => {
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

  return currentPlan.paymentMethod ? (
    <ProfileSection.Button
      id='paymentMethod'
      localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton__manageBillingInfo')}
      onClick={handleStartPortalSession}
      isLoading={isLoadingPortalSession}
    />
  ) : (
    <ProfileSection.ArrowButton
      id='paymentMethod'
      localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton')}
      onClick={handleStartPortalSession}
      isLoading={isLoadingPortalSession}
    />
  );
};

const CardIcon = ({ cardType }: { cardType: string }) => {
  const icon = cardType === 'visa' ? VisaCard : DefaultCard;

  return (
    <Icon
      icon={icon}
      sx={t => ({ width: t.sizes.$6 })}
    />
  );
};

export const PaymentMethodSection = () => {
  const { t, locale } = useLocalizations();
  const { currentPlan } = useBillingContext();

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
        {currentPlan.paymentMethod && (
          <Box>
            <Flex
              gap={1}
              align='center'
            >
              <CardIcon cardType={currentPlan.paymentMethod.card.brand} />
              <Text>•••• {currentPlan.paymentMethod.card.last4}</Text>
            </Flex>
            <Box sx={t => ({ paddingLeft: t.sizes.$7 })}>
              <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>
                {t(localizationKeys('billing.paymentMethodSection.expires'))}{' '}
                {formatCardDate({
                  expMonth: currentPlan.paymentMethod.card.expMonth,
                  expYear: currentPlan.paymentMethod.card.expYear,
                  locale,
                })}
              </Text>
            </Box>
          </Box>
        )}
        <ManagePaymentMethodButton currentPlan={currentPlan} />
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};

const CurrentPlanSection = () => {
  const { t, locale } = useLocalizations();
  const { goToManageBillingPlan, currentPlan, checkPermissions } = useBillingContext();

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
          {currentPlan.billingCycle && (
            <Text
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              {t(localizationKeys('billing.currentPlanSection.renewsOn'))}{' '}
              {t(getRelativeToNowDateKey(currentPlan.billingCycle?.endDate))}
            </Text>
          )}
        </Box>
        {checkPermissions ? (
          <Protect permission='org:sys_billing:manage'>
            <ProfileSection.Button
              onClick={goToManageBillingPlan}
              id='currentPlan'
              localizationKey={
                currentPlan.priceInCents
                  ? localizationKeys('billing.currentPlanSection.primaryButton')
                  : localizationKeys('billing.currentPlanSection.primaryButton__upgrade')
              }
            />
          </Protect>
        ) : (
          <ProfileSection.Button
            onClick={goToManageBillingPlan}
            id='currentPlan'
            localizationKey={
              currentPlan.priceInCents
                ? localizationKeys('billing.currentPlanSection.primaryButton')
                : localizationKeys('billing.currentPlanSection.primaryButton__upgrade')
            }
          />
        )}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};

export const PlanAndBillingScreen = () => {
  const { checkPermissions } = useBillingContext();
  const card = useCardState();

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

        <CurrentPlanSection />
        {checkPermissions ? (
          <Protect permission='org:sys_billing:manage'>
            <PaymentMethodSection />
          </Protect>
        ) : (
          <PaymentMethodSection />
        )}
      </Col>
    </Col>
  );
};
