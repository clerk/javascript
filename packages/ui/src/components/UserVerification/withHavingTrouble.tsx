import React from 'react';

import { useHavingTroubleController } from '../useHavingTroubleController';
import type { AlternativeMethodsProps } from './AlternativeMethods';
import { HavingTrouble } from './HavingTrouble';

const useHavingTrouble = <P extends AlternativeMethodsProps>(
  Component: React.ComponentType<P>,
  props: AlternativeMethodsProps,
) => {
  const { showHavingTrouble, toggleHavingTrouble } = useHavingTroubleController();

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

export const withHavingTrouble = useHavingTrouble;
