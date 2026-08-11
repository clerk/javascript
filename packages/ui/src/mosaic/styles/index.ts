// StyleX-only barrel: the entry for the isolated `build:mosaic` tsdown config.
// It re-exports every migrated (Emotion-free) Mosaic component plus the tokens
// and helpers, so the StyleX rollup plugin can walk this graph and extract one
// static `styles.css`. Keep it isolated from Emotion/un-migrated code — grow it
// as components migrate.

export type { MosaicComponentProps, MosaicElementProps } from '../props';

export { Avatar } from '../components/avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from '../components/avatar';
export { Badge } from '../components/badge';
export type { BadgeProps } from '../components/badge';
export { Button, SubmitButton } from '../components/button';
export type { ButtonProps, SpinDelayOptions, SubmitButtonProps } from '../components/button';
export { Card } from '../components/card';
export type { CardProps } from '../components/card';
export { Dialog } from '../components/dialog';
export type {
  DialogBackdropProps,
  DialogCloseButtonProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogPopupProps,
  DialogProps,
  DialogRootProps,
  DialogSize,
  DialogTitleProps,
  DialogTriggerProps,
  DialogViewportProps,
} from '../components/dialog';
export { Field } from '../components/field';
export type { FieldDescriptionProps, FieldErrorProps, FieldLabelProps, FieldRootProps } from '../components/field';
export { Heading, HeadingContext } from '../components/heading';
export type { HeadingProps } from '../components/heading';
export { Icon } from '../components/icon';
export type { IconProps } from '../components/icon';
export { Input } from '../components/input';
export type { InputProps } from '../components/input';
export { Item } from '../components/item';
export type { ItemProps } from '../components/item';
export { Menu } from '../components/menu';
export type {
  MenuContentProps,
  MenuItemProps,
  MenuProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from '../components/menu';
export { scrollAreaRoot, scrollAreaVars, scrollAreaViewport } from '../components/scroll-area';
export type { ScrollAreaGutter } from '../components/scroll-area';
export { Settings, settingsVars } from '../components/settings';
export type {
  SettingsActionsProps,
  SettingsContentProps,
  SettingsDescriptionProps,
  SettingsGroupProps,
  SettingsItemProps,
  SettingsItemsProps,
  SettingsLabelProps,
  SettingsMediaProps,
  SettingsMediaSize,
  SettingsRootProps,
  SettingsRowProps,
  SettingsTitleProps,
} from '../components/settings';
export { Spinner } from '../components/spinner';
export type { SpinnerProps } from '../components/spinner';
export { Text, TextContext } from '../components/text';
export type { TextProps } from '../components/text';
export { Popover } from '../components/popover';
export type {
  PopoverCloseProps,
  PopoverDescriptionProps,
  PopoverPopupProps,
  PopoverRootProps,
  PopoverSize,
  PopoverTitleProps,
  PopoverTriggerProps,
} from '../components/popover';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  scrollbarVars,
  scrollFadeVars,
  space,
  spacingVars,
  targetVars,
  typeScaleVars,
} from '../tokens.stylex';

export {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  scrollbarVars,
  scrollFadeVars,
  space,
  spacingVars,
  targetVars,
  typeScaleVars,
};

// Derived here, not in `tokens.stylex.ts`: `@stylexjs/enforce-extension` requires a
// `.stylex.ts` file to export nothing but its `defineVars` results. The vars are keyed
// by the same `--cl-*` names, so `keyof typeof …Vars` reproduces each token union.
export type ColorVarName = keyof typeof colorVars;
export type DurationVarName = keyof typeof durationVars;
export type EasingVarName = keyof typeof easingVars;
export type FontFamilyVarName = keyof typeof fontFamilyVars;
export type FontWeightVarName = keyof typeof fontWeightVars;
export type RadiusVarName = keyof typeof radiusVars;
export type ScrollbarVarName = keyof typeof scrollbarVars;
export type ScrollFadeVarName = keyof typeof scrollFadeVars;
export type SpacingVarName = keyof typeof spacingVars;
export type TargetVarName = keyof typeof targetVars;
export type TypeScaleVarName = keyof typeof typeScaleVars;
export { mergeStyleProps, themeProps } from '../props';
