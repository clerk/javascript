/**
 * A bottom sheet: `Drawer.Root` holds the state, `Drawer.Trigger` opens it, and `Drawer.Popup`
 * renders the sheet with its scrim, portal and grip. `Drawer.Title` and `Drawer.Description` name
 * and describe it; `Drawer.Close` dismisses it from inside. Drag it down, press Escape, or press
 * outside to dismiss.
 */
export * as Drawer from './drawer.parts';
export type {
  DrawerCloseProps,
  DrawerDescriptionProps,
  DrawerPopupProps,
  DrawerRootProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './drawer';
export type { DrawerFocusTarget } from '../../primitives/drawer';
