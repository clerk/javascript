import type { CommerceSubscriptionItemResource } from '@clerk/types';

import { Badge, localizationKeys } from '@/ui/customizables';
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';

const keys = {
  active: 'badge__activePlan',
  upcoming: 'badge__upcomingPlan',
  past_due: 'badge__pastDuePlan',
  free_trial: 'badge__freeTrial',
};

const colors = {
  active: 'secondary',
  upcoming: 'primary',
  past_due: 'warning',
  free_trial: 'secondary',
};

export const SubscriptionBadge = <T extends { status: CommerceSubscriptionItemResource['status'] }>({
  subscription,
  elementDescriptor,
}: {
  subscription: T | { status: 'free_trial' };
  elementDescriptor?: ElementDescriptor;
}) => {
  return (
    <Badge
      elementDescriptor={elementDescriptor}
      colorScheme={
        // @ts-expect-error `ended` is included
        colors[subscription.status]
      }
      localizationKey={localizationKeys(
        // @ts-expect-error `ended` is included
        keys[subscription.status],
      )}
    />
  );
};
