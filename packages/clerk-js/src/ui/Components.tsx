import { useSafeLayoutEffect } from '@clerk/shared/react';
import { createDeferredPromise } from '@clerk/shared/utils';
import type {
  __internal_UserVerificationProps,
  Appearance,
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
} from '@clerk/types';
import React, { Suspense } from 'react';

import { clerkUIErrorDOMElementNotFound } from '../core/errors';
import { buildVirtualRouterUrl } from '../utils';
import type { AppearanceCascade } from './customizables/parseAppearance';
// NOTE: Using `./hooks` instead of `./hooks/useClerkModalStateParams` will increase the bundle size
import { useClerkModalStateParams } from './hooks/useClerkModalStateParams';
import type { ClerkComponentName } from './lazyModules/components';
import {
  BlankCaptchaModal,
  CreateOrganizationModal,
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
import {
  LazyComponentRenderer,
  LazyImpersonationFabProvider,
  LazyModalRenderer,
  LazyOneTapRenderer,
  LazyProviders,
  OrganizationSwitcherPrefetch,
} from './lazyModules/providers';
import type { AvailableComponentProps } from './types';

const ROOT_ELEMENT_ID = 'clerk-components';

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
      | 'blankCaptcha',
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
      | 'blankCaptcha',
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
  clerk: Clerk;
  environment: EnvironmentResource;
  options: ClerkOptions;
  onComponentsMounted: () => void;
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
  blankCaptchaModal: null;
  organizationSwitcherPrefetch: boolean;
  waitlistModal: null | WaitlistProps;
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
  impersonationFab: boolean;
}

let portalCt = 0;

function assertDOMElement(element: HTMLElement): asserts element {
  if (!element) {
    clerkUIErrorDOMElementNotFound();
  }
}

export const mountComponentRenderer = (clerk: Clerk, environment: EnvironmentResource, options: ClerkOptions) => {
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
    ensureMounted: async (opts?: { preloadHint: ClerkComponentName }) => {
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
              clerk={clerk}
              environment={environment}
              options={options}
              onComponentsMounted={deferredPromise.resolve}
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
    organizationSwitcherPrefetch: false,
    waitlistModal: null,
    blankCaptchaModal: null,
    nodes: new Map(),
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
    nodes,
  } = state;

  const { urlStateParam, clearUrlStateParam, decodedRedirectParams } = useClerkModalStateParams();

  useSafeLayoutEffect(() => {
    if (decodedRedirectParams) {
      setState(s => ({
        ...s,
        [componentNodes[decodedRedirectParams.componentName]]: true,
      }));
    }

    componentsControls.mountComponent = params => {
      const { node, name, props, appearanceKey } = params;
      assertDOMElement(node);
      setState(s => {
        s.nodes.set(node, { key: `p${++portalCt}`, name, props, appearanceKey });
        return { ...s, nodes };
      });
    };

    componentsControls.unmountComponent = params => {
      const { node } = params;
      setState(s => {
        s.nodes.delete(node);
        return { ...s, nodes };
      });
    };

    componentsControls.updateProps = ({ node, props, ...restProps }) => {
      if (node && props && typeof props === 'object') {
        const nodeOptions = state.nodes.get(node);
        if (nodeOptions) {
          nodeOptions.props = { ...props };
          setState(s => ({ ...s }));
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
          const modal = s[`${name}Modal`] || {};
          if ('afterVerificationCancelled' in modal && notify) {
            modal.afterVerificationCancelled?.();
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
      componentName={'SignInModal'}
    >
      <SignInModal {...signInModal} />
      <SignUpModal {...signInModal} />
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
      componentName={'SignUpModal'}
    >
      <SignInModal {...signUpModal} />
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
      componentName={'UserVerificationModal'}
      modalContainerSx={{ alignItems: 'center' }}
      modalContentSx={t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
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
        path: urlStateParam?.path,
      })}
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
      componentName={'WaitlistModal'}
    >
      <WaitlistModal {...waitlistModal} />
      <SignInModal {...waitlistModal} />
    </LazyModalRenderer>
  );

  const mountedBlankCaptchaModal = (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={'blankCaptcha' as any}
      componentAppearance={{}}
      flowName={'blankCaptcha'}
      onClose={() => componentsControls.closeModal('blankCaptcha')}
      onExternalNavigate={() => componentsControls.closeModal('blankCaptcha')}
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
        clerk={props.clerk}
        environment={props.environment}
        options={state.options}
      >
        {[...nodes].map(([node, component]) => {
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

        {state.impersonationFab && (
          <LazyImpersonationFabProvider globalAppearance={state.appearance}>
            <ImpersonationFab />
          </LazyImpersonationFabProvider>
        )}

        {__BUILD_FLAG_KEYLESS_UI__
          ? state.options?.__internal_claimKeylessApplicationUrl && (
              <LazyImpersonationFabProvider globalAppearance={state.appearance}>
                <KeylessPrompt url={state.options.__internal_claimKeylessApplicationUrl} />
              </LazyImpersonationFabProvider>
            )
          : null}

        <Suspense>{state.organizationSwitcherPrefetch && <OrganizationSwitcherPrefetch />}</Suspense>
      </LazyProviders>
    </Suspense>
  );
};
