import React from 'react';

export const useHavingTroubleController = () => {
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(value => !value), [setShowHavingTrouble]);
  return { showHavingTrouble, toggleHavingTrouble };
};
