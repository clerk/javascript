import type { ElementState, Theme } from '@clerk/types';

import { FlowMetadata } from '../elements/contexts';
import type { ParsedAppearance } from '../types';
import { CLASS_PREFIX, ElementDescriptor, ElementId } from './elementDescriptors';

const STATE_PROP_TO_CLASSNAME = Object.freeze({
  disabled: ` ${CLASS_PREFIX}disabled`,
  loading: ` ${CLASS_PREFIX}loading`,
  error: ` ${CLASS_PREFIX}error`,
} as const);

type PropsWithState = Partial<Record<'isLoading' | 'isDisabled' | 'hasError', any>> & Record<string, any>;

// const appearance: ParsedAppearance = {
// variables: {},
// elements: {
//   card: {
//     backgroundColor: 'white',
//     backdropFilter: 'blur(15px)',
//   },
//   authOptions: {
//     margin: '2rem 0',
//   },
// },
// signIn: {
//   elements: {
//     card: {
//       backgroundColor: 'rgba(255,255,255,1.9)',
//     },
//   },
// },
// signUp: {
//   elements: {
//     card: {
//       backgroundColor: 'rgba(0,0,0,0.78)',
//     },
//     headerTitle: {
//       color: 'white',
//     },
//     socialButtonsButtonIcon: {
//       '&:hover': {
//         backgroundColor: 'lightgray',
//       },
//     },
//     socialButtonsButtonIcon__github: {
//       filter: 'invert(1)',
//     },
//     socialButtonsButtonIcon__apple: {
//       filter: 'invert(1)',
//     },
//   },
// },
// };

export const generateClassName = (
  parsedAppearance: ParsedAppearance,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  props: PropsWithState | undefined,
  flowMetadata: FlowMetadata,
) => {
  const state = getElementState(props);
  let className = '';
  // stable classes, always add
  className = addClerkTargettableClassname(className, elemDescriptor);
  className = addClerkTargettableIdClassname(className, elemDescriptor, elemId);
  className = addClerkTargettableStateClass(className, state);
  // user provided classes
  className = addUserProvidedClassnames(className, parsedAppearance, elemDescriptor, elemId, state, flowMetadata);
  className = addEmojiSeparator(className);
  const css = addUserProvidedStyleRules(parsedAppearance, elemDescriptor, elemId, state, flowMetadata);
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

const addEmojiSeparator = (cn: string) => {
  return cn + ' 🔒️';
};

const addUserProvidedStyleRules = (
  appearance: ParsedAppearance,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
  flowMetadata: FlowMetadata,
) => {
  const css: unknown[] = [];
  addRulesFromElements(css, appearance, elemDescriptor, elemId, state);
  addRulesFromElements(css, appearance[flowMetadata.flow], elemDescriptor, elemId, state);
  return css;
};

const addUserProvidedClassnames = (
  cn: string,
  appearance: ParsedAppearance,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
  flowMetadata: FlowMetadata,
) => {
  cn = addClassnamesFromElements(cn, appearance, elemDescriptor, elemId, state);
  cn = addClassnamesFromElements(cn, appearance[flowMetadata.flow], elemDescriptor, elemId, state);
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
  theme: Theme | undefined,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
) => {
  if (!theme || !theme.elements) {
    return cn;
  }

  type Key = keyof typeof theme.elements;
  cn = addIfString(cn, theme.elements[elemDescriptor.objectKey as Key]);
  if (elemId) {
    cn = addIfString(cn, theme.elements[elemDescriptor.getObjectKeyWithId(elemId) as Key]);
  }
  if (state) {
    cn = addIfString(cn, theme.elements[elemDescriptor.getObjectKeyWithState(state) as Key]);
  }
  if (elemId && state) {
    cn = addIfString(cn, theme.elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key]);
  }
  return cn;
};

const addRulesFromElements = (
  css: unknown[],
  theme: Theme | undefined,
  elemDescriptor: ElementDescriptor,
  elemId: ElementId | undefined,
  state: ElementState | undefined,
) => {
  if (!theme || !theme.elements) {
    return;
  }

  type Key = keyof typeof theme.elements;
  addIfStyleObject(css, theme.elements[elemDescriptor.objectKey as Key]);
  if (elemId) {
    addIfStyleObject(css, theme.elements[elemDescriptor.getObjectKeyWithId(elemId) as Key]);
  }
  if (state) {
    addIfStyleObject(css, theme.elements[elemDescriptor.getObjectKeyWithState(state) as Key]);
  }
  if (elemId && state) {
    addIfStyleObject(css, theme.elements[elemDescriptor.getObjectKeyWithIdAndState(elemId, state) as Key]);
  }
};
