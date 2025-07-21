import type { CommerceSubscriptionResource } from '@clerk/types';

import { Badge, localizationKeys } from '@/ui/customizables';
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';

const keys = {
  active: 'badge__activePlan',
  upcoming: 'badge__upcomingPlan',
  past_due: 'badge__pastDuePlan',
};

const colors = {
  active: 'secondary',
  upcoming: 'primary',
  past_due: 'warning',
};

export const SubscriptionBadge = ({
  subscription,
  elementDescriptor,
}: {
  subscription: CommerceSubscriptionResource;
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
