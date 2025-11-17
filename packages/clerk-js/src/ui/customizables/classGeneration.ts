import type { Elements, ElementState } from '@clerk/shared/types';

import type { FlowMetadata } from '../elements/contexts';
import type { ElementDescriptor, ElementId } from './elementDescriptors';
import { CLASS_PREFIX } from './elementDescriptors';
import type { ParsedElements } from './parseAppearance';

const STATE_PROP_TO_CLASSNAME = Object.freeze({
  loading: ` ${CLASS_PREFIX}loading`,
  error: ` ${CLASS_PREFIX}error`,
  open: ` ${CLASS_PREFIX}open`,
  active: ` ${CLASS_PREFIX}active`,
} as const);

const STATE_PROP_TO_SPECIFICITY = Object.freeze({
  loading: 2,
  error: 2,
  open: 2,
  active: 2,
} as const);

type PropsWithState = Partial<Record<'isLoading' | 'isDisabled' | 'hasError' | 'isOpen' | 'isActive', any>> &
  Record<string, any>;

export const generateClassName = (
  parsedElements: ParsedElements,
  elemDescriptors: ElementDescriptor[],
  elemId: ElementId | undefined,
  props: PropsWithState | undefined,
) => {
  const state = getElementState(props);
  let className = '';
  const css: unknown[] = [];

  className = addClerkTargettableClassname(className, elemDescriptors);
  className = addClerkTargettableIdClassname(className, elemDescriptors, elemId);
  className = addClerkTargettableStateClass(className, state);
  className = addClerkTargettableRequiredAttribute(className, props as any);

  className = addUserProvidedClassnames(className, parsedElements, elemDescriptors, elemId, state);
  addUserProvidedStyleRules(css, parsedElements, elemDescriptors, elemId, state);
  return { className, css };
};

const addClerkTargettableClassname = (cn: string, elemDescriptors: ElementDescriptor[]) => {
  // We want the most specific classname to be displayed first, so we reverse the order
  for (let i = elemDescriptors.length - 1; i >= 0; i--) {
    cn += elemDescriptors[i].targettableClassname + ' ';
  }
  return cn.trimEnd();
};

const addClerkTargettableIdClassname = (
  cn: string,
  elemDescriptors: ElementDescriptor[],
  elemId: ElementId | undefined,
) => {
  if (!elemId) {
    return cn;
  }
  // We want the most specific classname to be displayed first, so we reverse the order
  for (let i = elemDescriptors.length - 1; i >= 0; i--) {
    cn = cn + ' ' + elemDescriptors[i].getTargettableIdClassname(elemId);
  }
  return cn;
};

const addClerkTargettableStateClass = (cn: string, state: ElementState | undefined) => {
  return state ? cn + STATE_PROP_TO_CLASSNAME[state] : cn;
};

const addClerkTargettableRequiredAttribute = (cn: string, props: { isRequired?: boolean } | undefined) => {
  return props && props.isRequired ? cn + ` ${CLASS_PREFIX}required` : cn;
};

export const appendEmojiSeparator = (generatedCn: string, otherCn?: string) => {
  return generatedCn + (otherCn ? ' ' + otherCn : '') + ' 🔒️';
};

const addUserProvidedStyleRules = (
  css: unknown[],
  parsedElements: ParsedElements,
  elemDescriptors: ElementDescriptor[],
  elemId: ElementId | undefined,
  state: ElementState | undefined,
) => {
  for (let j = 0; j < elemDescriptors.length; j++) {
    for (let i = 0; i < parsedElements.length; i++) {
      addRulesFromElements(css, parsedElements[i], elemDescriptors[j], elemId, state);
    }
  }
};

const addUserProvidedClassnames = (
  cn: string,
  parsedElements: ParsedElements,
  elemDescriptors: ElementDescriptor[],
  elemId: ElementId | undefined,
  state: ElementState | undefined,
) => {
  for (let j = 0; j < elemDescriptors.length; j++) {
    for (let i = 0; i < parsedElements.length; i++) {
      cn = addClassnamesFromElements(cn, parsedElements[i], elemDescriptors[j], elemId, state);
    }
  }
  return cn; //.trimEnd();
};

const getElementState = (props: PropsWithState | undefined): ElementState | undefined => {
  if (!props) {
    return undefined;
  }
  if (props.isLoading) {
    return 'loading';
  }
  if (props.hasError) {
    return 'error';
  }
  if (props.isOpen) {
    return 'open';
  }
  if (props.isActive) {
    return 'active';
  }
  return undefined;
};

const addStringClassname = (cn: string, val?: unknown) => (typeof val === 'string' ? cn + ' ' + val : cn);

const addStyleRuleObject = (css: unknown[], val: unknown, specificity = 0) => {
  if (specificity) {
    if (val && typeof val === 'object') {
      css.push({ ['&'.repeat(specificity)]: val });
    }
  } else {
    if (val && typeof val === 'object') {
      css.push(val);
    }
  }
};

export const generateFlowClassname = (props: Pick<FlowMetadata, 'flow'>) => {
  return CLASS_PREFIX + props.flow + '-root';
};

export const generateFlowPartClassname = (props: FlowMetadata) => {
  if (!props.part) {
    return '';
  }
  return CLASS_PREFIX + props.flow + '-' + props.part;
};

const addClassnamesFromElements = (
  cn: string,
  elements: Elements | undefined,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
) => {
  if (!elements) {
    return cn;
  }

  type Key = keyof typeof elements;
  cn = addStringClassname(cn, elements[elemDescriptor.objectKey as Key]);
  if (elemId) {
    cn = addStringClassname(cn, elements[elemDescriptor.getObjectKeyWithId(elemId) as Key]);
  }
  if (state) {
    cn = addStringClassname(cn, elements[elemDescriptor.getObjectKeyWithState(state) as Key]);
  }
  if (elemId && state) {
    cn = addStringClassname(cn, elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key]);
  }
  return cn;
};

const addRulesFromElements = (
  css: unknown[],
  elements: Elements | undefined,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
) => {
  if (!elements) {
    return;
  }

  type Key = keyof typeof elements;
  addStyleRuleObject(css, elements[elemDescriptor.objectKey as Key]);
  if (elemId) {
    addStyleRuleObject(css, elements[elemDescriptor.getObjectKeyWithId(elemId) as Key]);
  }
  if (state) {
    addStyleRuleObject(
      css,
      elements[elemDescriptor.getObjectKeyWithState(state) as Key],
      STATE_PROP_TO_SPECIFICITY[state],
    );
  }
  if (elemId && state) {
    addStyleRuleObject(
      css,
      elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key],
      STATE_PROP_TO_SPECIFICITY[state],
    );
  }
};
