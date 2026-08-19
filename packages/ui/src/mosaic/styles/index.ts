// StyleX-only barrel: the entry for the isolated `build:mosaic` tsdown config.
// It re-exports every migrated (Emotion-free) Mosaic component plus the tokens
// and helpers, so the StyleX rollup plugin can walk this graph and extract one
// static `styles.css`. Keep it isolated from Emotion/un-migrated code — grow it
// as components migrate.

export type { MosaicComponentProps, MosaicElementProps } from '../props';
export { ProfilePage } from '../profile-page';
export type {
  ProfilePageContentProps,
  ProfilePageItem,
  ProfilePagePanelProps,
  ProfilePageRootProps,
  ProfilePageSidebarProps,
} from '../profile-page';

export { AlertDialog, createConfirmHandle, useConfirmedClose } from '../components/alert-dialog';
export type {
  ConfirmHandle,
  ConfirmOptions,
  UseConfirmedCloseOptions,
  AlertDialogActionsProps,
  AlertDialogBackdropProps,
  AlertDialogCloseProps,
  AlertDialogConfirmProps,
  AlertDialogDescriptionProps,
  AlertDialogPopupProps,
  AlertDialogProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
  AlertDialogViewportProps,
} from '../components/alert-dialog';
export { Avatar } from '../components/avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps, AvatarIconProps } from '../components/avatar';
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
export type { MosaicIconOverride, MosaicIconOverrides } from '../icons/overrides';
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

export { OrganizationPageView } from '../organization-profile/organization-page.view';
export type { OrganizationPagePanels, OrganizationPageViewProps } from '../organization-profile/organization-page.view';
export { OrganizationProfileDangerSectionView } from '../organization-profile/organization-profile-danger-section.view';
export type { OrganizationProfileDangerSectionViewProps } from '../organization-profile/organization-profile-danger-section.view';
export { OrganizationProfileDetailsSectionView } from '../organization-profile/organization-profile-details-section.view';
export type { OrganizationProfileDetailsSectionViewProps } from '../organization-profile/organization-profile-details-section.view';
export { OrganizationProfileGeneralPanelView } from '../organization-profile/organization-profile-general-panel.view';
export type { OrganizationProfileGeneralPanelViewProps } from '../organization-profile/organization-profile-general-panel.view';
export { OrganizationProfileMembersPanelView } from '../organization-profile/organization-profile-members-panel.view';
export type { OrganizationProfileMembersPanelViewProps } from '../organization-profile/organization-profile-members-panel.view';
export { OrganizationProfileMembersSectionView } from '../organization-profile/organization-profile-members-section.view';
export type {
  OrganizationProfileMember,
  OrganizationProfileMembersPagination,
  OrganizationProfileMembersSectionViewProps,
  OrganizationProfileMemberStatus,
} from '../organization-profile/organization-profile-members-section.view';
export { OrganizationProfileBillingPanelView } from '../organization-profile/organization-profile-billing-panel.view';
export type { OrganizationProfileBillingPanelViewProps } from '../organization-profile/organization-profile-billing-panel.view';
export { OrganizationProfileInvoicesSectionView } from '../organization-profile/organization-profile-invoices-section.view';
export type {
  OrganizationProfileInvoice,
  OrganizationProfileInvoicesPagination,
  OrganizationProfileInvoicesSectionViewProps,
} from '../organization-profile/organization-profile-invoices-section.view';
export { OrganizationProfilePaymentMethodsSectionView } from '../organization-profile/organization-profile-payment-methods-section.view';
export type {
  OrganizationProfilePaymentMethod,
  OrganizationProfilePaymentMethodsSectionViewProps,
} from '../organization-profile/organization-profile-payment-methods-section.view';
export { OrganizationProfileSecurityPanelView } from '../organization-profile/organization-profile-security-panel.view';
export type { OrganizationProfileSecurityPanelViewProps } from '../organization-profile/organization-profile-security-panel.view';
export { OrganizationProfileSsoSectionView } from '../organization-profile/organization-profile-sso-section.view';
export type {
  OrganizationProfileSsoConnection,
  OrganizationProfileSsoSectionViewProps,
} from '../organization-profile/organization-profile-sso-section.view';
export { OrganizationProfileSubscriptionSectionView } from '../organization-profile/organization-profile-subscription-section.view';
export type {
  OrganizationProfileSeatLineItem,
  OrganizationProfileSubscription,
  OrganizationProfileSubscriptionSectionViewProps,
} from '../organization-profile/organization-profile-subscription-section.view';
export { OrganizationProfileVerifiedDomainsSectionView } from '../organization-profile/organization-profile-verified-domains-section.view';
export type {
  OrganizationProfileVerifiedDomain,
  OrganizationProfileVerifiedDomainsSectionViewProps,
} from '../organization-profile/organization-profile-verified-domains-section.view';
export type { OrganizationProfilePanelId } from '../organization-profile/organization-profile-sidebar';
export { UserPageView } from '../user-profile/user-page.view';
export type { UserPagePanels, UserPageViewProps } from '../user-profile/user-page.view';

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
