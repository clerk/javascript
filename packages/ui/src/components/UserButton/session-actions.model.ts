import { useRouter } from '@/router';

import { useUserButtonContext } from '../../contexts';
import type { SessionActionsModel } from './session-actions.types';

export const useSessionActionsModel = (): SessionActionsModel => {
  const { navigate } = useRouter();
  const { menutItems } = useUserButtonContext();

  return { navigate, menuItems: menutItems.map(item => ({ ...item })) };
};
