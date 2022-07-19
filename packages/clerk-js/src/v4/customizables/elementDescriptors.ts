import { ElementObjectKey, ElementsConfig, IdSelectors, StateSelectors } from '@clerk/types';

import { containsAllOfType } from '../utils';

export const CLASS_PREFIX = 'cl-';
export const ID_CLASS_PREFIX = 'cl-id-';
export const OBJ_KEY_DELIMITER = '__';

const containsAllElementsConfigKeys = containsAllOfType<keyof ElementsConfig>();

/**
 * This object is strictly typed using the ElementsConfig type
 * and is used as the single source of truth to generate the
 * descriptor map
 */
export const APPEARANCE_KEYS = containsAllElementsConfigKeys([
  'root',
  'card',

  'logo',
  'logo-image',

  'header',
  'header-title',
  'header-subtitle',

  'main',

  'footer',
  'footer-action',
  'footer-actionText',
  'footer-actionLink',
  'footer-pages',
  'footer-pagesLink',

  'socialButtons',
  'socialButtons-buttonIcon',
  'socialButtons-buttonBlock',
  'socialButtons-buttonBlockText',
  'socialButtons-buttonBlockArrow',
  'socialButtons-logo',

  'dividerBox',
  'dividerText',
  'dividerLine',

  'form',
  'form-fieldRow',
  'form-field',
  'form-fieldLabelRow',
  'form-fieldLabel',
  'form-fieldAction',
  'form-fieldInput',
  'form-fieldErrorText',
  'form-fieldHintText',
  'form-buttonPrimary',
  'form-buttonReset',
  'form-fieldInputShowPassword',
  'form-fieldInputShowPasswordIcon',

  'avatar',
  'avatar-image',

  'userButton',
  'userButton-trigger',
  'userButton-popover',

  'identityPreview',
  'identityPreview-avatar',
  'identityPreview-text',
  'identityPreview-icon',

  'alert',
  'alert-icon',
  'alert-text',

  'loader',
  'loader-icon',

  'modal-backdrop',
  'modal-content',

  'profileSection',
  'profileSection-title',
  'profileSection-titleText',
  'profileSection-content',

  'formattedPhoneNumber',
  'formattedPhoneNumber-flag',
  'formattedPhoneNumber-text',

  'breadcrumbs',
  'breadcrumbs-itemContainer',
  'breadcrumbs-icon',
  'breadcrumbs-item',
  'breadcrumbs-divider',

  'scroller',

  'navbarSection',
  'navbar',
  'navbar-item',
  'navbar-icon',

  'pageSection',
  'page',
  'pageHeader',

  'activeDeviceIcon',
] as const);

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
  setId: <Id extends AllowedIds<K>>(id: Id) => ElementId<Id>;
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
    getTargettableIdClassname: params => ID_CLASS_PREFIX + params.id,
    getObjectKeyWithState: state => (objectKey + OBJ_KEY_DELIMITER + state) as any,
    getObjectKeyWithId: idObj => (objectKey + OBJ_KEY_DELIMITER + idObj.id) as any,
    getObjectKeyWithIdAndState: (idObj, state) =>
      (objectKey + OBJ_KEY_DELIMITER + idObj.id + OBJ_KEY_DELIMITER + state) as any,
    setId: id => ({ id, __type: 'id' }),
  };
};

const createDescriptorMap = <K extends keyof ElementsConfig>(keys = APPEARANCE_KEYS): ElementDescriptors => {
  const entries = keys.map(key => [toObjectKey(key), createElementDescriptor(key)]) as unknown as Array<
    [K, ElementDescriptor<K>]
  >;
  return Object.fromEntries(entries) as unknown as ElementDescriptors;
};

export const descriptors = createDescriptorMap();
