import type { BillingPlanResource } from '@clerk/types';
import React from 'react';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Grid,
  Icon,
  localizationKeys,
  Text,
  useLocalizations,
} from '../../customizables';
import { Card, Header, IconButton, useCardState } from '../../elements';
import { ArrowLeftIcon, Check, ChevronDown, Information } from '../../icons';
import { centsToUnit, handleError } from '../../utils';
import { useBillingContext } from './BillingProvider';

export const ChangePlanButton = ({ planKey }: { planKey: string }) => {
  const { changePlan } = useBillingContext();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const card = useCardState();

  const handleChangePlan = async () => {
    try {
      setIsLoading(true);
      const response = await changePlan({
        planKey,
        successReturnURL: window.location.href,
        cancelReturnURL: window.location.href,
      });
      if (response) {
        window.location.href = response?.redirectUrl;
      }
    } catch (e) {
      handleError(e, [], card.setError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      isLoading={isLoading}
      onClick={handleChangePlan}
      variant='outline'
      sx={t => ({ color: t.colors.$colorText })}
      localizationKey={localizationKeys('billing.managePlanScreen.action__changePlan')}
    />
  );
};

const DividerLine = () => {
  return (
    <Box
      elementDescriptor={descriptors.dividerLine}
      sx={t => ({
        height: '1px',
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
  );
};

const Feature = ({ name }: { name: string }) => {
  return (
    <Flex
      align='center'
      gap={2}
      sx={t => ({ color: t.colors.$colorTextSecondary })}
    >
      <Icon
        size='xs'
        icon={Check}
      />
      <Text
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          fontSize: t.fontSizes.$md,
        })}
      >
        {name}
      </Text>
    </Flex>
  );
};

export type OrganizationPlanCardProps = Pick<BillingPlanResource, 'name' | 'features' | 'description'> & {
  isCurrentPlan: boolean;
  planKey: string;
  price: string;
};

export const OrganizationPlanCard = (params: OrganizationPlanCardProps) => {
  const [showAllFeatures, setShowAllFeatures] = React.useState(false);
  const features = showAllFeatures ? params.features : params.features.slice(0, 6);

  return (
    <Col
      elementDescriptor={descriptors.billingPlanCard}
      elementId={descriptors.billingPlanCard.setId(params.planKey)}
      sx={t => ({
        backgroundColor: params.isCurrentPlan ? t.colors.$neutralAlpha25 : t.colors.$colorBackground,
        borderRadius: t.radii.$lg,
      })}
    >
      <Col
        sx={t => ({
          padding: `${t.space.$4} ${t.space.$5}`,
        })}
      >
        <Flex
          direction='col'
          gap={4}
        >
          <Flex justify='between'>
            <Col gap={1}>
              <Text
                sx={t => ({ color: t.colors.$colorText })}
                variant='subtitle'
              >
                {params.name}
              </Text>
              <Flex
                gap={1}
                align='center'
              >
                <Text
                  sx={t => ({
                    fontWeight: t.fontWeights.$semibold,
                    fontSize: t.fontSizes.$lg,
                  })}
                >
                  {params.price}
                </Text>
                <Text
                  variant='body'
                  sx={t => ({ color: t.colors.$colorTextSecondary })}
                  localizationKey={localizationKeys('billing.managePlanScreen.paymentIntervalMonthly')}
                />
              </Flex>
            </Col>

            {params.isCurrentPlan ? (
              <Box>
                <Badge
                  colorScheme='success'
                  sx={t => ({
                    alignSelf: 'flex-start',
                    background: t.colors.$success50,
                  })}
                  localizationKey={localizationKeys('billing.managePlanScreen.badge__currentPlan')}
                />{' '}
              </Box>
            ) : (
              <Flex
                justify='center'
                align='center'
              >
                <ChangePlanButton planKey={params.planKey} />
              </Flex>
            )}
          </Flex>

          {features.length > 0 && <DividerLine />}
          {params.description && <Text colorScheme='secondary'>{params.description}</Text>}
          {features.length > 0 && (
            <Col gap={2}>
              <Grid
                sx={t => ({
                  gridTemplateColumns: 'repeat(2,1fr)',
                  rowGap: t.space.$2,
                })}
              >
                {features.map((feature: string) => (
                  <Feature
                    key={feature}
                    name={feature}
                  />
                ))}
              </Grid>

              {features.length > 5 && (
                <Box>
                  <Button
                    onClick={() => setShowAllFeatures(value => !value)}
                    sx={t => ({ padding: `0 ${t.space.$2}`, color: t.colors.$colorTextSecondary })}
                    variant='ghost'
                  >
                    <Text
                      as='span'
                      sx={t => ({
                        fontWeight: t.fontWeights.$normal,
                        color: t.colors.$colorTextSecondary,
                      })}
                      localizationKey={
                        showAllFeatures
                          ? localizationKeys('billing.managePlanScreen.action__showLess')
                          : localizationKeys('billing.managePlanScreen.action__showAll')
                      }
                    />

                    <Icon
                      icon={ChevronDown}
                      sx={t => ({
                        transform: showAllFeatures ? 'rotate(180deg)' : 'rotate(0)',
                        marginLeft: t.space.$1,
                      })}
                    />
                  </Button>
                </Box>
              )}
            </Col>
          )}
        </Flex>
      </Col>
    </Col>
  );
};

const GoToPlanAndBilling = () => {
  const { goToPlanAndBilling } = useBillingContext();
  return (
    <Box>
      <IconButton
        onClick={goToPlanAndBilling}
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          padding: 0,
          '&:hover': {
            color: t.colors.$colorTextSecondary,
          },
        })}
        variant='unstyled'
        aria-label='Go to plan and billing'
        icon={
          <Icon
            icon={ArrowLeftIcon}
            sx={t => ({ marginRight: t.space.$2 })}
          />
        }
        localizationKey={localizationKeys('billing.managePlanScreen.action__goToPlanAndBilling')}
      />
    </Box>
  );
};

export const ManagePlanScreen = () => {
  const { availablePlans, currentPlan } = useBillingContext();
  const card = useCardState();
  const { locale } = useLocalizations();

  const plans = availablePlans.map(({ name, id, features, priceInCents, key, description }) => {
    return (
      <OrganizationPlanCard
        isCurrentPlan={currentPlan?.key === key}
        planKey={key}
        key={id}
        name={name}
        features={features}
        description={description}
        price={centsToUnit({ cents: priceInCents, locale })}
      />
    );
  });

  return (
    <Col gap={4}>
      <GoToPlanAndBilling />
      <Col>
        <Flex justify='between'>
          <Col>
            <Header.Root>
              <Header.Title
                localizationKey={localizationKeys('billing.managePlanScreen.headerTitle')}
                sx={t => ({ marginBottom: t.space.$4 })}
                textVariant='h2'
              />
            </Header.Root>
          </Col>
          <Col>
            <Flex align='center'>
              <Icon
                icon={Information}
                sx={t => ({ marginRight: t.space.$2, color: t.colors.$neutralAlpha300 })}
              />
              <Text
                colorScheme='secondary'
                as='span'
                sx={t => ({
                  fontSize: t.fontSizes.$xs,
                })}
                localizationKey={localizationKeys('billing.managePlanScreen.headerInformationText')}
              />
            </Flex>
          </Col>
        </Flex>

        <Card.Alert>{card.error}</Card.Alert>

        <Col sx={t => ({ gap: t.space.$4 })}>{plans}</Col>
      </Col>
    </Col>
  );
};
