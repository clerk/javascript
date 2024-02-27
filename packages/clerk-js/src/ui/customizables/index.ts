import { makeLocalizable } from '../localization';
import * as Primitives from '../primitives';
import { descriptors } from './elementDescriptors';
import { makeCustomizable } from './makeCustomizable';
import { makeResponsive } from './makeResponsive';
import { sanitizeDomProps } from './sanitizeDomProps';

export * from './Flow';
export { AppearanceProvider, useAppearance } from './AppearanceContext';
export { descriptors } from './elementDescriptors';
export { localizationKeys, useLocalizations } from '../localization';
export type { LocalizationKey } from '../localization';
export { generateFlowPartClassname } from './classGeneration';

export const Box = makeCustomizable(sanitizeDomProps(Primitives.Box));
export const Flex = makeCustomizable(sanitizeDomProps(Primitives.Flex));
export const Col = makeCustomizable(sanitizeDomProps(Primitives.Col));
export const Grid = makeCustomizable(sanitizeDomProps(Primitives.Grid));

export const Button = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Button)), {
  defaultDescriptor: descriptors.button,
});
export const SimpleButton = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.SimpleButton)), {
  defaultDescriptor: descriptors.button,
});

export const Heading = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Heading)));
export const Link = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Link)));
export const Text = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Text)));
export const Image = makeCustomizable(sanitizeDomProps(makeResponsive(Primitives.Image)));

export const Alert = makeCustomizable(sanitizeDomProps(Primitives.Alert));
export const AlertIcon = makeCustomizable(sanitizeDomProps(Primitives.AlertIcon));
export const Input = makeCustomizable(sanitizeDomProps(Primitives.Input), { defaultDescriptor: descriptors.input });
export const CheckboxInput = makeCustomizable(sanitizeDomProps(Primitives.Input), {
  defaultDescriptor: descriptors.checkboxInput,
});
export const RadioInput = makeCustomizable(sanitizeDomProps(Primitives.Input), {
  defaultDescriptor: descriptors.radioInput,
});
export const FormLabel = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.FormLabel)));
export const FormErrorText = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.FormErrorText)));
export const FormSuccessText = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.FormSuccessText)));
export const FormWarningText = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.FormWarningText)));
export const FormInfoText = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.FormInfoText)));
export const Form = makeCustomizable(sanitizeDomProps(Primitives.Form));
export const Icon = makeCustomizable(sanitizeDomProps(Primitives.Icon));
export const Spinner = makeCustomizable(sanitizeDomProps(Primitives.Spinner));
export const Badge = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Badge)), {
  defaultDescriptor: descriptors.badge,
});

export const NotificationBadge = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.NotificationBadge)), {
  defaultDescriptor: descriptors.notificationBadge,
});

export const Table = makeCustomizable(sanitizeDomProps(Primitives.Table), { defaultDescriptor: descriptors.table });
export const Thead = makeCustomizable(sanitizeDomProps(Primitives.Thead));
export const Tbody = makeCustomizable(sanitizeDomProps(Primitives.Tbody));
export const Tr = makeCustomizable(sanitizeDomProps(Primitives.Tr));
export const Th = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Th)));
export const Td = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Td)));
