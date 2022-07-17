import * as Primitives from '../primitives';
import { makeCustomizable } from './makeCustomizable';

export const Flex = makeCustomizable(Primitives.Flex);
export const Col = makeCustomizable(Primitives.Col);
export const Grid = makeCustomizable(Primitives.Grid);
export const Button = makeCustomizable(Primitives.Button);
export const Heading = makeCustomizable(Primitives.Heading);
export const Link = makeCustomizable(Primitives.Link);
export const Text = makeCustomizable(Primitives.Text);
export const Image = makeCustomizable(Primitives.Image);
export const Alert = makeCustomizable(Primitives.Alert);
export const AlertIcon = makeCustomizable(Primitives.AlertIcon);
export const Input = makeCustomizable(Primitives.Input);
export const FormControl = makeCustomizable(Primitives.FormControl);
export const FormLabel = makeCustomizable(Primitives.FormLabel);
export const FormErrorText = makeCustomizable(Primitives.FormErrorText);
export const Form = makeCustomizable(Primitives.Form);
export const Icon = makeCustomizable(Primitives.Icon);
export const Spinner = makeCustomizable(Primitives.Spinner);
export const Badge = makeCustomizable(Primitives.Badge);

export * from './Flow';
export { AppearanceProvider, useAppearance } from './AppearanceContext';
export { descriptors } from './elementDescriptors';
export { generateFlowPartClassname } from './classGeneration';
