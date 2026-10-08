import { useReducer } from 'react';

export const useActiveConnectionAlertController = () => {
  const [isDismissed, dismiss] = useReducer(() => true, false);
  return { isDismissed, dismiss };
};
