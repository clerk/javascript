import { useOrganization } from '@clerk/shared/react';
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
  Spinner,
  Text,
} from '../../customizables';
import { Header, IconButton } from '../../elements';
import { useFetch } from '../../hooks';
import { ArrowLeftIcon, Check } from '../../icons';

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

const ChangePlanButton = ({ action }: { action: () => Promise<void> }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleActionClicked = async () => {
    try {
      setIsLoading(true);
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      isLoading={isLoading}
      onClick={handleActionClicked}
      variant='outline'
      sx={t => ({ color: t.colors.$colorText })}
      localizationKey={localizationKeys('billing.managePlanScreen.action__changePlan')}
    />
  );
};

const GoToPlanAndBilling = () => {
  return (
    <Box sx={t => ({ marginBottom: t.space.$4 })}>
      <IconButton
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          padding: 0,
          '&:hover': {
            color: t.colors.$colorTextSecondary,
          },
        })}
        variant='unstyled'
        aria-label='Go to plan and billing'
        icon={ArrowLeftIcon}
        localizationKey={localizationKeys('billing.managePlanScreen.action__goToPlanAndBilling')}
      />
    </Box>
  );
};

type OrganizationPlanCardProps = Pick<BillingPlanResource, 'name' | 'features' | 'priceInCents'> & {
  isCurrentPlan: boolean;
  planKey: string;
  changePlanAction: React.ReactNode;
};

export const OrganizationPlanCard = (params: OrganizationPlanCardProps) => {
  return (
    <Col
      sx={t => ({
        backgroundColor: params.isCurrentPlan ? t.colors.$neutralAlpha25 : 'white',
        width: '37.25rem',
        maxHeight: '11.25rem',
        borderRadius: '0.5rem',
        boxShadow: params.isCurrentPlan
          ? `0px 0px 0px 1px ${t.colors.$neutralAlpha100}`
          : '0px 0px 0px 1px rgba(25, 28, 33, 0.06), 0px 1px 2px 0px rgba(25, 28, 33, 0.12), 0px 0px 2px 0px rgba(0, 0, 0, 0.08);',
      })}
    >
      <Col
        sx={{
          padding: '0rem 1.25rem',
        }}
      >
        <Flex
          sx={{
            padding: '1rem 0rem',
          }}
          justify='between'
        >
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
                  color: t.colors.$colorText,
                  fontWeight: t.fontWeights.$semibold,
                  fontSize: t.fontSizes.$lg,
                })}
              >
                ${params.priceInCents}
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
              {params.changePlanAction}
            </Flex>
          )}
        </Flex>
        {params.features.length > 0 && <DividerLine />}
        {params.features.length > 0 && (
          <Grid
            sx={{
              padding: '1rem 0',
              gridTemplateColumns: 'repeat(2,1fr)',
              gridTemplateRows: 'repeat(3,1fr)',
              rowGap: '0.5rem',
            }}
          >
            {params.features.map((feature: string) => (
              <Feature
                key={feature}
                name={feature}
              />
            ))}
          </Grid>
        )}
      </Col>
    </Col>
  );
};

const ManagePlanScreen = ({ plans }: { plans: React.ReactNode }) => {
  return (
    <Col>
      <GoToPlanAndBilling />
      <Header.Root>
        <Header.Title
          localizationKey={localizationKeys('billing.managePlanScreen.headerTitle')}
          sx={t => ({ marginBottom: t.space.$4 })}
          textVariant='h2'
        />
      </Header.Root>
      <Col sx={t => ({ gap: t.space.$4 })}>{plans}</Col>
    </Col>
  );
};

export const OrganizationBilling = () => {
  const { organization } = useOrganization();
  const { data: availablePlans, isLoading: isLoadingAvailablePlans } = useFetch(
    organization?.getAvailablePlans,
    'availablePlans',
  );
  const { data: currentPlan, isLoading: isLoadingCurrentPlan } = useFetch(organization?.getCurrentPlan, 'currentPlan');

  if (isLoadingAvailablePlans || isLoadingCurrentPlan) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            margin: 'auto',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
          }}
        >
          <Spinner
            size='sm'
            colorScheme='primary'
            elementDescriptor={descriptors.spinner}
          />
        </Box>
      </Box>
    );
  }

  const handleChangePlan = async (planKey: string) => {
    try {
      const response = await organization?.changePlan({ planKey });
      //TODO Handle action after success response
      console.log(response);
    } catch (e) {
      //TODO Show error message if exists
      console.log(e);
    }
  };

  const plans = availablePlans?.data.map(({ name, id, features, priceInCents, key }) => {
    return (
      <OrganizationPlanCard
        isCurrentPlan={currentPlan?.key === key}
        planKey={key}
        key={id}
        name={name}
        features={features}
        priceInCents={priceInCents / 100}
        changePlanAction={<ChangePlanButton action={() => handleChangePlan(key)} />}
      />
    );
  });

  return <ManagePlanScreen plans={plans} />;
};
