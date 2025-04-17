import type { ElementObjectKey, ElementsConfig, IdSelectors, StateSelectors } from '@clerk/types';

import { containsAllOfType, fromEntries } from '../utils';

export const CLASS_PREFIX = 'cl-';
export const ID_CLASS_PREFIX = 'cl-id-';
export const OBJ_KEY_DELIMITER = '__';

const containsAllElementsConfigKeys = containsAllOfType<keyof ElementsConfig>();
const camelize = (s: string) => s.replace(/-./g, x => x[1].toUpperCase());
/**
 * This object is strictly typed using the ElementsConfig type
 * and is used as the single source of truth to generate the
 * descriptor map
 */
export const APPEARANCE_KEYS = containsAllElementsConfigKeys([
  'button',
  'input',
  'checkbox',
  'radio',
  'table',

  'rootBox',
  'cardBox',
  'card',
  'footerItem',
  'popoverBox',

  'disclosureRoot',
  'disclosureTrigger',
  'disclosureContentRoot',
  'disclosureContentInner',
  'disclosureContent',

  'lineItemsRoot',
  'lineItemsDivider',
  'lineItemsGroup',
  'lineItemsTitle',
  'lineItemsTitleDescription',
  'lineItemsDescription',
  'lineItemsDescriptionInner',
  'lineItemsDescriptionSuffix',
  'lineItemsDescriptionPrefix',
  'lineItemsDescriptionText',
  'lineItemsCopyButton',

  'actionCard',

  'logoBox',
  'logoImage',

  'header',
  'headerTitle',
  'headerSubtitle',
  'headerBackLink',

  'main',

  'footer',
  'footerAction',
  'footerActionText',
  'footerActionLink',
  'footerPages',
  'footerPagesLink',

  'backRow',
  'backLink',

  'socialButtonsRoot',
  'socialButtons',
  'socialButtonsIconButton',
  'socialButtonsBlockButton',
  'socialButtonsBlockButtonText',
  'socialButtonsProviderIcon',
  'socialButtonsProviderInitialIcon',

  'enterpriseButtonsProviderIcon',

  'providerIcon',
  'providerInitialIcon',

  'alternativeMethods',
  'alternativeMethodsBlockButton',
  'alternativeMethodsBlockButtonText',
  'alternativeMethodsBlockButtonArrow',

  'checkoutFormLineItemsRoot',
  'checkoutFormElementsRoot',

  'checkoutSuccessRoot',
  'checkoutSuccessRing',
  'checkoutSuccessBadge',
  'checkoutSuccessTitle',
  'checkoutSuccessDescription',

  'otpCodeField',
  'otpCodeFieldInputs',
  'otpCodeFieldInput',
  'otpCodeFieldErrorText',
  'formResendCodeLink',

  'dividerRow',
  'dividerText',
  'dividerLine',

  'drawerBackdrop',
  'drawerContent',
  'drawerHeader',
  'drawerTitle',
  'drawerBody',
  'drawerFooter',
  'drawerFooterTitle',
  'drawerFooterDescription',
  'drawerClose',
  'drawerConfirmationBackdrop',
  'drawerConfirmationRoot',
  'drawerConfirmationTitle',
  'drawerConfirmationDescription',
  'drawerConfirmationActions',

  'formHeader',
  'formHeaderTitle',
  'formHeaderSubtitle',

  'verificationLinkStatusBox',
  'verificationLinkStatusIconBox',
  'verificationLinkStatusIcon',
  'verificationLinkStatusText',

  'form',
  'formContainer',
  'formFieldRow',
  'formField',
  'formFieldLabelRow',
  'formFieldLabel',
  'formFieldRadioGroup',
  'formFieldRadioGroupItem',
  'formFieldRadioInput',
  'formFieldRadioLabel',
  'formFieldRadioLabelTitle',
  'formFieldRadioLabelDescription',
  'formFieldCheckboxInput',
  'formFieldCheckboxLabel',
  'formFieldAction',
  'formFieldInput',
  'formFieldErrorText',
  'formFieldWarningText',
  'formFieldSuccessText',
  'formFieldInfoText',
  'formFieldHintText',
  'formButtonPrimary',
  'formButtonReset',
  'formFieldInputGroup',
  'formFieldInputShowPasswordButton',
  'formFieldInputShowPasswordIcon',
  'formFieldInputCopyToClipboardButton',
  'formFieldInputCopyToClipboardIcon',

  'phoneInputBox',
  'formInputGroup',

  'avatarBox',
  'avatarImage',
  'avatarImageActions',
  'avatarImageActionsUpload',
  'avatarImageActionsRemove',

  'userButtonBox',
  'userButtonOuterIdentifier',
  'userButtonTrigger',
  'userButtonAvatarBox',
  'userButtonAvatarImage',
  'userButtonPopoverRootBox',
  'userButtonPopoverCard',
  'userButtonPopoverMain',
  'userButtonPopoverActions',
  'userButtonPopoverActionButton',
  'userButtonPopoverActionButtonIconBox',
  'userButtonPopoverActionButtonIcon',
  'userButtonPopoverCustomItemButton',
  'userButtonPopoverCustomItemButtonIconBox',
  'userButtonPopoverActionItemButtonIcon',
  'userButtonPopoverFooter',
  'userButtonPopoverFooterPagesLink',

  'organizationSwitcherTrigger',
  'organizationSwitcherTriggerIcon',
  'organizationSwitcherPopoverRootBox',
  'organizationSwitcherPopoverCard',
  'organizationSwitcherPopoverMain',
  'organizationSwitcherPopoverActions',
  'organizationSwitcherPopoverInvitationActions',
  'organizationSwitcherPopoverInvitationActionsBox',
  'organizationSwitcherPopoverActionButton',
  'organizationSwitcherPreviewButton',
  'organizationSwitcherInvitationAcceptButton',
  'organizationSwitcherPopoverActionButtonIconBox',
  'organizationSwitcherPopoverActionButtonIcon',
  'organizationSwitcherPopoverFooter',

  'organizationProfileMembersSearchInputIcon',
  'organizationProfileMembersSearchInput',

  'organizationListPreviewItems',
  'organizationListPreviewItem',
  'organizationListPreviewButton',
  'organizationListPreviewItemActionButton',
  'organizationListCreateOrganizationActionButton',

  'userPreview',
  'userPreviewAvatarContainer',
  'userPreviewAvatarBox',
  'userPreviewAvatarImage',
  'userPreviewAvatarIcon',
  'userPreviewTextContainer',
  'userPreviewMainIdentifier',
  'userPreviewSecondaryIdentifier',

  'organizationPreview',
  'organizationPreviewAvatarContainer',
  'organizationPreviewAvatarBox',
  'organizationPreviewAvatarImage',
  'organizationPreviewTextContainer',
  'organizationPreviewMainIdentifier',
  'organizationPreviewSecondaryIdentifier',

  'organizationAvatarUploaderContainer',

  'membersPageInviteButton',

  'identityPreview',
  'identityPreviewText',
  'identityPreviewEditButton',
  'identityPreviewEditButtonIcon',

  'passkeyIcon',

  'accountSwitcherActionButton',
  'accountSwitcherActionButtonIconBox',
  'accountSwitcherActionButtonIcon',

  'pricingTable',
  'pricingTableCard',
  'pricingTableCardHeader',
  'pricingTableCardTitle',
  'pricingTableCardDescription',
  'pricingTableCardAvatarBadgeContainer',
  'pricingTableCardAvatar',
  'pricingTableCardBadgeContainer',
  'pricingTableCardBadge',
  'pricingTableCardFeatures',
  'pricingTableCardFeaturesList',
  'pricingTableCardFeaturesListItem',
  'pricingTableCardFeaturesListItemContent',
  'pricingTableCardFeaturesListItemTitle',
  'pricingTableCardFeaturesListItemDescription',
  'pricingTableCardAction',
  'pricingTableCardPeriodToggle',
  'pricingTableCardFeeContainer',
  'pricingTableCardFee',
  'pricingTableCardFeePeriod',
  'pricingTableCardFeePeriodNotice',
  'pricingTableCardFeePeriodNoticeInner',
  'pricingTableCardFeePeriodNoticeLabel',

  'pricingTableMatrixRoot',
  'pricingTableMatrixTable',
  'pricingTableMatrixRowGroup',
  'pricingTableMatrixRowGroupHeader',
  'pricingTableMatrixRowGroupBody',
  'pricingTableMatrixRow',
  'pricingTableMatrixRowHeader',
  'pricingTableMatrixRowBody',
  'pricingTableMatrixColumnHeader',
  'pricingTableMatrixCell',
  'pricingTableMatrixCellFooter',
  'pricingTableMatrixAvatar',
  'pricingTableMatrixBadge',
  'pricingTableMatrixPlanName',
  'pricingTableMatrixFee',
  'pricingTableMatrixFeePeriod',
  'pricingTableMatrixFeePeriodNotice',
  'pricingTableMatrixFeePeriodNoticeInner',
  'pricingTableMatrixFeePeriodNoticeLabel',
  'pricingTableMatrixFooter',

  'subscriptionDetailHeader',
  'subscriptionDetailAvatarBadgeContainer',
  'subscriptionDetailAvatar',
  'subscriptionDetailBadgeContainer',
  'subscriptionDetailBadge',
  'subscriptionDetailTitle',
  'subscriptionDetailDescription',
  'subscriptionDetailAction',
  'subscriptionDetailFeeContainer',
  'subscriptionDetailFee',
  'subscriptionDetailFeePeriod',
  'subscriptionDetailFeePeriodNotice',
  'subscriptionDetailFeePeriodNoticeInner',
  'subscriptionDetailFeePeriodNoticeLabel',
  'subscriptionDetailFeatures',
  'subscriptionDetailFeaturesList',
  'subscriptionDetailFeaturesListItem',
  'subscriptionDetailFeaturesListItemContent',
  'subscriptionDetailFeaturesListItemTitle',
  'subscriptionDetailFeaturesListItemDescription',

  'segmentedControlRoot',
  'segmentedControlButton',

  'alert',
  'alertIcon',
  'alertText',
  'alertTextContainer',

  'tagInputContainer',
  'tagPillIcon',
  'tagPillContainer',

  'tabPanel',
  'tabButton',
  'tabListContainer',

  'tableHead',

  'paginationButton',
  'paginationButtonIcon',
  'paginationRowText',

  'selectButton',
  'selectSearchInput',
  'selectButtonIcon',
  'selectOptionsContainer',
  'selectOption',

  'paymentSourceRow',
  'paymentSourceRowIcon',
  'paymentSourceRowText',
  'paymentSourceRowType',
  'paymentSourceRowValue',
  'paymentSourceRowBadge',

  'invoiceRoot',
  'invoiceCard',
  'invoiceHeader',
  'invoiceHeaderContent',
  'invoiceTitle',
  'invoiceHeaderTitleBadgeContainer',
  'invoiceId',
  'invoiceIdContainer',
  'invoiceTitleIdContainer',
  'invoiceBadge',
  'invoiceDetails',
  'invoiceDetailsItem',
  'invoiceDetailsItemTitle',
  'invoiceDetailsItemTitleText',
  'invoiceDetailsItemValue',
  'invoiceDetailsItemValueText',
  'invoiceCopyButton',
  'invoiceContent',

  'menuButton',
  'menuButtonEllipsis',
  'menuList',
  'menuItem',

  'modalBackdrop',
  'modalContent',
  'modalCloseButton',

  'profileSection',
  'profileSectionItemList',
  'profileSectionItem',
  'profileSectionHeader',
  'profileSectionTitle',
  'profileSectionTitleText',
  'profileSectionSubtitle',
  'profileSectionSubtitleText',
  'profileSectionContent',
  'profileSectionPrimaryButton',
  'profilePage',

  'formattedPhoneNumber',
  'formattedPhoneNumberFlag',
  'formattedPhoneNumberText',

  'formattedDate',

  'scrollBox',

  'navbar',
  'navbarButtons',
  'navbarButton',
  'navbarButtonIcon',
  'navbarButtonText',
  'navbarMobileMenuRow',
  'navbarMobileMenuButton',
  'navbarMobileMenuButtonIcon',

  'pageScrollBox',
  'page',

  'activeDevice',
  'activeDeviceListItem',
  'activeDeviceIcon',

  'impersonationFab',
  'impersonationFabIcon',
  'impersonationFabIconContainer',
  'impersonationFabTitle',
  'impersonationFabActionLink',

  'invitationsSentIconBox',
  'invitationsSentIcon',

  'qrCodeRow',
  'qrCodeContainer',

  'badge',
  'notificationBadge',
  'buttonArrowIcon',
  'spinner',
] as const).map(camelize) as (keyof ElementsConfig)[];

type TargettableClassname<K extends keyof ElementsConfig> = `${typeof CLASS_PREFIX}${K}`;
type AllowedIds<T extends keyof ElementsConfig> = ElementsConfig[T]['ids'];
type AllowedStates<T extends keyof ElementsConfig> = ElementsConfig[T]['states'];
type ObjectKeyWithState<K extends keyof ElementsConfig> = StateSelectors<K, ElementsConfig[K]['states']>;
type ObjectKeyWithIds<K extends keyof ElementsConfig> = IdSelectors<K, ElementsConfig[K]['ids']>;
type ObjectKeyWithIdAndState<K extends keyof ElementsConfig> = StateSelectors<
  IdSelectors<K, ElementsConfig[K]['ids']>,
  ElementsConfig[K]['states']
>;

export type ElementId<Id = string> = { id: Id; __type: 'id' };
export type ElementDescriptor<K extends keyof ElementsConfig = any> = {
  targettableClassname: TargettableClassname<K>;
  objectKey: ElementObjectKey<K>;
  getTargettableIdClassname: (params: { id: AllowedIds<K> | never }) => string;
  getObjectKeyWithState: (state: AllowedStates<K> | never) => ObjectKeyWithState<K>;
  getObjectKeyWithId: (param: ElementId<AllowedIds<K>> | never) => ObjectKeyWithIds<K>;
  getObjectKeyWithIdAndState: (id: ElementId<AllowedIds<K>>, state: AllowedStates<K>) => ObjectKeyWithIdAndState<K>;
  setId: <Id extends AllowedIds<K>>(id?: Id) => ElementId<Id> | undefined;
};

type ElementDescriptors = { [k in keyof ElementsConfig as ElementObjectKey<k>]: ElementDescriptor<k> };

/**
 * Turns a key from the ElementsConfig object to a targettable classname
 * socialButtons-buttonIcon ->  cl-socialButtons-buttonIcon
 */
const toTargettableClassname = <K extends keyof ElementsConfig>(key: K): TargettableClassname<K> => {
  return (CLASS_PREFIX + (key as string)) as TargettableClassname<K>;
};

/**
 * Turns a key from the ElementsConfig object to a appearance.elements key
 * socialButtons-buttonIcon -> socialButtonsButtonIcon
 */
const toObjectKey = <K extends keyof ElementsConfig>(key: K): ElementObjectKey<K> => {
  return key.replace(/([-][a-z])/, match => match[1].toUpperCase()) as ElementObjectKey<K>;
};

const createElementDescriptor = <K extends keyof ElementsConfig>(key: K): ElementDescriptor<K> => {
  const objectKey = toObjectKey(key);
  return {
    objectKey,
    targettableClassname: toTargettableClassname(key),
    // getTargettableIdClassname: params => ID_CLASS_PREFIX + params.id,
    getTargettableIdClassname: params => toTargettableClassname(key) + '__' + params.id,
    getObjectKeyWithState: state => (objectKey + OBJ_KEY_DELIMITER + state) as any,
    getObjectKeyWithId: idObj => (objectKey + OBJ_KEY_DELIMITER + idObj.id) as any,
    getObjectKeyWithIdAndState: (idObj, state) =>
      (objectKey + OBJ_KEY_DELIMITER + idObj.id + OBJ_KEY_DELIMITER + state) as any,
    setId: id => (id ? { id, __type: 'id' } : undefined),
  };
};

const createDescriptorMap = <K extends keyof ElementsConfig>(keys = APPEARANCE_KEYS): ElementDescriptors => {
  const entries = keys.map(key => [toObjectKey(key), createElementDescriptor(key)]) as unknown as Array<
    [K, ElementDescriptor<K>]
  >;
  return fromEntries(entries) as unknown as ElementDescriptors;
};

export const descriptors = createDescriptorMap();
