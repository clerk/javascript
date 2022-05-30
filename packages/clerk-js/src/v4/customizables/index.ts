import * as Primitives from '../primitives';
import { makeCustomizable } from './makeCustomizable';

export const Box = makeCustomizable(Primitives.Box);
export const Flex = makeCustomizable(Primitives.Flex);
export const Button = makeCustomizable(Primitives.Button);
export const Card = makeCustomizable(Primitives.Card);
export const Heading = makeCustomizable(Primitives.Heading);
export const Input = makeCustomizable(Primitives.Input);
export const Link = makeCustomizable(Primitives.Link);
export const Text = makeCustomizable(Primitives.Text);

export { AppearanceProvider } from './AppearanceContext';
export { descriptors } from './elementDescriptors';
