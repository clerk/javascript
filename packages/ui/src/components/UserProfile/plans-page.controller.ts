import type { usePlansPageModel } from './plans-page.model';

export const usePlansPageController = (model: ReturnType<typeof usePlansPageModel>) => ({
  onBack: () => void model.navigate('../', { searchParams: new URLSearchParams('tab=subscriptions') }),
});
