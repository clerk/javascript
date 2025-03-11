import type { CommercePlanResource } from '@clerk/types';
import * as React from 'react';

import { Alert, Box, Button, Col, Flex, Heading, Text } from '../../customizables';
import { Drawer } from '../../elements';
import { PlanCardFeaturesList, PlanCardHeader, type PlanPeriod } from './PlanCard';

type DrawerRootProps = React.ComponentProps<typeof Drawer.Root>;

interface PlanDetailDrawerProps {
  open: DrawerRootProps['open'];
  setIsOpen: DrawerRootProps['onOpenChange'];
  portalProps?: DrawerRootProps['portalProps'];
  strategy: DrawerRootProps['strategy'];
  plan?: CommercePlanResource;
  planPeriod: PlanPeriod;
  setPlanPeriod: (val: PlanPeriod) => void;
}

export const PlanDetailDrawer = ({
  plan,
  strategy,
  portalProps,
  open,
  setIsOpen,
  planPeriod,
  setPlanPeriod,
}: PlanDetailDrawerProps) => {
  if (!plan) {
    return null;
  }

  const hasFeatures = plan.features.length > 0;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setIsOpen}
      strategy={strategy}
      portalProps={portalProps}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header
          sx={t =>
            !hasFeatures
              ? {
                  flex: 1,
                  borderBottomWidth: 0,
                  background: t.colors.$colorBackground,
                }
              : null
          }
        >
          <PlanCardHeader
            plan={plan}
            planPeriod={planPeriod}
            setPlanPeriod={setPlanPeriod}
            closeSlot={<Drawer.Close />}
          />
        </Drawer.Header>
        {hasFeatures ? (
          <Drawer.Body>
            <Box
              sx={t => ({
                padding: t.space.$4,
              })}
            >
              <Text
                variant='caption'
                colorScheme='secondary'
              >
                Available features
              </Text>
              <PlanCardFeaturesList plan={plan} />
            </Box>
          </Drawer.Body>
        ) : null}
        <CancelFooter
          plan={plan}
          handleClose={() => setIsOpen(false)}
        />
      </Drawer.Content>
    </Drawer.Root>
  );
};

const CancelFooter = ({ plan }: { plan: CommercePlanResource; handleClose: () => void }) => {
  // const { __experimental_commerce } = useClerk();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

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
    <Drawer.Footer>
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
    </Drawer.Footer>
  );
};
