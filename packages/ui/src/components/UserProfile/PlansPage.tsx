import { SubscriberTypeContext } from '../../contexts';
import { usePlansPageController } from './plans-page.controller';
import { usePlansPageModel } from './plans-page.model';
import { PlansPageView } from './plans-page.view';

const PlansPageInternal = () => {
  const model = usePlansPageModel();
  const controller = usePlansPageController(model);
  return <PlansPageView {...controller} />;
};

export const PlansPage = () => (
  <SubscriberTypeContext.Provider value='user'>
    <PlansPageInternal />
  </SubscriberTypeContext.Provider>
);
