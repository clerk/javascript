import * as Primitives from '../primitives';
import { makeCustomizable } from './makeCustomizable';

export const Box = makeCustomizable(Primitives.Box);
export const Flex = makeCustomizable(Primitives.Flex);
export const Grid = makeCustomizable(Primitives.Grid);
export const Button = makeCustomizable(Primitives.Button);
export const BlockButtonIcon = makeCustomizable(Primitives.BlockButtonIcon);
export const Card = makeCustomizable(Primitives.Card);
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

export { AppearanceProvider, useAppearance } from './AppearanceContext';
export { descriptors } from './elementDescriptors';
