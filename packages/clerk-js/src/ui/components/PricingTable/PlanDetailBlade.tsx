import type { CommercePlanResource } from '@clerk/types';
import { useState } from 'react';

import { CommerceBlade } from '../../common';
import { Alert, Button, Col, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
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
                    localizationKey={localizationKeys('commerce.month')}
                  />
                </Flex>
              </Flex>
            ) : (
              <Text
                variant='subtitle'
                localizationKey={localizationKeys('commerce.free')}
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
          {plan.features.map(feature => (
            <Flex
              key={feature.id}
              gap={3}
              align='start'
            >
              <Avatar
                size={_ => 24}
                title={feature.name}
                rounded={false}
                imageUrl={feature.avatarUrl}
              />
              <Col gap={1}>
                <Text variant='buttonSmall'>{feature.name}</Text>
                <Text
                  variant='caption'
                  colorScheme='secondary'
                >
                  {feature.description}
                </Text>
              </Col>
            </Flex>
          ))}
        </Col>

        <CancelFooter
          plan={plan}
          handleClose={handleClose}
        />
      </Col>
    </CommerceBlade>
  );
};

const CancelFooter = ({ plan }: { plan: CommercePlanResource; handleClose: () => void }) => {
  // const { __experimental_commerce } = useClerk();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const cancelSubscription = async () => {
    setHasError(false);
    setIsSubmitting(true);

    // TODO: we need to get a handle on the subscription object in order to cancel it,
    // but this method doesn't exist yet.
    //
    // await subscription.cancel().then(() => {
    //   setIsSubmitting(false);
    //   handleClose();
    // }).catch(() => { setHasError(true); setIsSubmitting(false); });
  };

  return (
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
      {showConfirmation ? (
        <Col gap={8}>
          <Heading textVariant='h3'>Cancel {plan.name} Subscription?</Heading>
          <Text colorScheme='secondary'>
            You can keep using &ldquo;{plan.name}&rdquo; features until [DATE], after which you will no longer have
            access.
          </Text>
          {hasError && (
            <Alert colorScheme='danger'>There was a problem canceling your subscription, please try again.</Alert>
          )}
          <Flex
            gap={3}
            justify='end'
          >
            {!isSubmitting && (
              <Button
                variant='ghost'
                size='sm'
                textVariant='buttonLarge'
                onClick={() => {
                  setHasError(false);
                  setShowConfirmation(false);
                }}
              >
                Keep Subscription
              </Button>
            )}
            <Button
              variant='solid'
              colorScheme='danger'
              size='sm'
              textVariant='buttonLarge'
              isLoading={isSubmitting}
              onClick={cancelSubscription}
            >
              Cancel Subscription
            </Button>
          </Flex>
        </Col>
      ) : (
        <Button
          variant='bordered'
          colorScheme='secondary'
          size='sm'
          textVariant='buttonLarge'
          sx={{
            width: '100%',
          }}
          onClick={() => setShowConfirmation(true)}
        >
          Cancel Subscription
        </Button>
      )}
    </Col>
  );
};
