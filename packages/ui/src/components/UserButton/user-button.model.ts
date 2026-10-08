import { useUserButtonContext } from '../../contexts';
import type { UserButtonRootData } from './user-button.types';

export const useUserButtonRootModel = (): UserButtonRootData => {
  const { __experimental_asStandalone, defaultOpen } = useUserButtonContext();

  return { standalone: __experimental_asStandalone, defaultOpen };
};
