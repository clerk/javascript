import type { useOrganizationPlansPageModel } from './organization-plans-page.model';

export const useOrganizationPlansPageController = (model: ReturnType<typeof useOrganizationPlansPageModel>) => ({
  onBack: () => void model.navigate('../', { searchParams: new URLSearchParams('tab=subscriptions') }),
});
