import React from 'react';

import { AppearanceContext, useAppearance } from '../customizables';
import type { Elements } from '../internal/appearance';

export const AppearanceOverrides = ({ elements, children }: { elements: Elements; children: React.ReactNode }) => {
  const appearance = useAppearance();

  const augmented = React.useMemo(() => {
    // position 0 is the base theme; overrides slot in immediately above it
    const [base, ...rest] = appearance.parsedElements;
    return { ...appearance, parsedElements: [base, elements, ...rest] };
  }, [appearance, elements]);

  return <AppearanceContext.Provider value={{ value: augmented }}>{children}</AppearanceContext.Provider>;
};
