import { useOrganization } from '@clerk/shared/react';
import type { BillingPlanResource } from '@clerk/types';

import { Badge, Box, Button, Col, Flex, Grid, Icon, Text } from '../../customizables';
import { useFetch } from '../../hooks';
import { Check } from '../../icons';

const DividerLine = () => {
  return (
    <svg
      width='556'
      height='2'
      viewBox='0 0 556 2'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M0 1H556'
        stroke='#EEEEF0'
      />
    </svg>
  );
};

const Feature = ({ name }: { name: string }) => {
  return (
    <Flex
      align='center'
      gap={2}
    >
      <Icon
        size='xs'
        icon={Check}
      />
      <Text
        sx={t => ({
          color: '#5E5F6E',
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
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Button
      size='xs'
      onClick={handleChangePlan}
      variant='outline'
    >
      Change to this plan
    </Button>
  );
};

type OrganizationPlanProps = Pick<BillingPlanResource, 'name' | 'features' | 'priceInCents'> & {
  isCurrentPlan: boolean;
  planKey: string;
};

export const OrganizationPlan = (params: OrganizationPlanProps) => {
  return (
    <Col
      sx={{
        backgroundColor: params.isCurrentPlan ? '#FAFAFB' : 'white',
        width: '37.25rem',
        maxHeight: '11.25rem',
        borderRadius: '0.5rem',
        boxShadow: '0px 0px 0px 1px #EEEEF0',
      }}
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
              >
                per month
              </Text>
            </Flex>
          </Col>

          <Box>
            {params.isCurrentPlan ? (
              <Badge
                colorScheme='success'
                sx={{ alignSelf: 'flex-start' }}
              >
                Current plan
              </Badge>
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

export const OrganizationBilling = () => {
  const { organization } = useOrganization();

  const { data: availablePlans, isLoading: isLoadingAvailablePlans } = useFetch(
    organization?.getAvailablePlans,
    'availablePlans',
  );
  const { data: currentPlan, isLoading: isLoadingCurrentPlan } = useFetch(organization?.getCurrentPlan, 'currentPlan');

  if (isLoadingAvailablePlans || isLoadingCurrentPlan) {
    return <div>Loading</div>;
  }

  if ((availablePlans?.data.length || 0) < 1) {
    return <>No data</>;
  }

  const plan = availablePlans?.data.map(({ name, id, features, priceInCents, key }) => {
    return (
      <OrganizationPlan
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
    <Col
      sx={{ marginTop: '20px' }}
      gap={4}
    >
      {plan}
    </Col>
  );
};
