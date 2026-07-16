import { Tabs as HeadlessTabs } from '@clerk/headless/tabs';
import type { TabsProps } from '@clerk/headless/tabs';
import type { FunctionComponent } from 'react';

import { withMosaicSlot } from './withMosaicSlot';

/**
 * The headless tabs parts bridged into mosaic. Each styleable part is wrapped
 * with `withMosaicSlot`, which forwards its ref and accepts the per-slot props a
 * recipe produces (`css`, `data-cl-slot`, state attrs) — the bridged type is
 * inferred, so there is nothing to hand-annotate per part.
 *
 * `Root` renders no element of its own (it is a context provider) and passes
 * through unchanged; it is cast to its public component type so the inferred
 * `Tabs` type stays portable (otherwise it references internal `@clerk/headless`
 * declaration paths).
 */
export const Tabs = {
  Root: HeadlessTabs.Root as FunctionComponent<TabsProps>,
  List: withMosaicSlot(HeadlessTabs.List),
  Tab: withMosaicSlot(HeadlessTabs.Tab),
  Trigger: withMosaicSlot(HeadlessTabs.Trigger),
  Panel: withMosaicSlot(HeadlessTabs.Panel),
  Indicator: withMosaicSlot(HeadlessTabs.Indicator),
};
