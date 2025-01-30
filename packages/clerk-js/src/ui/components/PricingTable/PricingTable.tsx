import { useClerk } from '@clerk/shared/react';
import type { CommercePlanResource, PricingTableProps } from '@clerk/types';

import { usePricingTableContext } from '../../contexts';
import { Badge, Button, Col, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { Avatar } from '../../elements';
import { useFetch } from '../../hooks';
import { Check } from '../../icons';

export const PricingTable = (props: PricingTableProps) => {
  const { commerce } = useClerk();

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
          props={props}
        />
      ))}
    </Flex>
  );
};

const PlanCard = ({ plan, props }: { plan: CommercePlanResource; props: PricingTableProps }) => {
  const { ctaPosition = 'bottom' } = props;
  const { mode = 'mounted' } = usePricingTableContext();
  const compact = mode === 'modal';
  const isActivePlan = !plan.hasBaseFee;

  return (
    <Col
      sx={t => ({
        flex: 1,
        borderRadius: t.radii.$md,
        backgroundColor: t.colors.$neutralAlpha50,
        boxShadow: t.shadows.$tableBodyShadow,
        maxWidth: 320,
      })}
    >
      <Col
        justify='center'
        align='start'
        gap={3}
        sx={t => ({
          padding: compact ? t.space.$3 : t.space.$4,
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
          {isActivePlan && (
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
          <Col>
            <Heading textVariant={compact ? 'h3' : 'h2'}>{plan.name}</Heading>
            {!compact && (
              <Text
                variant='subtitle'
                colorScheme='secondary'
              >
                {plan.description}
              </Text>
            )}
          </Col>

          {plan.hasBaseFee ? (
            <Flex
              gap={2}
              align='baseline'
            >
              <Heading textVariant={compact ? 'h2' : 'h1'}>
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
              textVariant={compact ? 'h2' : 'h1'}
              localizationKey={localizationKeys('commerce_free')}
            />
          )}
        </Col>
      </Col>
      <Col
        gap={compact ? 2 : 3}
        align='start'
        sx={t => ({
          order: ctaPosition === 'top' ? 2 : 1,
          backgroundColor: t.colors.$white,
          padding: compact ? t.space.$3 : t.space.$4,
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
          order: ctaPosition === 'top' ? 1 : 2,
          padding: compact ? t.space.$3 : t.space.$4,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha50,
        })}
      >
        <Button
          colorScheme={isActivePlan ? 'light' : 'primary'}
          size='sm'
          textVariant={compact ? 'buttonSmall' : 'buttonLarge'}
          sx={{
            width: '100%',
          }}
          localizationKey={
            isActivePlan ? localizationKeys('commerce_manageMembership') : localizationKeys('commerce_getStarted')
          }
        />
      </Flex>
    </Col>
  );
};
