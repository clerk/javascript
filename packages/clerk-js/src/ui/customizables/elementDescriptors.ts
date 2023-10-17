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
  'rootBox',
  'card',

  'logoBox',
  'logoImage',

  'header',
  'headerTitle',
  'headerSubtitle',
  'headerBackRow',
  'headerBackLink',
  'headerBackIcon',

  'main',

  'footer',
  'footerAction',
  'footerActionText',
  'footerActionLink',
  'footerPages',
  'footerPagesLink',

  'socialButtons',
  'socialButtonsIconButton',
  'socialButtonsBlockButton',
  'socialButtonsBlockButtonText',
  'socialButtonsBlockButtonArrow',
  'socialButtonsProviderIcon',

  'enterpriseButtonsProviderIcon',

  'alternativeMethods',
  'alternativeMethodsBlockButton',
  'alternativeMethodsBlockButtonText',
  'alternativeMethodsBlockButtonArrow',

  'otpCodeBox',
  'otpCodeHeader',
  'otpCodeHeaderTitle',
  'otpCodeHeaderSubtitle',
  'otpCodeField',
  'otpCodeFieldInputs',
  'otpCodeFieldInput',
  'otpCodeFieldErrorText',
  'formResendCodeLink',

  'dividerRow',
  'dividerText',
  'dividerLine',

  'formHeader',
  'formHeaderTitle',
  'formHeaderSubtitle',

  'verificationLinkStatusBox',
  'verificationLinkStatusIconBox',
  'verificationLinkStatusIcon',
  'verificationLinkStatusText',

  'form',
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
  'formFieldAction',
  'formFieldInput',
  'formFieldErrorText',
  'formFieldWarningText',
  'formFieldSuccessText',
  'formFieldInfoText',
  'formFieldDirectionsText',
  'formFieldHintText',
  'formButtonRow',
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
  'userButtonPopoverUserPreview',
  'userButtonPopoverActions',
  'userButtonPopoverActionButton',
  'userButtonPopoverActionButtonIconBox',
  'userButtonPopoverActionButtonIcon',
  'userButtonPopoverActionButtonText',
  'userButtonPopoverFooter',
  'userButtonPopoverFooterPages',
  'userButtonPopoverFooterPagesLink',

  'organizationSwitcherTrigger',
  'organizationSwitcherTriggerIcon',
  'organizationSwitcherPopoverRootBox',
  'organizationSwitcherPopoverCard',
  'organizationSwitcherPopoverMain',
  'organizationSwitcherPopoverActions',
  'organizationSwitcherPopoverInvitationActions',
  'organizationSwitcherPopoverActionButton',
  'organizationSwitcherPreviewButton',
  'organizationSwitcherInvitationAcceptButton',
  'organizationSwitcherInvitationRejectButton',
  'organizationSwitcherPopoverActionButtonIconBox',
  'organizationSwitcherPopoverActionButtonIcon',
  'organizationSwitcherPopoverActionButtonText',
  'organizationSwitcherPopoverFooter',
  'organizationSwitcherPopoverFooterPages',
  'organizationSwitcherPopoverFooterPagesLink',

  'organizationListPreviewItems',
  'organizationListPreviewItem',
  'organizationListPreviewButton',
  'organizationListPreviewItemActionButton',

  'userPreview',
  'userPreviewAvatarContainer',
  'userPreviewAvatarBox',
  'userPreviewAvatarImage',
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

  'membersPageInviteButton',
  'organizationProfilePage',

  'identityPreview',
  'identityPreviewAvatarBox',
  'identityPreviewAvatarImage',
  'identityPreviewText',
  'identityPreviewEditButton',
  'identityPreviewEditButtonIcon',

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
  'paginationRowText',

  'selectButton',
  'selectSearchInput',
  'selectButtonIcon',
  'selectOptionsContainer',
  'selectOption',

  'menuButton',
  'menuList',
  'menuItem',

  'loader',
  'loaderIcon',

  'modalBackdrop',
  'modalContent',
  'modalCloseButton',

  'profileSection',
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

  'breadcrumbs',
  'breadcrumbsItems',
  'breadcrumbsItemBox',
  'breadcrumbsItem',
  'breadcrumbsItemIcon',
  'breadcrumbsItemDivider',

  'scrollBox',

  'navbar',
  'navbarButtons',
  'navbarButton',
  'navbarButtonIcon',
  'navbarMobileMenuRow',
  'navbarMobileMenuButton',
  'navbarMobileMenuButtonIcon',

  'pageScrollBox',
  'page',
  'pageHeader',

  'activeDeviceIcon',

  'impersonationFab',
  'impersonationFabIcon',
  'impersonationFabIconContainer',
  'impersonationFabTitle',
  'impersonationFabActionLink',

  'fileDropAreaOuterBox',
  'fileDropAreaBox',
  'fileDropAreaIconBox',
  'fileDropAreaIcon',
  'fileDropAreaHint',
  'fileDropAreaButtonPrimary',
  'fileDropAreaFooterHint',

  'invitationsSentIconBox',
  'invitationsSentIcon',

  'accordionTriggerButton',
  'accordionContent',

  'qrCodeRow',
  'qrCodeContainer',

  'badge',
  'notificationBadge',
  'button',
  'providerIcon',
  // Decide if we want to keep the keys as camel cased in HTML as well,
  // if yes, refactor and remove the .map(camelize) method
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
  return (CLASS_PREFIX + key) as TargettableClassname<K>;
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
