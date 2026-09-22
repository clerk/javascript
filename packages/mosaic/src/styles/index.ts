// StyleX-only barrel: the entry for the isolated CSS tsdown config.
// It re-exports every Mosaic component plus the tokens and helpers, so the
// StyleX rollup plugin can walk this graph and extract one static `styles.css`.

export type { MosaicComponentProps, MosaicElementProps } from '../props';
export { Avatar } from '../components/avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps, AvatarIconProps } from '../components/avatar';
export { Badge } from '../components/badge';
export type { BadgeProps } from '../components/badge';
export { Banner } from '../components/banner';
export { Branding } from '../components/branding';
export type { BrandingProps } from '../components/branding';
export type { BannerDescriptionProps, BannerLabelProps, BannerRootProps } from '../components/banner';
export { Button, SubmitButton } from '../components/button';
export type { ButtonProps, SpinDelayOptions, SubmitButtonProps } from '../components/button';
export { Card } from '../components/card';
export { Checkbox } from '../components/checkbox';
export type { CheckboxProps } from '../components/checkbox';
export type { CardProps } from '../components/card';
export { Drawer } from '../components/drawer';
export type {
  DrawerCloseProps,
  DrawerDescriptionProps,
  DrawerPopupProps,
  DrawerRootProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from '../components/drawer';
export { EmptyState } from '../components/empty-state';
export type {
  EmptyStateActionsProps,
  EmptyStateDescriptionProps,
  EmptyStateIconProps,
  EmptyStateProps,
  EmptyStateLabelProps,
} from '../components/empty-state';
export { Combobox } from '../components/combobox';
export type {
  ComboboxEmptyProps,
  ComboboxInputProps,
  ComboboxListProps,
  ComboboxOptionProps,
  ComboboxPopupProps,
  ComboboxRootProps,
  ComboboxSize,
} from '../components/combobox';
export { DataList } from '../components/data-list';
export type { DataListProps } from '../components/data-list';
export { Dialog } from '../components/dialog';
export type {
  DialogCloseButtonProps,
  DialogCloseProps,
  DialogCompactPlacement,
  DialogPopupProps,
  DialogRootProps,
  DialogVariant,
  DialogTriggerProps,
} from '../components/dialog';
export { Field } from '../components/field';
export type { FieldDescriptionProps, FieldErrorProps, FieldLabelProps, FieldRootProps } from '../components/field';
export { Flow, useFlowAutoFocus } from '../components/flow';
export type { FlowRootProps, FlowStepProps } from '../components/flow';
export { Heading, HeadingContext } from '../components/heading';
export type { HeadingProps } from '../components/heading';
export { Icon, IconFrame } from '../components/icon';
export type { IconFrameProps, IconProps } from '../components/icon';
export { Input } from '../components/input';
export type { InputProps, InputVariant } from '../components/input';
export { InputGroup } from '../components/input-group';
export type { InputGroupAddonProps, InputGroupRootProps } from '../components/input-group';
export { Pagination } from '../components/pagination';
export type { PaginationProps } from '../components/pagination';
export { PhoneInput } from '../components/phone-input';
export type { CountryIso, PhoneInputProps } from '../components/phone-input';
export { Item } from '../components/item';
export type { ItemProps } from '../components/item';
export { Menu } from '../components/menu';
export { Otp } from '../components/otp';
export type { OtpProps, OtpStatus } from '../components/otp';
export type {
  MenuItemProps,
  MenuLabelProps,
  MenuMediaProps,
  MenuMediaSize,
  MenuPopupProps,
  MenuProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from '../components/menu';
export { scrollAreaRoot, scrollAreaVars, scrollAreaViewport } from '../components/scroll-area';
export type { ScrollAreaAxis, ScrollAreaGutter } from '../components/scroll-area';
export { Select } from '../components/select';
export type {
  SelectItem,
  SelectOptionProps,
  SelectPopupProps,
  SelectProps,
  SelectTriggerProps,
  SelectTriggerVariant,
} from '../components/select';
export { Table } from '../components/table';
export type {
  TableAlign,
  TableBodyProps,
  TableCellProps,
  TableEmptyProps,
  TableHeaderCellProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  TableSelectAllCellProps,
  TableSelectCellProps,
  TableSort,
} from '../components/table';
export { Tabs } from '../components/tabs';
export type {
  TabsIndicatorProps,
  TabsListProps,
  TabsPanelProps,
  TabsPanelsProps,
  TabsRootProps,
  TabsTabProps,
  TabsTriggerProps,
} from '../components/tabs';
export { Section } from '../components/section';
export type {
  SectionActionsProps,
  SectionContentProps,
  SectionDescriptionProps,
  SectionGroupProps,
  SectionItemProps,
  SectionItemsProps,
  SectionLabelProps,
  SectionMediaProps,
  SectionMediaSize,
  SectionRootProps,
  SectionRowProps,
  SectionTitleProps,
} from '../components/section';
export { Spinner } from '../components/spinner';
export type { SpinnerProps } from '../components/spinner';
export { Text, TextContext } from '../components/text';
export type { TextProps } from '../components/text';
export { useToastManager } from '../components/toast';
export type { ToastType } from '../components/toast';
export { Tooltip } from '../components/tooltip';
export type { TooltipPopupProps, TooltipRootProps, TooltipTriggerProps } from '../components/tooltip';
export { VisuallyHidden } from '../components/visually-hidden';
export type { VisuallyHiddenProps } from '../components/visually-hidden';
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
export { Profile } from '../components/profile';
export type {
  ProfileContentProps,
  ProfileElevation,
  ProfileNavItemProps,
  ProfileNavProps,
  ProfileContentPanelProps,
  ProfilePageTitleProps,
  ProfileRootProps,
  ProfileTitleProps,
} from '../components/profile';
export { UserButton } from '../features/user-button/user-button';

import {
  colorVars,
  durationVars,
  easingVars,
  focusVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  scrollbarVars,
  scrollFadeVars,
  shadowVars,
  space,
  spacingVars,
  targetVars,
  typeScaleVars,
} from '../tokens.stylex';

export {
  colorVars,
  durationVars,
  easingVars,
  focusVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  scrollbarVars,
  scrollFadeVars,
  shadowVars,
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
export type FocusVarName = keyof typeof focusVars;
export type ShadowVarName = keyof typeof shadowVars;
export type FontFamilyVarName = keyof typeof fontFamilyVars;
export type FontWeightVarName = keyof typeof fontWeightVars;
export type RadiusVarName = keyof typeof radiusVars;
export type ScrollbarVarName = keyof typeof scrollbarVars;
export type ScrollFadeVarName = keyof typeof scrollFadeVars;
export type SpacingVarName = keyof typeof spacingVars;
export type TargetVarName = keyof typeof targetVars;
export type TypeScaleVarName = keyof typeof typeScaleVars;
export { mergeStyleProps, themeProps } from '../props';
export { UserProfileMfaSectionView } from '../features/user-profile/user-profile-mfa-section.view';
export { UserProfileMfaSetupView } from '../features/user-profile/user-profile-mfa-setup.view';

export { UserProfileApiKeysPanelView } from '../features/user-profile/user-profile-api-keys-panel.view';
