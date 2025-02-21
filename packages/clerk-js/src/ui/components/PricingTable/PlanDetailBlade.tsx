import type { CommercePlanResource } from '@clerk/types';

import { CommerceBlade } from '../../common';
import { Button, Col, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { Avatar } from '../../elements';
import { Close } from '../../icons';

interface PlanDetailBladeProps {
  isOpen: boolean;
  handleClose: () => void;
  plan?: CommercePlanResource;
}

export const PlanDetailBlade = ({ isOpen, handleClose, plan }: PlanDetailBladeProps) => {
  if (!plan) {
    return null;
  }

  return (
    <CommerceBlade isOpen={isOpen}>
      <Col
        sx={{
          height: '100%',
        }}
      >
        <Col
          gap={3}
          sx={t => ({
            flex: 0,
            padding: t.space.$4,
            borderBottomWidth: t.borderWidths.$normal,
            borderBottomStyle: t.borderStyles.$solid,
            borderBottomColor: t.colors.$neutralAlpha100,
            backgroundImage: `linear-gradient(to top, ${t.colors.$neutralAlpha50} 30%, ${t.colors.$colorBackground} 100%)`,
          })}
        >
          <Button
            variant='ghost'
            onClick={handleClose}
            sx={t => ({
              position: 'absolute',
              top: t.space.$3,
              right: t.space.$3,
              color: t.colors.$neutralAlpha400,
              padding: t.space.$2,
            })}
          >
            <Icon
              icon={Close}
              size='md'
            />
          </Button>
          <Avatar
            size={_ => 40}
            title={plan.name}
            initials={plan.name[0]}
            rounded={false}
            imageUrl={plan.avatarUrl}
          />
          <Col>
            <Heading textVariant='h1'>{plan.name}</Heading>
            {plan.hasBaseFee ? (
              <Flex
                gap={2}
                align='baseline'
              >
                <Text variant='subtitle'>
                  {plan.currencySymbol}
                  {plan.amountFormatted}
                </Text>
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
              <Text
                variant='subtitle'
                localizationKey={localizationKeys('commerce_free')}
              />
            )}
          </Col>
          <Text
            variant='body'
            colorScheme='secondary'
          >
            {plan.description}
          </Text>
        </Col>

        <Col
          gap={6}
          sx={t => ({
            flex: 1,
            padding: t.space.$4,
            overflowY: 'auto',
            overflowX: 'hidden',
          })}
        >
          <Text
            variant='caption'
            colorScheme='secondary'
          >
            Available features
          </Text>
        </Col>

        <Col
          gap={3}
          sx={t => ({
            flex: 0,
            padding: t.space.$4,
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$neutralAlpha100,
            backgroundColor: t.colors.$neutralAlpha50,
          })}
        >
          <Button
            variant='solid'
            colorScheme='light'
            size='sm'
            textVariant='buttonLarge'
            sx={{
              width: '100%',
            }}
          >
            Cancel Subscription
          </Button>
        </Col>
      </Col>
    </CommerceBlade>
  );
};
