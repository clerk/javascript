import React from 'react';

import { AppearanceContext, useAppearance } from '../customizables';
import type { Elements } from '../internal/appearance';

export const AppearanceOverrides = ({ elements, children }: { elements: Elements; children: React.ReactNode }) => {
  const appearance = useAppearance();

  const augmented = React.useMemo(() => {
    const newParsedElements = [appearance.parsedElements[0], elements, ...appearance.parsedElements.slice(1)];
    return { ...appearance, parsedElements: newParsedElements };
  }, [appearance, elements]);

  return <AppearanceContext.Provider value={{ value: augmented }}>{children}</AppearanceContext.Provider>;
};
