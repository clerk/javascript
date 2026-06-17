import { Select as HeadlessSelect } from '@clerk/headless/select';
import type { SelectPortalProps, SelectProps } from '@clerk/headless/select';
import type { FunctionComponent } from 'react';

import { withMosaicSlot } from './withMosaicSlot';

export const Select = {
  Root: HeadlessSelect.Root as FunctionComponent<SelectProps>,
  Trigger: withMosaicSlot(HeadlessSelect.Trigger),
  Value: withMosaicSlot(HeadlessSelect.Value),
  Portal: HeadlessSelect.Portal as FunctionComponent<SelectPortalProps>,
  Positioner: withMosaicSlot(HeadlessSelect.Positioner),
  Popup: withMosaicSlot(HeadlessSelect.Popup),
  Option: withMosaicSlot(HeadlessSelect.Option),
  Arrow: withMosaicSlot(HeadlessSelect.Arrow),
};
