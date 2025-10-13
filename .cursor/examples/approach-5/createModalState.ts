/**
 * APPROACH 5 EXAMPLE: Auto-Generated State Management
 *
 * This file shows how to automatically generate state types and initialization
 * from the modal registry, eliminating manual state declaration.
 */

import type { Appearance, ClerkOptions } from '@clerk/types';
import type { MODAL_REGISTRY, ModalName } from './modalRegistry';

/**
 * 🎯 TYPE INFERENCE: Automatically generate state shape from registry
 *
 * This type takes the modal registry and creates a state object where:
 * - Each modal gets a `${name}Modal` key
 * - The value type is inferred from the modal's props
 */
type ModalStateFromRegistry<T extends readonly any[]> = {
  [K in T[number]['name'] as `${K}Modal`]: any | null;
};

/**
 * Drawer state helper type
 */
interface DrawerState<TProps> {
  open: boolean;
  props: TProps | null;
}

/**
 * HTML Node options for mounted components
 */
interface HtmlNodeOptions {
  key: string;
  name: string;
  appearanceKey: string;
  props?: any;
}

/**
 * 🎯 AUTO-GENERATED: Complete component state
 *
 * This type is automatically derived from the modal registry.
 * No manual maintenance required!
 */
export type GeneratedModalState = ModalStateFromRegistry<typeof MODAL_REGISTRY> & {
  // Global state
  appearance: Appearance | undefined;
  options: ClerkOptions | undefined;

  // Special modals (not in registry)
  googleOneTapModal: any | null;

  // Prefetch flags
  organizationSwitcherPrefetch: boolean;

  // Mounted components
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
  impersonationFab: boolean;

  // Drawers (could also be moved to a registry!)
  checkoutDrawer: DrawerState<any>;
  planDetailsDrawer: DrawerState<any>;
  subscriptionDetailsDrawer: DrawerState<any>;
};

/**
 * 🎯 SMART DEFAULT: Create initial state from options
 *
 * Convention: All modals initialize to null by default
 */
export function createInitialModalState(options: ClerkOptions): GeneratedModalState {
  const modalState: any = {};

  // Auto-initialize all modals from registry
  const modalRegistry = require('./modalRegistry').MODAL_REGISTRY;
  for (const modal of modalRegistry) {
    modalState[`${modal.name}Modal`] = null;
  }

  return {
    ...modalState,

    // Global state
    appearance: options.appearance,
    options,

    // Special modals
    googleOneTapModal: null,

    // Prefetch
    organizationSwitcherPrefetch: false,

    // Mounted components
    nodes: new Map(),
    impersonationFab: false,

    // Drawers
    checkoutDrawer: { open: false, props: null },
    planDetailsDrawer: { open: false, props: null },
    subscriptionDetailsDrawer: { open: false, props: null },
  };
}

/**
 * 🎯 TYPE-SAFE HELPERS: State accessors
 */
export function getModalState<T extends ModalName>(state: GeneratedModalState, modalName: T): any | null {
  return state[`${modalName}Modal` as keyof GeneratedModalState];
}

export function setModalState<T extends ModalName>(
  state: GeneratedModalState,
  modalName: T,
  props: any | null,
): GeneratedModalState {
  return {
    ...state,
    [`${modalName}Modal`]: props,
  };
}

/**
 * Example usage in Components.tsx:
 *
 * ```typescript
 * const [state, setState] = React.useState<GeneratedModalState>(
 *   createInitialModalState(props.options)
 * );
 *
 * // Type-safe access
 * const signInProps = getModalState(state, 'signIn');
 *
 * // Type-safe update
 * setState(setModalState(state, 'signIn', { appearance: {...} }));
 * ```
 */
