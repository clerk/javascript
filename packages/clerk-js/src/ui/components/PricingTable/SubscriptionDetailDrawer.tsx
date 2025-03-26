import type {
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { useState } from 'react';

import { Box, Button, descriptors, Heading, Text } from '../../customizables';
import { Alert, Drawer } from '../../elements';
import { handleError } from '../../utils';
import { PlanCardFeaturesList, PlanCardHeader } from './PlanCard';

type DrawerRootProps = React.ComponentProps<typeof Drawer.Root>;

type SubscriptionDetailDrawerProps = {
  isOpen: DrawerRootProps['open'];
  setIsOpen: DrawerRootProps['onOpenChange'];
  portalProps?: DrawerRootProps['portalProps'];
  strategy: DrawerRootProps['strategy'];
  subscription?: __experimental_CommerceSubscriptionResource;
  setPlanPeriod: (p: __experimental_CommerceSubscriptionPlanPeriod) => void;
  onSubscriptionCancel: () => void;
};

export function SubscriptionDetailDrawer({
  isOpen,
  setIsOpen,
  portalProps,
  strategy,
  subscription,
  setPlanPeriod,
  onSubscriptionCancel,
}: SubscriptionDetailDrawerProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();
  if (!subscription) {
    return null;
  }
  const hasFeatures = subscription.plan.features.length > 0;
  const cancelSubscription = async () => {
    setCancelError(undefined);
    setIsSubmitting(true);

    await subscription
      .cancel()
      .then(() => {
        setIsSubmitting(false);
        onSubscriptionCancel();
        setIsOpen(false);
      })
      .catch(error => {
        handleError(error, [], setCancelError);
        setIsSubmitting(false);
      });
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
            plan={subscription.plan}
            planPeriod={subscription.planPeriod}
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
              <PlanCardFeaturesList
                plan={subscription.plan}
                variant='avatar'
              />
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
                    setCancelError(undefined);
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
            Cancel {subscription.plan.name} Subscription?
          </Heading>
          <Text
            elementDescriptor={descriptors.drawerConfirmationDescription}
            colorScheme='secondary'
          >
            {/* TODO(@COMMERCE): needs localization */}
            You can keep using &ldquo;{subscription.plan.name}&rdquo; features until [DATE], after which you will no
            longer have access.
          </Text>
          {cancelError && (
            // TODO(@COMMERCE): needs localization
            <Alert colorScheme='danger'>{typeof cancelError === 'string' ? cancelError : cancelError.message}</Alert>
          )}
        </Drawer.Confirmation>
      </Drawer.Content>
    </Drawer.Root>
  );
}
