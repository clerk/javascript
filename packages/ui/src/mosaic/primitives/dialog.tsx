import { Dialog as HeadlessDialog } from '@clerk/headless/dialog';
import type { DialogPortalProps, DialogProps } from '@clerk/headless/dialog';
import type { FunctionComponent } from 'react';

import { withMosaicTheme } from './withMosaicTheme';

/**
 * The headless dialog parts bridged into mosaic. Each styleable part is wrapped
 * with `withMosaicTheme`, which forwards its ref and adds the `sx` prop — the
 * bridged type is inferred, so there is nothing to hand-annotate per part.
 *
 * The structural parts (`Root`, `Portal`) render no element of their own and
 * pass through unchanged; they are cast to their public component types so the
 * inferred `Dialog` type stays portable (otherwise it references internal
 * `@clerk/headless` declaration paths).
 */
export const Dialog = {
  Root: HeadlessDialog.Root as FunctionComponent<DialogProps>,
  Trigger: withMosaicTheme(HeadlessDialog.Trigger),
  Portal: HeadlessDialog.Portal as FunctionComponent<DialogPortalProps>,
  Backdrop: withMosaicTheme(HeadlessDialog.Backdrop),
  Viewport: withMosaicTheme(HeadlessDialog.Viewport),
  Popup: withMosaicTheme(HeadlessDialog.Popup),
  Title: withMosaicTheme(HeadlessDialog.Title),
  Description: withMosaicTheme(HeadlessDialog.Description),
  Close: withMosaicTheme(HeadlessDialog.Close),
};
