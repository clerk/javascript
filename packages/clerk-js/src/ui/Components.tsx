import { createDeferredPromise } from '@clerk/shared';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import type {
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
} from '@clerk/types';
import React, { Suspense } from 'react';

import { clerkUIErrorDOMElementNotFound } from '../core/errors';
import { buildVirtualRouterUrl } from '../utils';
import type { AppearanceCascade } from './customizables/parseAppearance';
// NOTE: Using `./hooks` instead of `./hooks/useClerkModalStateParams` will increase the bundle size
import { useClerkModalStateParams } from './hooks/useClerkModalStateParams';
import type { ClerkComponentName } from './lazyModules/components';
import {
  CreateOrganizationModal,
  ImpersonationFab,
  OrganizationProfileModal,
  preloadComponent,
  SignInModal,
  SignUpModal,
  UserProfileModal,
} from './lazyModules/components';
import {
  LazyComponentRenderer,
  LazyImpersonationFabProvider,
  LazyModalRenderer,
  LazyOneTapRenderer,
  LazyProviders,
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
    T extends 'googleOneTap' | 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile' | 'createOrganization',
  >(
    modal: T,
    props: T extends 'signIn' ? SignInProps : T extends 'signUp' ? SignUpProps : UserProfileProps,
  ) => void;
  closeModal: (
    modal: 'googleOneTap' | 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile' | 'createOrganization',
  ) => void;
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
  organizationProfileModal: null | OrganizationProfileProps;
  createOrganizationModal: null | CreateOrganizationProps;
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
}) as any;

const Components = (props: ComponentsProps) => {
  const [state, setState] = React.useState<ComponentsState>({
    appearance: props.options.appearance,
    options: props.options,
    googleOneTapModal: null,
    signInModal: null,
    signUpModal: null,
    userProfileModal: null,
    organizationProfileModal: null,
    createOrganizationModal: null,
    nodes: new Map(),
    impersonationFab: false,
  });

  const {
    googleOneTapModal,
    signInModal,
    signUpModal,
    userProfileModal,
    organizationProfileModal,
    createOrganizationModal,
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

    componentsControls.closeModal = name => {
      clearUrlStateParam();
      setState(s => ({ ...s, [name + 'Modal']: null }));
    };

    componentsControls.openModal = (name, props) => {
      setState(s => ({ ...s, [name + 'Modal']: props }));
    };

    componentsControls.mountImpersonationFab = () => {
      setState(s => ({ ...s, impersonationFab: true }));
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
        {organizationProfileModal && mountedOrganizationProfileModal}
        {createOrganizationModal && mountedCreateOrganizationModal}
        {state.impersonationFab && (
          <LazyImpersonationFabProvider globalAppearance={state.appearance}>
            <ImpersonationFab />
          </LazyImpersonationFabProvider>
        )}
      </LazyProviders>
    </Suspense>
  );
};
