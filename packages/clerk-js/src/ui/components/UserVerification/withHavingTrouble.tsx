import React from 'react';

import type { AlternativeMethodsProps } from './AlternativeMethods';
import { HavingTrouble } from './HavingTrouble';

export const withHavingTrouble = <P extends AlternativeMethodsProps>(
  Component: React.ComponentType<P>,
  props: AlternativeMethodsProps,
) => {
  const [showHavingTrouble, setShowHavingTrouble] = React.useState(false);
  const toggleHavingTrouble = React.useCallback(() => setShowHavingTrouble(s => !s), [setShowHavingTrouble]);

  if (showHavingTrouble) {
    return <HavingTrouble onBackLinkClick={toggleHavingTrouble} />;
  }

  return (
    <Component
      {...(props as unknown as P)}
      onHavingTroubleClick={toggleHavingTrouble}
    />
  );
};
