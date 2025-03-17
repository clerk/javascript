import type { __experimental_CommercePlanResource } from '@clerk/types';
import * as React from 'react';

import { Box, Button, descriptors, Heading, Text } from '../../customizables';
import { Alert, Drawer } from '../../elements';
import type { PlanPeriod } from './PlanCard';
import { PlanCardFeaturesList, PlanCardHeader } from './PlanCard';

type DrawerRootProps = React.ComponentProps<typeof Drawer.Root>;

type PlanDetailDrawerProps = {
  isOpen: DrawerRootProps['open'];
  setIsOpen: DrawerRootProps['onOpenChange'];
  portalProps?: DrawerRootProps['portalProps'];
  strategy: DrawerRootProps['strategy'];
  plan?: __experimental_CommercePlanResource;
  planPeriod: PlanPeriod;
  setPlanPeriod: (p: PlanPeriod) => void;
};

export function PlanDetailDrawer({
  isOpen,
  setIsOpen,
  portalProps,
  strategy,
  plan,
  planPeriod,
  setPlanPeriod,
}: PlanDetailDrawerProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  if (!plan) {
    return null;
  }
  const hasFeatures = plan.features.length > 0;
  const cancelSubscription = async () => {
    setHasError(false);
    setIsSubmitting(true);

    // TODO(@COMMERCE): we need to get a handle on the subscription object in order to cancel it,
    // but this method doesn't exist yet.
    //
    // await subscription.cancel().then(() => {
    //   setIsSubmitting(false);
    //   handleClose();
    // }).catch(() => { setHasError(true); setIsSubmitting(false); });
  };

  return (
    <Drawer.Root
      open={isOpen}
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
              <PlanCardFeaturesList plan={plan} />
            </Box>
          </Drawer.Body>
        ) : null}

        <Drawer.Footer>
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            textVariant='buttonLarge'
            block
            onClick={() => setShowConfirmation(true)}
          >
            {/* TODO(@COMMERCE): needs localization */}
            Cancel Subscription
          </Button>
        </Drawer.Footer>

        <Drawer.Confirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          actionsSlot={
            <>
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
                  {/* TODO(@COMMERCE): needs localization */}
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
                {/* TODO(@COMMERCE): needs localization */}
                Cancel Subscription
              </Button>
            </>
          }
        >
          <Heading
            elementDescriptor={descriptors.drawerConfirmationTitle}
            as='h2'
            textVariant='h3'
          >
            {/* TODO(@COMMERCE): needs localization */}
            Cancel {plan.name} Subscription?
          </Heading>
          <Text
            elementDescriptor={descriptors.drawerConfirmationDescription}
            colorScheme='secondary'
          >
            {/* TODO(@COMMERCE): needs localization */}
            You can keep using &ldquo;{plan.name}&rdquo; features until [DATE], after which you will no longer have
            access.
          </Text>
          {hasError && (
            // TODO(@COMMERCE): needs localization
            <Alert colorScheme='danger'>There was a problem canceling your subscription, please try again.</Alert>
          )}
        </Drawer.Confirmation>
      </Drawer.Content>
    </Drawer.Root>
  );
}
