import { useOrganization } from '@clerk/shared/react';
import type { BillingPlanResource } from '@clerk/types';

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
import { Header } from '../../elements';
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
      sx={t => ({ color: t.colors.$primary400 })}
    >
      <Icon
        size='xs'
        icon={Check}
      />
      <Text
        sx={t => ({
          color: t.colors.$primary400,
          fontSize: t.fontSizes.$md,
        })}
      >
        {name}
      </Text>
    </Flex>
  );
};

const ChangePlanButton = ({ planKey }: { planKey: string }) => {
  const { organization } = useOrganization();

  const handleChangePlan = async () => {
    try {
      const response = await organization?.changePlan({ planKey });
      //TODO Handle action after success response
      console.log(response);
    } catch (e) {
      //TODO Show error message if exists
      console.log(e);
    }
  };

  return (
    <Button
      size='xs'
      onClick={handleChangePlan}
      variant='outline'
      localizationKey={localizationKeys('billing.managePlanScreen.action__changePlan')}
    />
  );
};

const GoToPlanAndBilling = () => {
  return (
    <Flex
      sx={t => ({ marginBottom: t.space.$4, color: t.colors.$colorTextSecondary })}
      align='center'
      gap={1}
    >
      <Icon
        size='sm'
        icon={ArrowLeftIcon}
      />
      <Text
        sx={t => ({
          color: t.colors.$colorTextSecondary,
          fontSize: t.fontSizes.$sm,
          fontWeight: t.fontWeights.$medium,
        })}
        localizationKey={localizationKeys('billing.managePlanScreen.action__goToPlanAndBilling')}
      />
    </Flex>
  );
};

type OrganizationPlanCardProps = Pick<BillingPlanResource, 'name' | 'features' | 'priceInCents'> & {
  isCurrentPlan: boolean;
  planKey: string;
};

export const OrganizationPlanCard = (params: OrganizationPlanCardProps) => {
  return (
    <Col
      sx={t => ({
        backgroundColor: params.isCurrentPlan ? t.colors.$neutralAlpha25 : 'white',
        width: '37.25rem',
        maxHeight: '11.25rem',
        borderRadius: '0.5rem',
        boxShadow: `0px 0px 0px 1px ${t.colors.$neutralAlpha100}`,
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
          <Col gap={2}>
            <Text variant='subtitle'>{params.name}</Text>
            <Flex
              gap={1}
              align='center'
            >
              <Text sx={t => ({ fontWeight: t.fontWeights.$semibold, fontSize: t.fontSizes.$lg })}>
                ${params.priceInCents}
              </Text>
              <Text
                variant='body'
                sx={t => ({ color: t.colors.$colorTextSecondary })}
                localizationKey={localizationKeys('billing.managePlanScreen.paymentIntervalMonthly')}
              />
            </Flex>
          </Col>

          <Box>
            {params.isCurrentPlan ? (
              <Badge
                colorScheme='success'
                sx={{ alignSelf: 'flex-start' }}
                localizationKey={localizationKeys('billing.managePlanScreen.badge__currentPlan')}
              />
            ) : (
              <ChangePlanButton planKey={params.planKey} />
            )}
          </Box>
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

const ManagePlanScreen = () => {
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

  const plan = availablePlans?.data.map(({ name, id, features, priceInCents, key }) => {
    return (
      <OrganizationPlanCard
        isCurrentPlan={currentPlan?.key === key}
        planKey={key}
        key={id}
        name={name}
        features={features}
        priceInCents={priceInCents / 100}
      />
    );
  });

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
      <Col sx={t => ({ gap: t.space.$4 })}>{plan}</Col>
    </Col>
  );
};

export const OrganizationBilling = () => {
  return <ManagePlanScreen />;
};
