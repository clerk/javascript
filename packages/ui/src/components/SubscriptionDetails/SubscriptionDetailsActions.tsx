import { useContext } from 'react';

import { useSubscriptionDetailsContext } from '@/ui/contexts/components/SubscriptionDetails';
import { useDrawerContext } from '@/ui/elements/Drawer';

import { SubscriptionForCancellationContext } from './subscription-details.context';
import { useSubscriptionDetailsActionsController } from './subscription-details-actions.controller';
import { useSubscriptionDetailsActionsModel } from './subscription-details-actions.model';
import { SubscriptionDetailsActionsView } from './subscription-details-actions.view';

export const SubscriptionDetailsActions = ({ subscriptionId }: { subscriptionId: string }) => {
  const { portalRoot } = useSubscriptionDetailsContext();
  const { isOpen, setIsOpen } = useDrawerContext();
  const { setSubscriptionId, setConfirmationOpen } = useContext(SubscriptionForCancellationContext);
  const model = useSubscriptionDetailsActionsModel(subscriptionId, portalRoot);
  const controller = useSubscriptionDetailsActionsController(model, {
    isOpen: isOpen !== false,
    closeDrawer: () => setIsOpen?.(false),
    selectForCancellation: id => {
      setSubscriptionId(id);
      setConfirmationOpen(true);
    },
  });
  return model ? <SubscriptionDetailsActionsView controller={controller} /> : null;
};
