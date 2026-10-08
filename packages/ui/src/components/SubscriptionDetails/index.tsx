import type { __internal_SubscriptionDetailsProps } from '@clerk/shared/types';

import { SubscriptionDetailsContext } from '@/ui/contexts/components/SubscriptionDetails';
import { Drawer } from '@/ui/elements/Drawer';

import { SubscriberTypeContext } from '../../contexts';
import { Flow } from '../../customizables';
import { SubscriptionForCancellationContext } from './subscription-details.context';
import { useSubscriptionDetailsController } from './subscription-details.controller';
import { useSubscriptionDetailsModel } from './subscription-details.model';
import type { SubscriptionDetailsModel } from './subscription-details.types';
import { SubscriptionDetailsView } from './subscription-details.view';
import { SubscriptionDetailsCard } from './SubscriptionDetailsCard';
import { SubscriptionDetailsFooter } from './SubscriptionDetailsFooter';

export const SubscriptionDetails = (props: __internal_SubscriptionDetailsProps) => {
  return (
    <Flow.Root flow='subscriptionDetails'>
      <Flow.Part>
        <Drawer.Content>
          <SubscriptionDetailsContext.Provider value={{ componentName: 'SubscriptionDetails', ...props }}>
            <SubscriberTypeContext.Provider value={props.for}>
              <SubscriptionDetailsInternal />
            </SubscriberTypeContext.Provider>
          </SubscriptionDetailsContext.Provider>
        </Drawer.Content>
      </Flow.Part>
    </Flow.Root>
  );
};

const SubscriptionDetailsInternal = () => {
  const model = useSubscriptionDetailsModel();
  return (
    <SubscriptionDetailsContent
      key={model.scope}
      model={model}
    />
  );
};

const SubscriptionDetailsContent = ({ model }: { model: SubscriptionDetailsModel }) => {
  const controller = useSubscriptionDetailsController(model);
  const viewController = { isLoading: controller.isLoading, hasSubscription: controller.hasSubscription };

  if (controller.isLoading || !controller.hasSubscription) {
    return (
      <SubscriptionDetailsView
        controller={viewController}
        cards={null}
        footer={null}
      />
    );
  }

  return (
    <SubscriptionForCancellationContext.Provider value={controller.cancellation}>
      <SubscriptionDetailsView
        controller={viewController}
        cards={model.subscriptionIds.map(subscriptionId => (
          <SubscriptionDetailsCard
            key={subscriptionId}
            subscriptionId={subscriptionId}
          />
        ))}
        footer={<SubscriptionDetailsFooter />}
      />
    </SubscriptionForCancellationContext.Provider>
  );
};
