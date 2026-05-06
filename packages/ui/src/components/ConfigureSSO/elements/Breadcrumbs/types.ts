import type React from 'react';

import type { LocalizationKey } from '@/customizables';

/**
 * Props for `<Breadcrumbs.Item>`. Items are renderless descriptors —
 * Breadcrumbs walks its children to collect them
 */
export interface BreadcrumbsItemProps {
  /** Stable identifier — used as React key, as the value compared against `Breadcrumbs.currentId`, and as the argument to `onItemClick` */
  id: string;
  /** Display label. Optional — items without a label render the bullet only */
  label?: LocalizationKey | string;
  /** Marks this item as completed regardless of its position relative to the current item */
  isCompleted?: boolean;
}

/**
 * Internal descriptor extracted from a `<Breadcrumbs.Item>` element's
 * props. Consumers should not need to construct these directly
 */
export interface BreadcrumbsActiveItem {
  id: string;
  label?: LocalizationKey | string;
  isCompleted?: boolean;
}

export interface BreadcrumbsProps {
  /** ID of the currently active item. Items at indices ≤ currentIndex are reachable; later items are disabled. `undefined` means none active */
  currentId: string | undefined;
  /** Called with the item's id when an item is clicked. Only fired for reachable items. */
  onItemClick: (id: string) => void;
  /** `<Breadcrumbs.Item>` descriptors to render */
  children: React.ReactNode;
}
