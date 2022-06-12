import type { Elements, ElementState } from '@clerk/types';

import { FlowMetadata } from '../elements/contexts';
import { ParsedElements } from './appearanceAdapter';
import { CLASS_PREFIX, ElementDescriptor, ElementId } from './elementDescriptors';

const STATE_PROP_TO_CLASSNAME = Object.freeze({
  disabled: ` ${CLASS_PREFIX}disabled`,
  loading: ` ${CLASS_PREFIX}loading`,
  error: ` ${CLASS_PREFIX}error`,
} as const);

type PropsWithState = Partial<Record<'isLoading' | 'isDisabled' | 'hasError', any>> & Record<string, any>;

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
  className = addEmojiSeparator(className);
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
  return props.isLoading ? 'loading' : props.hasError ? 'error' : props.isDisabled ? 'disabled' : undefined;
};

const addIfString = (cn: string, val?: unknown) => (typeof val === 'string' ? cn + ' ' + val : cn);

const addIfStyleObject = (css: unknown[], val?: unknown) => {
  val && typeof val === 'object' && css.push(val);
};

export const generateFlowMetadataClassname = (props: { flow: string; page: string }) => {
  const flowClass = CLASS_PREFIX + props.flow;
  const pageClass = flowClass + '-' + props.page;
  return flowClass + ' ' + pageClass;
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
  cn = addIfString(cn, elements[elemDescriptor.objectKey as Key]);
  if (elemId) {
    cn = addIfString(cn, elements[elemDescriptor.getObjectKeyWithId(elemId) as Key]);
  }
  if (state) {
    cn = addIfString(cn, elements[elemDescriptor.getObjectKeyWithState(state) as Key]);
  }
  if (elemId && state) {
    cn = addIfString(cn, elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key]);
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
  addIfStyleObject(css, elements[elemDescriptor.objectKey as Key]);
  if (elemId) {
    addIfStyleObject(css, elements[elemDescriptor.getObjectKeyWithId(elemId) as Key]);
  }
  if (state) {
    addIfStyleObject(css, elements[elemDescriptor.getObjectKeyWithState(state) as Key]);
  }
  if (elemId && state) {
    addIfStyleObject(css, elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key]);
  }
};
