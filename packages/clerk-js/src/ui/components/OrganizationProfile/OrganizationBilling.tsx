import { useOrganization } from '@clerk/shared/react';
import type { BillingPlanResource } from '@clerk/types';

import { Badge, Box, Col, Flex, Text } from '../../customizables';
import { useFetch } from '../../hooks';

const DividerLine = () => {
  return (
    <Box
      sx={t => ({
        width: '100%',
        height: '1px',
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
  );
};

type OrganizationPlanProps = Pick<BillingPlanResource, 'name' | 'features' | 'priceInCents'>;

export const OrganizationPlan = (params: OrganizationPlanProps) => {
  return (
    <Col
      sx={{
        backgroundColor: '#FAFAFB',
        width: '37.25rem',
        height: '11.25rem',
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
          <Col gap={1}>
            <Text variant='subtitle'>{params.name}</Text>
            <Flex gap={1}>
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

          <Flex>
            <Badge
              colorScheme='success'
              sx={{ alignSelf: 'flex-start' }}
            >
              Current plan
            </Badge>
          </Flex>
        </Flex>
        <DividerLine />
      </Col>
    </Col>
  );
};

export const OrganizationBilling = () => {
  const { organization } = useOrganization();

  const { data, isLoading } = useFetch(organization?.getAvailablePlans, {});
  console.log(data, isLoading);

  if (isLoading) {
    return <div>Loading</div>;
  }

  if ((data?.data.length || 0) < 1) {
    return <>No data</>;
  }

  const plan = data?.data.map(({ name, id, features, priceInCents }) => {
    return (
      <OrganizationPlan
        key={id}
        name={name}
        features={features}
        priceInCents={priceInCents}
      />
    );
  });

  return (
    <Col
      sx={{ marginTop: '10px' }}
      gap={4}
    >
      {plan}
    </Col>
  );
};
