import { useCardState } from '@/ui/elements/contexts';

import type { useUserProfilePageModel } from './profile-page.model';

export const useUserProfilePageController = (model: ReturnType<typeof useUserProfilePageModel>) => {
  const card = useCardState();
  return { ...model, error: card.error };
};
