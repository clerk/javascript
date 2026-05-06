import type { LocalizationKey } from '@/customizables';

/**
 * A single breadcrumb item. Items are positional — their order in the
 * `items` array determines the displayed step number and which items
 * are reachable relative to the active one
 */
export interface BreadcrumbsItem {
  /**
   * Stable identifier — used as a React key and as the argument to
   * `onItemClick`
   */
  id: string;
  /**
   * Display label. Optional — items without a label render the bullet
   * only
   */
  label?: LocalizationKey | string;
  /**
   * Marks this item as completed regardless of its position relative
   * to `currentIndex`
   */
  isCompleted?: boolean;
}

export interface BreadcrumbsProps {
  /**
   * The items to render, in order
   */
  items: BreadcrumbsItem[];
  /**
   * Index of the currently active item. Items at indices `<= currentIndex`
   * are clickable; later items are disabled. `-1` means none active
   */
  currentIndex: number;
  /**
   * Called with the item's `id` when an item is clicked. Only fired
   * for reachable items (`isCompleted || index <= currentIndex`)
   */
  onItemClick: (id: string) => void;
}
