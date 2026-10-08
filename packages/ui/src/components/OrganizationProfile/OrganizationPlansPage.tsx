import { SubscriberTypeContext } from '../../contexts';
import { useOrganizationPlansPageController } from './organization-plans-page.controller';
import { useOrganizationPlansPageModel } from './organization-plans-page.model';
import { OrganizationPlansPageView } from './organization-plans-page.view';

const OrganizationPlansPageInternal = () => {
  const model = useOrganizationPlansPageModel();
  const controller = useOrganizationPlansPageController(model);
  return <OrganizationPlansPageView {...controller} />;
};

export const OrganizationPlansPage = () => (
  <SubscriberTypeContext.Provider value='organization'>
    <OrganizationPlansPageInternal />
  </SubscriberTypeContext.Provider>
);
