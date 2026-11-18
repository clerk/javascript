import type { ComponentType } from 'react';

import AvatarExample from './components/avatar';
import BadgeExample from './components/badge';
import BannerExample from './components/banner';
import ButtonExample from './components/button';
import CardExample from './components/card';
import DataListExample from './components/data-list';
import EmptyStateExample from './components/empty-state';
import EntityExample from './components/entity';
import HeadingExample from './components/heading';
import IconExample from './components/icon';
import ItemExample from './components/item';
import PanelExample from './components/panel';
import SectionExample from './components/section';
import SkeletonExample from './components/skeleton';
import TableExample from './components/table';
import TextExample from './components/text';

export const examples: Partial<Record<string, ComponentType>> = {
  'components/avatar': AvatarExample,
  'components/badge': BadgeExample,
  'components/banner': BannerExample,
  'components/button': ButtonExample,
  'components/card': CardExample,
  'components/data-list': DataListExample,
  'components/empty-state': EmptyStateExample,
  'components/entity': EntityExample,
  'components/heading': HeadingExample,
  'components/icon': IconExample,
  'components/item': ItemExample,
  'components/panel': PanelExample,
  'components/section': SectionExample,
  'components/skeleton': SkeletonExample,
  'components/table': TableExample,
  'components/text': TextExample,
};
