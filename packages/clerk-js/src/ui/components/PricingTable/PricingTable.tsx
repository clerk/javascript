import { useClerk } from '@clerk/shared/react';
import type { CommercePlanResource } from '@clerk/types';

import { Badge, Box, Button, Col, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { Avatar } from '../../elements';
import { useFetch } from '../../hooks';
import { Check } from '../../icons';

export const PricingTable = () => {
  const { commerce } = useClerk();
  // const { currency } = usePricingTableContext();

  const { data: plans } = useFetch(commerce?.getPlans, 'commerce-plans');

  return (
    <Flex
      gap={4}
      align='start'
      sx={{ width: '100%' }}
    >
      {plans?.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
        />
      ))}
    </Flex>
  );
};

const PlanCard = ({ plan }: { plan: CommercePlanResource }) => {
  return (
    <Box
      sx={t => ({
        flex: 1,
        borderRadius: t.radii.$md,
        backgroundColor: t.colors.$neutralAlpha50,
        boxShadow: t.shadows.$tableBodyShadow,
      })}
    >
      <Col
        justify='center'
        align='start'
        gap={3}
        sx={t => ({
          padding: t.space.$3,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha50,
        })}
      >
        <Flex
          align='start'
          justify='between'
          sx={_ => ({ width: '100%' })}
        >
          <Avatar
            size={_ => 40}
            title={plan.name}
            initials={plan.name[0]}
            rounded={false}
            imageUrl={plan.avatarUrl}
          />
          {!plan.hasBaseFee && (
            <Badge
              localizationKey={localizationKeys('badge__currentPlan')}
              sx={t => ({
                backgroundColor: t.colors.$primary500,
                color: t.colors.$white,
              })}
            />
          )}
        </Flex>
        <Col
          align='start'
          gap={2}
        >
          <Heading textVariant='h3'>{plan.name}</Heading>
          {plan.hasBaseFee ? (
            <Flex
              gap={2}
              align='baseline'
            >
              <Heading textVariant='h2'>
                {plan.currencySymbol}
                {plan.amountFormatted}
              </Heading>
              <Flex
                gap={1}
                align='baseline'
              >
                <Text
                  variant='caption'
                  colorScheme='secondary'
                >
                  /
                </Text>
                <Text
                  variant='caption'
                  colorScheme='secondary'
                  sx={{ textTransform: 'lowercase' }}
                  localizationKey={localizationKeys('commerce_month')}
                />
              </Flex>
            </Flex>
          ) : (
            <Heading
              textVariant='h2'
              localizationKey={localizationKeys('commerce_free')}
            />
          )}
        </Col>
      </Col>
      <Col
        gap={2}
        align='start'
        sx={t => ({
          backgroundColor: t.colors.$white,
          padding: t.space.$3,
        })}
      >
        {plan.features.map(feature => (
          <Flex
            gap={2}
            align='baseline'
            key={feature.id}
          >
            <Icon
              icon={Check}
              colorScheme='neutral'
              size='sm'
            />
            <Text>{feature.description}</Text>
          </Flex>
        ))}
      </Col>
      <Flex
        align='center'
        sx={t => ({
          padding: t.space.$3,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha50,
        })}
      >
        <Button
          colorScheme='light'
          sx={{
            width: '100%',
          }}
        >
          Get started
        </Button>
      </Flex>
    </Box>
  );
};
