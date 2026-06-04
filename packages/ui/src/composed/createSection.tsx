import type { ComponentType, ReactNode } from 'react';

import { useRequirePage } from './useRequirePage';

export function createSection(name: string, Component: ComponentType): () => ReactNode {
  function Section(): ReactNode {
    if (!useRequirePage(name)) return null;
    return <Component />;
  }
  Section.displayName = name;
  return Section;
}
