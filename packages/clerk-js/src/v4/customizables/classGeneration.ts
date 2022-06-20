import type { Elements, ElementState } from '@clerk/types';

import { FlowMetadata } from '../elements/contexts';
import { CLASS_PREFIX, ElementDescriptor, ElementId } from './elementDescriptors';
import { ParsedElements } from './parseAppearance';

const STATE_PROP_TO_CLASSNAME = Object.freeze({
  disabled: ` ${CLASS_PREFIX}disabled`,
  loading: ` ${CLASS_PREFIX}loading`,
  error: ` ${CLASS_PREFIX}error`,
  open: ` ${CLASS_PREFIX}open`,
} as const);

type PropsWithState = Partial<Record<'isLoading' | 'isDisabled' | 'hasError' | 'isOpen', any>> & Record<string, any>;

export const generateClassName = (
  parsedElements: ParsedElements,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  props: PropsWithState | undefined,
  flowMetadata: FlowMetadata,
) => {
  const state = getElementState(props);
  let className = '';
  const css: unknown[] = [];

  className = addClerkTargettableClassname(className, elemDescriptor);
  className = addClerkTargettableIdClassname(className, elemDescriptor, elemId);
  className = addClerkTargettableStateClass(className, state);

  className = addUserProvidedClassnames(className, parsedElements, elemDescriptor, elemId, state, flowMetadata);
  addUserProvidedStyleRules(css, parsedElements, elemDescriptor, elemId, state, flowMetadata);
  return { className, css };
};

const addClerkTargettableClassname = (cn: string, elemDescriptor: ElementDescriptor) => {
  return cn + elemDescriptor.targettableClassname;
};

const addClerkTargettableIdClassname = (
  cn: string,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
) => {
  return elemId ? cn + ' ' + elemDescriptor.getTargettableIdClassname(elemId) : cn;
};

const addClerkTargettableStateClass = (cn: string, state: ElementState | undefined) => {
  return state ? cn + STATE_PROP_TO_CLASSNAME[state] : cn;
};

export const appendEmojiSeparator = (generatedCn: string, otherCn?: string) => {
  return generatedCn + (otherCn ? ' ' + otherCn : '') + ' 🔒️';
};

const addUserProvidedStyleRules = (
  css: unknown[],
  parsedElements: ParsedElements,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
  flowMetadata: FlowMetadata,
) => {
  addRulesFromElements(css, parsedElements.base, elemDescriptor, elemId, state);
  addRulesFromElements(css, parsedElements[flowMetadata.flow], elemDescriptor, elemId, state);
};

const addUserProvidedClassnames = (
  cn: string,
  parsedElements: ParsedElements,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
  flowMetadata: FlowMetadata,
) => {
  cn = addClassnamesFromElements(cn, parsedElements.base, elemDescriptor, elemId, state);
  cn = addClassnamesFromElements(cn, parsedElements[flowMetadata.flow], elemDescriptor, elemId, state);
  return cn;
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
  if (props.isDisabled) {
    return 'disabled';
  }
  if (props.isOpen) {
    return 'open';
  }
  return undefined;
};

const addStringClassname = (cn: string, val?: unknown) => (typeof val === 'string' ? cn + ' ' + val : cn);

const addStyleRuleObject = (css: unknown[], val?: unknown) => {
  val && typeof val === 'object' && css.push(val);
  // val && typeof val === 'object' && css.push({ '&&': val });
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
    addStyleRuleObject(css, elements[elemDescriptor.getObjectKeyWithState(state) as Key]);
  }
  if (elemId && state) {
    addStyleRuleObject(css, elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key]);
  }
};
