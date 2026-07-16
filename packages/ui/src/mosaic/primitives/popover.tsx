import type { PopoverPortalProps, PopoverProps } from '@clerk/headless/popover';
import { Popover as HeadlessPopover } from '@clerk/headless/popover';
import type { FunctionComponent } from 'react';

import { withMosaicSlot } from './withMosaicSlot';

/**
 * The headless popover parts bridged into mosaic. Each styleable part is wrapped
 * with `withMosaicSlot`, which forwards its ref and accepts the per-slot props a
 * recipe produces (`css`, `data-cl-slot`, state attrs) — the bridged type is
 * inferred, so there is nothing to hand-annotate per part.
 *
 * The structural parts (`Root`, `Portal`) render no element of their own and
 * pass through unchanged; they are cast to their public component types so the
 * inferred `Popover` type stays portable (otherwise it references internal
 * `@clerk/headless` declaration paths).
 */
export const Popover = {
  Root: HeadlessPopover.Root as FunctionComponent<PopoverProps>,
  Trigger: withMosaicSlot(HeadlessPopover.Trigger),
  Portal: HeadlessPopover.Portal as FunctionComponent<PopoverPortalProps>,
  Positioner: withMosaicSlot(HeadlessPopover.Positioner),
  Popup: withMosaicSlot(HeadlessPopover.Popup),
  Arrow: withMosaicSlot(HeadlessPopover.Arrow),
  Title: withMosaicSlot(HeadlessPopover.Title),
  Description: withMosaicSlot(HeadlessPopover.Description),
  Close: withMosaicSlot(HeadlessPopover.Close),
};
