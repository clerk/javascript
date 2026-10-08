import { useContext } from 'react';

import { useSubscriptionDetailsContext } from '@/ui/contexts/components/SubscriptionDetails';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { useDrawerContext } from '@/ui/elements/Drawer';

import { SubscriptionForCancellationContext } from './subscription-details.context';
import { useSubscriptionDetailsFooterController } from './subscription-details-footer.controller';
import { useSubscriptionDetailsFooterModel } from './subscription-details-footer.model';
import { SubscriptionDetailsFooterView } from './subscription-details-footer.view';

export const SubscriptionDetailsFooter = withCardStateProvider(() => {
  const { subscriptionId, confirmationOpen, setConfirmationOpen } = useContext(SubscriptionForCancellationContext);
  const { onSubscriptionCancel } = useSubscriptionDetailsContext();
  const { setIsOpen } = useDrawerContext();
  const model = useSubscriptionDetailsFooterModel(subscriptionId);
  const controller = useSubscriptionDetailsFooterController(model, {
    confirmationOpen,
    setConfirmationOpen,
    onComplete: () => onSubscriptionCancel?.(),
    closeDrawer: () => setIsOpen?.(false),
  });
  return <SubscriptionDetailsFooterView controller={controller} />;
});
