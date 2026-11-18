/**
 * Mosaic `Dialog` — a modal surface built on the `primitives/dialog` primitive, composed
 * via dot syntax:
 *
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
 *   <Dialog.Popup>
 *     <Card.Root elevation='overlay'>
 *       <Card.Header>
 *         <Card.Title>…</Card.Title>
 *         <Card.Description>…</Card.Description>
 *       </Card.Header>
 *     </Card.Root>
 *   </Dialog.Popup>
 * </Dialog.Root>
 * ```
 *
 * The dialog brings the geometry, the motion and the floating tree; the SURFACE comes from what
 * is rendered inside it — a `Card` for a `card`, a `Profile` for a `profile`. Those surfaces read
 * `DialogContext`, so `Card.Title` names the dialog and `Card.Header` carries its dismiss without
 * either knowing it is in one.
 *
 * `Dialog.Popup` renders the portal, the scrim and the centering viewport itself, so those are
 * not parts. `role='alertdialog'` on the root makes it an alert dialog — one that interrupts to
 * ask for a decision and waits for one. In the compact band a card is a bottom sheet unless
 * `compactPlacement='center'`.
 *
 * Each styled part spreads `themeProps` + `stylex.props` through `mergeStyleProps`, so it
 * carries the public `.cl-<slot>` class and StyleX atoms while the headless part keeps its focus
 * management, scroll lock, and ARIA wiring.
 */
export * as Dialog from './dialog.parts';
export { DialogContext, isInDialog } from './dialog';
export type { DialogFocusTarget, DialogHandle, DialogOpenChangeDetails, DialogRole } from '../../primitives/dialog';
export type {
  DialogCloseButtonProps,
  DialogCloseProps,
  DialogContextValue,
  DialogCompactPlacement,
  DialogPopupProps,
  DialogRootProps,
  DialogVariant,
  DialogTriggerProps,
} from './dialog';
