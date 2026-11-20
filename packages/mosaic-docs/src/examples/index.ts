import type { ComponentType } from 'react';

import ActionMenuExample from './components/action-menu';
import AvatarExample from './components/avatar';
import BadgeExample from './components/badge';
import BannerExample from './components/banner';
import ButtonExample from './components/button';
import CardExample from './components/card';
import DataListExample from './components/data-list';
import EmptyStateExample from './components/empty-state';
import EntityExample from './components/entity';
import FieldExample from './components/field';
import HeadingExample from './components/heading';
import IconExample from './components/icon';
import InputExample from './components/input';
import ItemExample from './components/item';
import PanelExample from './components/panel';
import PopoverExample from './components/popover';
import ProfileExample from './components/profile';
import ProviderButtonExample from './components/provider-button';
import RadioExample from './components/radio';
import SectionExample from './components/section';
import SegmentedControlExample from './components/segmented-control';
import SkeletonExample from './components/skeleton';
import SwitcherExample from './components/switcher';
import TableExample from './components/table';
import TextExample from './components/text';

export const examples: Partial<Record<string, ComponentType>> = {
  'components/action-menu': ActionMenuExample,
  'components/avatar': AvatarExample,
  'components/badge': BadgeExample,
  'components/banner': BannerExample,
  'components/button': ButtonExample,
  'components/card': CardExample,
  'components/data-list': DataListExample,
  'components/empty-state': EmptyStateExample,
  'components/entity': EntityExample,
  'components/field': FieldExample,
  'components/heading': HeadingExample,
  'components/icon': IconExample,
  'components/input': InputExample,
  'components/item': ItemExample,
  'components/panel': PanelExample,
  'components/popover': PopoverExample,
  'components/profile': ProfileExample,
  'components/provider-button': ProviderButtonExample,
  'components/radio': RadioExample,
  'components/section': SectionExample,
  'components/segmented-control': SegmentedControlExample,
  'components/skeleton': SkeletonExample,
  'components/switcher': SwitcherExample,
  'components/table': TableExample,
  'components/text': TextExample,
};
