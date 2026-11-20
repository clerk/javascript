import type { ComponentType } from 'react';

import BadgeExample from './components/badge';
import BannerExample from './components/banner';
import ButtonExample from './components/button';

export const examples: Partial<Record<string, ComponentType>> = {
  'components/badge': BadgeExample,
  'components/banner': BannerExample,
  'components/button': ButtonExample,
};
