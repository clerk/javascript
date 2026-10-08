import { useCallback, useState } from 'react';

export const useHavingTroubleController = () => {
  const [showHavingTrouble, setShowHavingTrouble] = useState(false);
  const toggleHavingTrouble = useCallback(() => setShowHavingTrouble(current => !current), [setShowHavingTrouble]);
  return { showHavingTrouble, toggleHavingTrouble };
};
