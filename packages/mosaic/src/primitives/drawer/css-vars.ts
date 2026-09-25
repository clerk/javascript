/**
 * The styling API for the drawer. The headless layer emits these raw inputs
 * (CSS custom properties + data attributes) and writes zero CSS. The styled
 * (mosaic) layer composes the actual `transform`/`opacity`/`calc()` chains from
 * them — names mirror base-ui's `DrawerPopupCssVars`, namespaced with `--cl-`.
 */
export const DrawerCssVars = {
  /** px live drag delta on the Y axis (0 at rest). */
  swipeY: '--cl-drawer-swipe-movement-y',
  /** 0..1 dismiss progress, drives the backdrop fade. */
  swipeProgress: '--cl-drawer-swipe-progress',
  /** px translateY of the active snap point at rest. */
  snapOffset: '--cl-drawer-snap-point-offset',
  /** 0.1..1 scalar from release velocity; the styled layer scales exit duration by it. */
  swipeStrength: '--cl-drawer-swipe-strength',
  /** px measured popup height (ResizeObserver). */
  height: '--cl-drawer-height',
  /** count of open nested drawers. */
  nestedCount: '--cl-drawer-nested-drawers',
  /** 0..1 dismiss progress of the frontmost nested child (drives the parent's live scale-in). */
  nestedDragProgress: '--cl-drawer-nested-drag-progress',
} as const;

export const DrawerAttrs = {
  /** On Popup/Backdrop during drag — the styled layer zeroes transition-duration so it follows the finger. */
  swiping: 'data-swiping',
  /** Active snap point index. */
  snap: 'data-snap',
  /** Present when the active snap point is the full-height one. */
  expanded: 'data-expanded',
  /** Present on a parent while one of its nested drawers is open. */
  nestedOpen: 'data-nested-drawer-open',
  /** Present on a parent while one of its nested drawers is being dragged. */
  nestedSwiping: 'data-nested-drawer-swiping',
  /** Present on a drawer that is itself nested inside another. */
  nested: 'data-nested',
  /** Marks the grip; also the hit-test target when `handleOnly` is set. */
  handle: 'data-drawer-handle',
  /** Consumer opt-out, read by `shouldDrag` to exclude a subtree from dragging. */
  noDrag: 'data-drawer-no-drag',
} as const;

/**
 * Registers the high-frequency vars as non-inheriting custom properties so the
 * browser can type/animate them cheaply. Safe to call repeatedly: it is a no-op
 * where `CSS.registerProperty` is unavailable (e.g. happy-dom) and swallows the
 * duplicate-registration error. Unregistered vars are still settable, so tests
 * and styling work regardless.
 */
export function registerDrawerCssVars(): void {
  if (typeof CSS === 'undefined' || !('registerProperty' in CSS)) {
    return;
  }
  const defs = [
    [DrawerCssVars.swipeY, '<length>', '0px'],
    [DrawerCssVars.snapOffset, '<length>', '0px'],
    [DrawerCssVars.swipeProgress, '<number>', '0'],
    [DrawerCssVars.nestedDragProgress, '<number>', '0'],
  ] as const;
  for (const [name, syntax, initialValue] of defs) {
    try {
      CSS.registerProperty({ name, syntax, inherits: false, initialValue });
    } catch {
      /* already registered */
    }
  }
}
