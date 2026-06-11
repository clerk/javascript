import { Dialog as HeadlessDialog } from '@clerk/headless/dialog';
import type { DialogPortalProps, DialogProps } from '@clerk/headless/dialog';
import type { FunctionComponent } from 'react';

import { withMosaicSlot } from './withMosaicSlot';

/**
 * The headless dialog parts bridged into mosaic. Each styleable part is wrapped
 * with `withMosaicSlot`, which forwards its ref and accepts the per-slot props a
 * recipe produces (`css`, `data-cl-slot`, state attrs) — the bridged type is
 * inferred, so there is nothing to hand-annotate per part.
 *
 * The structural parts (`Root`, `Portal`) render no element of their own and
 * pass through unchanged; they are cast to their public component types so the
 * inferred `Dialog` type stays portable (otherwise it references internal
 * `@clerk/headless` declaration paths).
 */
export const Dialog = {
  Root: HeadlessDialog.Root as FunctionComponent<DialogProps>,
  Trigger: withMosaicSlot(HeadlessDialog.Trigger),
  Portal: HeadlessDialog.Portal as FunctionComponent<DialogPortalProps>,
  Backdrop: withMosaicSlot(HeadlessDialog.Backdrop),
  Viewport: withMosaicSlot(HeadlessDialog.Viewport),
  Popup: withMosaicSlot(HeadlessDialog.Popup),
  Title: withMosaicSlot(HeadlessDialog.Title),
  Description: withMosaicSlot(HeadlessDialog.Description),
  Close: withMosaicSlot(HeadlessDialog.Close),
};
