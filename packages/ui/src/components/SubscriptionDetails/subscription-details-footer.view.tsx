import { CardAlert } from '@/ui/elements/Card/CardAlert';
import { Drawer } from '@/ui/elements/Drawer';

import { Button, descriptors, Heading, Text } from '../../customizables';
import type { SubscriptionDetailsFooterViewData } from './subscription-details.types';
import { SubscriptionDetailsSummary } from './SubscriptionDetailsSummary';

export const SubscriptionDetailsFooterView = ({ controller }: { controller: SubscriptionDetailsFooterViewData }) => {
  if (!controller.hasNextPayment) {
    return null;
  }

  return (
    <Drawer.Footer>
      <SubscriptionDetailsSummary />
      <Drawer.Confirmation
        open={controller.confirmationOpen}
        onOpenChange={controller.onOpenChange}
        actionsSlot={
          <>
            {!controller.isLoading && (
              <Button
                variant='ghost'
                size='sm'
                textVariant='buttonLarge'
                onClick={controller.keepSubscription}
                localizationKey={controller.keepLabel}
              />
            )}
            <Button
              variant='solid'
              colorScheme='danger'
              size='sm'
              textVariant='buttonLarge'
              isLoading={controller.isLoading}
              onClick={() => void controller.cancelSubscription()}
              localizationKey={controller.cancelLabel}
            />
          </>
        }
      >
        {controller.hasSelection ? (
          <>
            <Heading
              elementDescriptor={descriptors.drawerConfirmationTitle}
              as='h2'
              textVariant='h3'
              localizationKey={controller.titleLabel || undefined}
            />
            <Text
              elementDescriptor={descriptors.drawerConfirmationDescription}
              colorScheme='secondary'
              localizationKey={controller.descriptionLabel || undefined}
            />
            <CardAlert>{controller.error}</CardAlert>
          </>
        ) : null}
      </Drawer.Confirmation>
    </Drawer.Footer>
  );
};
