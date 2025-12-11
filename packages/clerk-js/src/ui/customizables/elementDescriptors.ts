import type { ElementObjectKey, ElementsConfig, IdSelectors, StateSelectors } from '@clerk/shared/types';

import { containsAllOfType } from '../utils/containsAllOf';
import { fromEntries } from '../utils/fromEntries';

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
  'lineItemsDowngradeNotice',

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

  'lastAuthenticationStrategyBadge',

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
  'checkoutSuccessRings',
  'checkoutSuccessBadge',
  'checkoutSuccessTitle',
  'checkoutSuccessDescription',

  'otpCodeField',
  'otpCodeFieldInputs',
  'otpCodeFieldInput',
  'otpCodeFieldInputContainer',
  'otpCodeFieldErrorText',
  'otpCodeFieldSuccessText',
  'formResendCodeLink',

  'dividerRow',
  'dividerColumn',
  'dividerText',
  'dividerLine',

  'drawerBackdrop',
  'drawerRoot',
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

  'taskChooseOrganizationPreviewItem',
  'taskChooseOrganizationPreviewItems',
  'taskChooseOrganizationCreateOrganizationActionButton',
  'taskChooseOrganizationPreviewButton',

  'userAvatarBox',
  'userAvatarImage',

  'userPreview',
  'userPreviewAvatarContainer',
  'userPreviewAvatarBox',
  'userPreviewAvatarImage',
  'userPreviewAvatarIcon',
  'userPreviewTextContainer',
  'userPreviewMainIdentifier',
  'userPreviewMainIdentifierText',
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
  'pricingTableCardTitleContainer',
  'pricingTableCardTitle',
  'pricingTableCardDescription',
  'pricingTableCardBody',
  'pricingTableCardStatusRow',
  'pricingTableCardStatus',
  'pricingTableCardFeatures',
  'pricingTableCardFeaturesList',
  'pricingTableCardFeaturesListItem',
  'pricingTableCardFeaturesListItemContent',
  'pricingTableCardFeaturesListItemTitle',
  'pricingTableCardPeriodToggle',
  'pricingTableCardFeeContainer',
  'pricingTableCardFee',
  'pricingTableCardFeePeriod',
  'pricingTableCardFeePeriodNotice',
  'pricingTableCardFooter',
  'pricingTableCardFooterButton',
  'pricingTableCardFooterNotice',

  'pricingTableMatrix',
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

  'planDetailHeader',
  'planDetailAvatar',
  'planDetailBadgeAvatarTitleDescriptionContainer',
  'planDetailBadgeContainer',
  'planDetailBadge',
  'planDetailTitle',
  'planDetailTitleDescriptionContainer',
  'planDetailDescription',
  'planDetailAction',
  'planDetailFeeContainer',
  'planDetailFee',
  'planDetailFeePeriod',
  'planDetailFeePeriodNotice',
  'planDetailFeePeriodNoticeInner',
  'planDetailFeePeriodNoticeLabel',
  'planDetailCaption',
  'planDetailFeatures',
  'planDetailFeaturesList',
  'planDetailFeaturesListItem',
  'planDetailFeaturesListItemContent',
  'planDetailFeaturesListItemTitle',
  'planDetailFeaturesListItemDescription',
  'planDetailPeriodToggle',

  'segmentedControlRoot',
  'segmentedControlButton',

  'switchRoot',
  'switchIndicator',
  'switchThumb',
  'switchLabel',

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
  'tableBody',
  'tableRow',
  'tableHeaderCell',
  'tableBodyCell',

  'paginationButton',
  'paginationButtonIcon',
  'paginationRowText',

  'selectButton',
  'selectSearchInput',
  'selectButtonIcon',
  'selectOptionsContainer',
  'selectOption',

  'paymentMethodRow',
  'paymentMethodRowIcon',
  'paymentMethodRowText',
  'paymentMethodRowType',
  'paymentMethodRowValue',
  'paymentMethodRowBadge',

  'statementRoot',
  'statementHeader',
  'statementHeaderTitleContainer',
  'statementHeaderTitle',
  'statementHeaderBadge',
  'statementBody',
  'statementSection',
  'statementSectionHeader',
  'statementSectionHeaderTitle',
  'statementSectionContent',
  'statementSectionContentItem',
  'statementSectionContentDetailsList',
  'statementSectionContentDetailsListItem',
  'statementSectionContentDetailsListItemLabelContainer',
  'statementSectionContentDetailsListItemLabel',
  'statementSectionContentDetailsListItemValue',
  'statementSectionContentDetailsHeader',
  'statementSectionContentDetailsHeaderItem',
  'statementSectionContentDetailsHeaderItemIcon',
  'statementSectionContentDetailsHeaderTitle',
  'statementSectionContentDetailsHeaderDescription',
  'statementSectionContentDetailsHeaderSecondaryTitle',
  'statementSectionContentDetailsHeaderSecondaryDescription',
  'statementFooter',
  'statementFooterLabel',
  'statementFooterValueContainer',
  'statementFooterCurrency',
  'statementFooterValue',
  'statementCopyButton',
  'menuButton',
  'menuButtonEllipsis',
  'menuButtonEllipsisBordered',
  'menuList',
  'menuItem',

  'paymentAttemptRoot',
  'paymentAttemptHeader',
  'paymentAttemptHeaderTitleContainer',
  'paymentAttemptHeaderTitle',
  'paymentAttemptHeaderBadge',
  'paymentAttemptBody',
  'paymentAttemptFooter',
  'paymentAttemptFooterLabel',
  'paymentAttemptFooterValueContainer',
  'paymentAttemptFooterCurrency',
  'paymentAttemptFooterValue',
  'paymentAttemptCopyButton',

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
  'profileSectionButtonGroup',
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

  'tooltip',
  'tooltipContent',
  'tooltipText',

  'badge',
  'notificationBadge',
  'buttonArrowIcon',
  'spinner',

  'apiKeys',
  'apiKeysHeader',
  'apiKeysSearchBox',
  'apiKeysSearchInput',
  'apiKeysAddButton',
  'apiKeysTable',
  'apiKeysCopyButton',
  'apiKeysRevealButton',
  'apiKeysCreateForm',
  'apiKeysCreateFormNameInput',
  'apiKeysCreateFormDescriptionInput',
  'apiKeysCreateFormExpirationInput',
  'apiKeysCreateFormSubmitButton',
  'apiKeysCreateFormExpirationCaption',
  'apiKeysRevokeModal',
  'apiKeysRevokeModalInput',
  'apiKeysRevokeModalSubmitButton',
  'apiKeysCopyModal',
  'apiKeysCopyModalInput',
  'apiKeysCopyModalSubmitButton',

  'subscriptionDetailsCard',
  'subscriptionDetailsCardHeader',
  'subscriptionDetailsCardBadge',
  'subscriptionDetailsCardTitle',
  'subscriptionDetailsCardBody',
  'subscriptionDetailsCardFooter',
  'subscriptionDetailsCardActions',
  'subscriptionDetailsActionButton',
  'subscriptionDetailsCancelButton',
  'subscriptionDetailsDetailRow',
  'subscriptionDetailsDetailRowLabel',
  'subscriptionDetailsDetailRowValue',

  'enterpriseConnectionsRoot',
  'enterpriseConnectionButton',
  'enterpriseConnectionButtonText',

  'web3WalletButtonsRoot',
  'web3WalletButtons',
  'web3WalletButtonsIconButton',
  'web3WalletButtonsBlockButton',
  'web3WalletButtonsBlockButtonText',
  'web3WalletButtonsWalletIcon',
  'web3WalletButtonsWalletInitialIcon',

  'walletIcon',
  'walletInitialIcon',
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
