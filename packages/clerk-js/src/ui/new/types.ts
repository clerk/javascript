import type { ComponentType } from 'react';

export interface ComponentDefinition {
  type: 'component' | 'modal';
  load: () => Promise<{ default: ComponentType }>;
}
