/**
 * APPROACH 5 EXAMPLE: Modal Registry
 *
 * This file demonstrates the convention-based modal registration system.
 * All modals are declared here with their configuration.
 */

import type { ComponentProps } from '@clerk/types';
import type { LazyExoticComponent } from 'react';

/**
 * Standard modal configuration shape.
 * Convention: All modals follow this pattern.
 */
export interface ModalConfig<TProps extends ComponentProps = ComponentProps> {
  /**
   * Modal name (camelCase). Used for:
   * - State key: `${name}Modal`
   * - Control methods: `open${PascalCase(name)}`, `close${PascalCase(name)}`
   */
  name: string;

  /**
   * Appearance key for theming
   * Convention: Matches component name in camelCase
   */
  appearanceKey: string;

  /**
   * Virtual router base path
   * Convention: kebab-case version of name
   */
  basePath: string;

  /**
   * Lazy-loaded modal component
   */
  component: LazyExoticComponent<React.ComponentType<any>>;

  /**
   * Optional: Related components to render as children
   * Example: SignIn modal includes SignUp and Waitlist as children
   */
  children?: Array<{
    modalName: string;
    propsTransform?: (parentProps: TProps) => ComponentProps;
  }>;

  /**
   * Optional: Custom modal styling
   */
  modalStyles?: {
    containerSx?: any;
    contentSx?: (theme: any) => any;
    canCloseModal?: boolean;
    modalId?: string;
    modalStyle?: React.CSSProperties;
  };

  /**
   * Optional: Custom start path resolver
   * By default, uses `urlStateParam?.path`
   */
  startPathResolver?: (props: TProps | null, urlStateParam?: any) => string | undefined;

  /**
   * Optional: Disable external navigation closing
   * Useful for critical flows like captcha
   */
  disableExternalNavigationClose?: boolean;

  /**
   * Optional: Props type for type-safe registry
   * This enables TypeScript to know which props type each modal expects
   */
  propsType?: TProps;
}

/**
 * 🎯 MODAL REGISTRY
 *
 * Convention: Add your modal here and everything else is automatic!
 *
 * The system will automatically:
 * - Generate TypeScript types
 * - Create state management
 * - Wire up rendering logic
 * - Register control methods
 */
export const MODAL_REGISTRY = [
  {
    name: 'signIn',
    appearanceKey: 'signIn',
    basePath: '/sign-in',
    component: () => import('../lazyModules/components').then(m => m.SignInModal),
    children: [
      { modalName: 'signUp', propsTransform: props => disambiguateRedirectOptions(props, 'signin') },
      { modalName: 'waitlist' },
    ],
  },

  {
    name: 'signUp',
    appearanceKey: 'signUp',
    basePath: '/sign-up',
    component: () => import('../lazyModules/components').then(m => m.SignUpModal),
    children: [
      { modalName: 'signIn', propsTransform: props => disambiguateRedirectOptions(props, 'signup') },
      { modalName: 'waitlist' },
    ],
  },

  {
    name: 'userProfile',
    appearanceKey: 'userProfile',
    basePath: '/user',
    component: () => import('../lazyModules/components').then(m => m.UserProfileModal),
    modalStyles: {
      containerSx: { alignItems: 'center' },
      contentSx: t => ({
        height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`,
        margin: 0,
      }),
    },
    startPathResolver: (props, urlStateParam) => props?.__experimental_startPath || urlStateParam?.path,
  },

  {
    name: 'userVerification',
    appearanceKey: 'userVerification',
    basePath: '/user-verification',
    component: () => import('../lazyModules/components').then(m => m.UserVerificationModal),
    modalStyles: {
      containerSx: { alignItems: 'center' },
    },
  },

  {
    name: 'organizationProfile',
    appearanceKey: 'organizationProfile',
    basePath: '/organizationProfile',
    component: () => import('../lazyModules/components').then(m => m.OrganizationProfileModal),
    modalStyles: {
      containerSx: { alignItems: 'center' },
      contentSx: t => ({
        height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`,
        margin: 0,
      }),
    },
    startPathResolver: (props, urlStateParam) => props?.__experimental_startPath || urlStateParam?.path,
  },

  {
    name: 'createOrganization',
    appearanceKey: 'createOrganization',
    basePath: '/createOrganization',
    component: () => import('../lazyModules/components').then(m => m.CreateOrganizationModal),
    modalStyles: {
      containerSx: { alignItems: 'center' },
      contentSx: t => ({
        height: `min(${t.sizes.$120}, calc(100% - ${t.sizes.$12}))`,
        margin: 0,
      }),
    },
  },

  {
    name: 'waitlist',
    appearanceKey: 'waitlist',
    basePath: '/waitlist',
    component: () => import('../lazyModules/components').then(m => m.WaitlistModal),
    children: [{ modalName: 'signIn' }],
  },

  {
    name: 'blankCaptcha',
    appearanceKey: 'blankCaptcha' as any,
    basePath: '/blank-captcha',
    component: () => import('../lazyModules/components').then(m => m.BlankCaptchaModal),
    disableExternalNavigationClose: true,
    modalStyles: {
      canCloseModal: false,
      modalId: 'cl-modal-captcha-wrapper',
      modalStyle: { visibility: 'hidden', pointerEvents: 'none' },
    },
  },
] as const satisfies readonly ModalConfig[];

/**
 * Type-safe modal names derived from registry
 */
export type ModalName = (typeof MODAL_REGISTRY)[number]['name'];

/**
 * Type-safe modal lookup
 */
export type ModalConfigMap = {
  [K in ModalName]: Extract<(typeof MODAL_REGISTRY)[number], { name: K }>;
};

/**
 * Helper: Get modal config by name (type-safe)
 */
export function getModalConfig<T extends ModalName>(name: T): ModalConfigMap[T] | undefined {
  return MODAL_REGISTRY.find(m => m.name === name) as ModalConfigMap[T] | undefined;
}

/**
 * Helper: Capitalize string for component names
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper: Get component name from modal name
 * Convention: `${PascalCase(modalName)}Modal`
 */
export function getModalComponentName(modalName: ModalName): string {
  return `${capitalize(modalName)}Modal`;
}
