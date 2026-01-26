import { clerkUIErrorDOMElementNotFound } from '@clerk/shared/internal/clerk-js/errors';
import type { ModuleManager } from '@clerk/shared/moduleManager';
import type {
  __internal_CheckoutProps,
  __internal_EnableOrganizationsPromptProps,
  __internal_PlanDetailsProps,
  __internal_SubscriptionDetailsProps,
  __internal_UserVerificationProps,
  Clerk,
  ClerkOptions,
  CreateOrganizationProps,
  EnvironmentResource,
  GoogleOneTapProps,
  OrganizationProfileProps,
  SignInProps,
  SignUpProps,
  UserProfileProps,
  WaitlistProps,
} from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import React, { Suspense, useCallback, useRef, useSyncExternalStore } from 'react';

import type { AppearanceCascade } from './customizables/parseAppearance';
// NOTE: Using `./hooks` instead of `./hooks/useClerkModalStateParams` will increase the bundle size
import { useClerkModalStateParams } from './hooks/useClerkModalStateParams';
import type { Appearance } from './internal/appearance';
import type { ClerkComponentName } from './lazyModules/components';
import {
  BlankCaptchaModal,
  CreateOrganizationModal,
  EnableOrganizationsPrompt,
  ImpersonationFab,
  KeylessPrompt,
  OrganizationProfileModal,
  preloadComponent,
  SignInModal,
  SignUpModal,
  UserProfileModal,
  UserVerificationModal,
  WaitlistModal,
} from './lazyModules/components';
import { MountedCheckoutDrawer, MountedPlanDetailDrawer, MountedSubscriptionDetailDrawer } from './lazyModules/drawers';
import {
  LazyComponentRenderer,
  LazyEnableOrganizationsPromptProvider,
  LazyImpersonationFabProvider,
  LazyModalRenderer,
  LazyOneTapRenderer,
  LazyProviders,
  OrganizationSwitcherPrefetch,
} from './lazyModules/providers';
import type { AvailableComponentProps } from './types';
import { buildVirtualRouterUrl } from './utils/buildVirtualRouterUrl';
import { disambiguateRedirectOptions } from './utils/disambiguateRedirectOptions';
import { extractCssLayerNameFromAppearance } from './utils/extractCssLayerNameFromAppearance';
import { warnAboutCustomizationWithoutPinning } from './utils/warnAboutCustomizationWithoutPinning';

// Re-export for ClerkUi
export { extractCssLayerNameFromAppearance };

/**
 * Avoid importing from `@clerk/shared/react` to prevent extra dependencies being added to the bundle.
 */
const useSafeLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export const ROOT_ELEMENT_ID = 'clerk-components';

export type ComponentControls = {
  mountComponent: (params: {
    appearanceKey: Uncapitalize<AppearanceCascade['appearanceKey']>;
    name: ClerkComponentName;
    node: HTMLDivElement;
    props?: AvailableComponentProps;
  }) => void;
  unmountComponent: (params: { node: HTMLDivElement }) => void;
  updateProps: (params: {
    appearance?: Appearance | undefined;
    options?: ClerkOptions | undefined;
    node?: HTMLDivElement;
    props?: unknown;
  }) => void;
  openModal: <
    T extends
      | 'googleOneTap'
      | 'signIn'
      | 'signUp'
      | 'userProfile'
      | 'organizationProfile'
      | 'createOrganization'
      | 'userVerification'
      | 'waitlist'
      | 'blankCaptcha'
      | 'enableOrganizationsPrompt',
  >(
    modal: T,
    props: T extends 'signIn'
      ? SignInProps
      : T extends 'signUp'
        ? SignUpProps
        : T extends 'userVerification'
          ? __internal_UserVerificationProps
          : T extends 'waitlist'
            ? WaitlistProps
            : T extends 'enableOrganizationsPrompt'
              ? __internal_EnableOrganizationsPromptProps
              : UserProfileProps,
  ) => void;
  closeModal: (
    modal:
      | 'googleOneTap'
      | 'signIn'
      | 'signUp'
      | 'userProfile'
      | 'organizationProfile'
      | 'createOrganization'
      | 'userVerification'
      | 'waitlist'
      | 'blankCaptcha'
      | 'enableOrganizationsPrompt',
    options?: {
      notify?: boolean;
    },
  ) => void;
  openDrawer: <T extends 'checkout' | 'planDetails' | 'subscriptionDetails'>(
    drawer: T,
    props: T extends 'checkout'
      ? __internal_CheckoutProps
      : T extends 'planDetails'
        ? __internal_PlanDetailsProps
        : T extends 'subscriptionDetails'
          ? __internal_SubscriptionDetailsProps
          : never,
  ) => void;
  closeDrawer: (
    drawer: 'checkout' | 'planDetails' | 'subscriptionDetails',
    options?: {
      notify?: boolean;
    },
  ) => void;
  prefetch: (component: 'organizationSwitcher') => void;
  // Special case, as the impersonation fab mounts automatically
  mountImpersonationFab: () => void;
};

interface HtmlNodeOptions {
  key: string;
  name: ClerkComponentName;
  appearanceKey: Uncapitalize<AppearanceCascade['appearanceKey']>;
  props?: AvailableComponentProps;
}

interface ComponentsProps {
  getClerk: () => Clerk;
  getEnvironment: () => EnvironmentResource | null | undefined;
  options: ClerkOptions;
  onComponentsMounted: () => void;
  moduleManager: ModuleManager;
}

interface ComponentsState {
  appearance: Appearance | undefined;
  options: ClerkOptions | undefined;
  googleOneTapModal: null | GoogleOneTapProps;
  signInModal: null | SignInProps;
  signUpModal: null | SignUpProps;
  userProfileModal: null | UserProfileProps;
  userVerificationModal: null | __internal_UserVerificationProps;
  organizationProfileModal: null | OrganizationProfileProps;
  createOrganizationModal: null | CreateOrganizationProps;
  enableOrganizationsPromptModal: null | __internal_EnableOrganizationsPromptProps;
  blankCaptchaModal: null;
  organizationSwitcherPrefetch: boolean;
  waitlistModal: null | WaitlistProps;
  checkoutDrawer: {
    open: false;
    props: null | __internal_CheckoutProps;
  };
  planDetailsDrawer: {
    open: false;
    props: null | __internal_PlanDetailsProps;
  };
  subscriptionDetailsDrawer: {
    open: false;
    props: null | __internal_SubscriptionDetailsProps;
  };
  impersonationFab: boolean;
}

let portalCt = 0;

function assertDOMElement(element: HTMLElement): asserts element {
  if (!element) {
    clerkUIErrorDOMElementNotFound();
  }
}

export const mountComponentRenderer = (
  getClerk: () => Clerk,
  getEnvironment: () => EnvironmentResource | null | undefined,
  _options: ClerkOptions,
  moduleManager: ModuleManager,
) => {
  const options = { ..._options };
  // Extract cssLayerName from theme if present and move it to appearance level
  if (options.appearance) {
    options.appearance = extractCssLayerNameFromAppearance(options.appearance);
  }

  // TODO: Init of components should start
  // before /env and /client requests
  let clerkRoot = document.getElementById(ROOT_ELEMENT_ID);

  if (!clerkRoot) {
    clerkRoot = document.createElement('div');
    clerkRoot.setAttribute('id', 'clerk-components');
    document.body.appendChild(clerkRoot);
  }

  let componentsControlsResolver: Promise<ComponentControls> | undefined;

  return {
    ensureMounted: (opts?: { preloadHint: ClerkComponentName }) => {
      const { preloadHint } = opts || {};
      // This mechanism ensures that mountComponentControls will only be called once
      // and any calls to .mount before mountComponentControls resolves will fire in order.
      // Otherwise, we risk having components rendered multiple times, or having
      // .unmountComponent incorrectly called before the component is rendered
      if (!componentsControlsResolver) {
        const deferredPromise = createDeferredPromise();
        if (preloadHint) {
          void preloadComponent(preloadHint);
        }
        componentsControlsResolver = import('./lazyModules/common').then(({ createRoot }) => {
          createRoot(clerkRoot).render(
            <Components
              getClerk={getClerk}
              getEnvironment={getEnvironment}
              options={options}
              onComponentsMounted={() => {
                // Defer warning check to avoid blocking component mount
                // Only check in development mode (based on publishable key, not NODE_ENV)
                if (getClerk().instanceType === 'development') {
                  const scheduleWarningCheck =
                    typeof requestIdleCallback === 'function'
                      ? requestIdleCallback
                      : (cb: () => void) => setTimeout(cb, 0);
                  scheduleWarningCheck(() => warnAboutCustomizationWithoutPinning(options));
                }
                deferredPromise.resolve();
              }}
              moduleManager={moduleManager}
            />,
          );
          return deferredPromise.promise.then(() => componentsControls);
        });
      }
      return componentsControlsResolver.then(controls => controls);
    },
  };
};

export type MountComponentRenderer = typeof mountComponentRenderer;

const componentsControls = {} as ComponentControls;

const componentNodes = Object.freeze({
  SignUp: 'signUpModal',
  SignIn: 'signInModal',
  UserProfile: 'userProfileModal',
  OrganizationProfile: 'organizationProfileModal',
  CreateOrganization: 'createOrganizationModal',
  Waitlist: 'waitlistModal',
}) as any;

const Components = (props: ComponentsProps) => {
  const [state, setState] = React.useState<ComponentsState>({
    appearance: props.options.appearance,
    options: props.options,
    googleOneTapModal: null,
    signInModal: null,
    signUpModal: null,
    userProfileModal: null,
    userVerificationModal: null,
    organizationProfileModal: null,
    createOrganizationModal: null,
    enableOrganizationsPromptModal: null,
    organizationSwitcherPrefetch: false,
    waitlistModal: null,
    blankCaptchaModal: null,
    checkoutDrawer: {
      open: false,
      props: null,
    },
    planDetailsDrawer: {
      open: false,
      props: null,
    },
    subscriptionDetailsDrawer: {
      open: false,
      props: null,
    },
    impersonationFab: false,
  });

  const {
    googleOneTapModal,
    signInModal,
    signUpModal,
    userProfileModal,
    userVerificationModal,
    organizationProfileModal,
    createOrganizationModal,
    waitlistModal,
    blankCaptchaModal,
    checkoutDrawer,
    planDetailsDrawer,
    subscriptionDetailsDrawer,
  } = state;
  const clerk = props.getClerk();

  // We do this to ensure this component re-renders before any children listening to this state does.
  // This is necessary since `unmountComponent` uses `setState` to trigger re-renders, but this can
  // happen _after_ `useSyncExternalStore` triggers a re-render. This can cause the Clerk components to
  // re-render and even run effects when they should have already been unmounted.
  // Forcing this to re-render first to remove the children is a workaround for this issue.
  // Note that this does not fix the issue at its root, which is that it's possible for Clerk components
  // to stay mounted even after their node has been removed.
  useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      return clerk.__internal_lastEmittedResources;
    }, [clerk]),
  );

  // See above comment on useSyncExternalStore for why we use a ref to store the nodes instead of state
  const nodesRef = useRef<Map<HTMLDivElement, HtmlNodeOptions>>(new Map());

  const { urlStateParam, clearUrlStateParam, decodedRedirectParams } = useClerkModalStateParams();
  useSafeLayoutEffect(() => {
    if (decodedRedirectParams) {
      setState(s => ({
        ...s,
        [componentNodes[decodedRedirectParams.componentName]]: true,
      }));
    }

    const triggerRender = () => {
      setState(s => ({ ...s }));
    };

    componentsControls.mountComponent = params => {
      const { node, name, props, appearanceKey } = params;
      assertDOMElement(node);
      nodesRef.current.set(node, { key: `p${++portalCt}`, name, props, appearanceKey });
      triggerRender();
    };

    componentsControls.unmountComponent = params => {
      const { node } = params;
      nodesRef.current.delete(node);
      triggerRender();
    };

    componentsControls.updateProps = ({ node, props, ...restProps }) => {
      if (node && props && typeof props === 'object') {
        const nodeOptions = nodesRef.current.get(node);
        if (nodeOptions) {
          nodeOptions.props = { ...props };
          triggerRender();
          return;
        }
      }

      setState(s => ({ ...s, ...restProps, options: { ...s.options, ...restProps.options } }));
    };

    componentsControls.closeModal = (name, options = {}) => {
      const { notify = true } = options;
      clearUrlStateParam();
      setState(s => {
        function handleCloseModalForExperimentalUserVerification() {
          const modal = s[`${name}Modal`];
          if (modal && typeof modal === 'object' && 'afterVerificationCancelled' in modal && notify) {
            // TypeScript doesn't narrow properly with template literal access and 'in' operator
            (modal as { afterVerificationCancelled?: () => void }).afterVerificationCancelled?.();
          }
        }

        /**
         * We need this in order for `Clerk.__experimental_closeUserVerification()`
         * to properly trigger the previously defined `afterVerificationCancelled` callback
         */
        handleCloseModalForExperimentalUserVerification();

        return { ...s, [`${name}Modal`]: null };
      });
    };

    componentsControls.openModal = (name, props) => {
      // Prevent opening enableOrganizations prompt if it's already open
      // It should open the first call and ignore the subsequent calls
      if (name === 'enableOrganizationsPrompt') {
        setState(prev => {
          // Modal is already open, don't update state
          if (prev.enableOrganizationsPromptModal) {
            return prev;
          }

          return { ...prev, [`${name}Modal`]: props };
        });
        return;
      }

      function handleCloseModalForExperimentalUserVerification() {
        if (!('afterVerificationCancelled' in props)) {
          return;
        }

        setState(s => ({
          ...s,
          [`${name}Modal`]: {
            ...props,
            /**
             * When a UserVerification flow is completed, we need to close the modal without trigger a cancellation callback
             */
            afterVerification() {
              props.afterVerification?.();
              componentsControls.closeModal(name, { notify: false });
            },
          },
        }));
      }

      if ('afterVerificationCancelled' in props) {
        handleCloseModalForExperimentalUserVerification();
      } else {
        setState(s => ({ ...s, [`${name}Modal`]: props }));
      }
    };

    componentsControls.mountImpersonationFab = () => {
      setState(s => ({ ...s, impersonationFab: true }));
    };

    componentsControls.openDrawer = (name, props) => {
      setState(s => ({
        ...s,
        [`${name}Drawer`]: {
          open: true,
          props,
        },
      }));
    };

    componentsControls.closeDrawer = name => {
      setState(s => {
        const currentItem = s[`${name}Drawer`];
        // @ts-expect-error `__internal_PlanDetailsProps` does not accept `onClose`
        currentItem?.props?.onClose?.();
        return {
          ...s,
          [`${name}Drawer`]: {
            ...s[`${name}Drawer`],
            open: false,
          },
        };
      });
    };

    componentsControls.prefetch = component => {
      setState(s => ({ ...s, [`${component}Prefetch`]: true }));
    };

    props.onComponentsMounted();
  }, []);

  const mountedOneTapModal = (
    <LazyOneTapRenderer
      componentProps={googleOneTapModal}
      globalAppearance={state.appearance}
      componentAppearance={googleOneTapModal?.appearance}
      startPath={buildVirtualRouterUrl({ base: '/one-tap', path: '' })}
    />
  );

  const mountedSignInModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'signIn'}
      componentAppearance={signInModal?.appearance}
      flowName={'signIn'}
      onClose={() => componentsControls.closeModal('signIn')}
      onExternalNavigate={() => componentsControls.closeModal('signIn')}
      startPath={buildVirtualRouterUrl({ base: '/sign-in', path: urlStateParam?.path })}
      getContainer={signInModal?.getContainer}
      componentName={'SignInModal'}
    >
      <SignInModal {...signInModal} />
      <SignUpModal {...disambiguateRedirectOptions(signInModal, 'signin')} />
      <WaitlistModal {...waitlistModal} />
    </LazyModalRenderer>
  );

  const mountedSignUpModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'signUp'}
      componentAppearance={signUpModal?.appearance}
      flowName={'signUp'}
      onClose={() => componentsControls.closeModal('signUp')}
      onExternalNavigate={() => componentsControls.closeModal('signUp')}
      startPath={buildVirtualRouterUrl({ base: '/sign-up', path: urlStateParam?.path })}
      getContainer={signUpModal?.getContainer}
      componentName={'SignUpModal'}
    >
      <SignInModal {...disambiguateRedirectOptions(signUpModal, 'signup')} />
      <SignUpModal {...signUpModal} />
      <WaitlistModal {...waitlistModal} />
    </LazyModalRenderer>
  );

  const mountedUserProfileModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'userProfile'}
      componentAppearance={userProfileModal?.appearance}
      flowName={'userProfile'}
      onClose={() => componentsControls.closeModal('userProfile')}
      onExternalNavigate={() => componentsControls.closeModal('userProfile')}
      startPath={buildVirtualRouterUrl({
        base: '/user',
        path: userProfileModal?.__experimental_startPath || urlStateParam?.path,
      })}
      getContainer={userProfileModal?.getContainer}
      componentName={'UserProfileModal'}
      modalContainerSx={{ alignItems: 'center' }}
      modalContentSx={t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
    >
      <UserProfileModal {...userProfileModal} />
    </LazyModalRenderer>
  );

  const mountedUserVerificationModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'userVerification'}
      componentAppearance={userVerificationModal?.appearance}
      flowName={'userVerification'}
      onClose={() => componentsControls.closeModal('userVerification')}
      onExternalNavigate={() => componentsControls.closeModal('userVerification')}
      startPath={buildVirtualRouterUrl({ base: '/user-verification', path: urlStateParam?.path })}
      getContainer={userVerificationModal?.getContainer}
      componentName={'UserVerificationModal'}
      modalContainerSx={{ alignItems: 'center' }}
    >
      <UserVerificationModal {...userVerificationModal} />
    </LazyModalRenderer>
  );

  const mountedOrganizationProfileModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'organizationProfile'}
      componentAppearance={organizationProfileModal?.appearance}
      flowName={'organizationProfile'}
      onClose={() => componentsControls.closeModal('organizationProfile')}
      onExternalNavigate={() => componentsControls.closeModal('organizationProfile')}
      startPath={buildVirtualRouterUrl({
        base: '/organizationProfile',
        path: organizationProfileModal?.__experimental_startPath || urlStateParam?.path,
      })}
      getContainer={organizationProfileModal?.getContainer}
      componentName={'OrganizationProfileModal'}
      modalContainerSx={{ alignItems: 'center' }}
      modalContentSx={t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
    >
      <OrganizationProfileModal {...organizationProfileModal} />
    </LazyModalRenderer>
  );

  const mountedCreateOrganizationModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'createOrganization'}
      componentAppearance={createOrganizationModal?.appearance}
      flowName={'createOrganization'}
      onClose={() => componentsControls.closeModal('createOrganization')}
      onExternalNavigate={() => componentsControls.closeModal('createOrganization')}
      startPath={buildVirtualRouterUrl({ base: '/createOrganization', path: urlStateParam?.path })}
      getContainer={createOrganizationModal?.getContainer}
      componentName={'CreateOrganizationModal'}
      modalContainerSx={{ alignItems: 'center' }}
      modalContentSx={t => ({ height: `min(${t.sizes.$120}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
    >
      <CreateOrganizationModal {...createOrganizationModal} />
    </LazyModalRenderer>
  );

  const mountedWaitlistModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'waitlist'}
      componentAppearance={waitlistModal?.appearance}
      flowName={'waitlist'}
      onClose={() => componentsControls.closeModal('waitlist')}
      onExternalNavigate={() => componentsControls.closeModal('waitlist')}
      startPath={buildVirtualRouterUrl({ base: '/waitlist', path: urlStateParam?.path })}
      getContainer={waitlistModal?.getContainer}
      componentName={'WaitlistModal'}
    >
      <WaitlistModal {...waitlistModal} />
      <SignInModal {...waitlistModal} />
    </LazyModalRenderer>
  );

  const mountedBlankCaptchaModal = (
    /**
     * Captcha modal should not close on `Clerk.navigate()`, hence we are not passing `onExternalNavigate`.
     */
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'blankCaptcha' as any}
      componentAppearance={{}}
      flowName={'blankCaptcha'}
      onClose={() => componentsControls.closeModal('blankCaptcha')}
      startPath={buildVirtualRouterUrl({ base: '/blank-captcha', path: urlStateParam?.path })}
      componentName={'BlankCaptchaModal'}
      canCloseModal={false}
      modalId={'cl-modal-captcha-wrapper'}
      modalStyle={{ visibility: 'hidden', pointerEvents: 'none' }}
    >
      <BlankCaptchaModal />
    </LazyModalRenderer>
  );

  return (
    <Suspense fallback={''}>
      <LazyProviders
        clerk={props.getClerk()}
        environment={props.getEnvironment()}
        options={state.options}
        moduleManager={props.moduleManager}
      >
        {[...nodesRef.current].map(([node, component]) => {
          return (
            <LazyComponentRenderer
              key={component.key}
              node={node}
              globalAppearance={state.appearance}
              appearanceKey={component.appearanceKey}
              componentAppearance={component.props?.appearance}
              componentName={component.name}
              componentProps={component.props}
            />
          );
        })}

        {googleOneTapModal && mountedOneTapModal}
        {signInModal && mountedSignInModal}
        {signUpModal && mountedSignUpModal}
        {userProfileModal && mountedUserProfileModal}
        {userVerificationModal && mountedUserVerificationModal}
        {organizationProfileModal && mountedOrganizationProfileModal}
        {createOrganizationModal && mountedCreateOrganizationModal}
        {waitlistModal && mountedWaitlistModal}
        {blankCaptchaModal && mountedBlankCaptchaModal}

        <MountedCheckoutDrawer
          appearance={state.appearance}
          checkoutDrawer={checkoutDrawer}
          onOpenChange={() => componentsControls.closeDrawer('checkout')}
        />

        <MountedPlanDetailDrawer
          appearance={state.appearance}
          planDetailsDrawer={planDetailsDrawer}
          onOpenChange={() => componentsControls.closeDrawer('planDetails')}
        />

        <MountedSubscriptionDetailDrawer
          appearance={state.appearance}
          subscriptionDetailsDrawer={subscriptionDetailsDrawer}
          onOpenChange={() => componentsControls.closeDrawer('subscriptionDetails')}
        />

        {state.impersonationFab && (
          <LazyImpersonationFabProvider globalAppearance={state.appearance}>
            <ImpersonationFab />
          </LazyImpersonationFabProvider>
        )}

        {state.enableOrganizationsPromptModal && (
          <LazyEnableOrganizationsPromptProvider globalAppearance={state.appearance}>
            <EnableOrganizationsPrompt {...state.enableOrganizationsPromptModal} />
          </LazyEnableOrganizationsPromptProvider>
        )}

        {state.options?.__internal_keyless_claimKeylessApplicationUrl &&
          state.options?.__internal_keyless_copyInstanceKeysUrl && (
            <LazyImpersonationFabProvider globalAppearance={state.appearance}>
              <KeylessPrompt
                claimUrl={state.options.__internal_keyless_claimKeylessApplicationUrl}
                copyKeysUrl={state.options.__internal_keyless_copyInstanceKeysUrl}
                onDismiss={state.options.__internal_keyless_dismissPrompt}
              />
            </LazyImpersonationFabProvider>
          )}

        <Suspense>{state.organizationSwitcherPrefetch && <OrganizationSwitcherPrefetch />}</Suspense>
      </LazyProviders>
    </Suspense>
  );
};
