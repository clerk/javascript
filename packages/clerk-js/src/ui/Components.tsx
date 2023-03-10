import { createDeferredPromise } from '@clerk/shared';
import type {
  Appearance,
  Clerk,
  ClerkOptions,
  CreateOrganizationProps,
  EnvironmentResource,
  OrganizationProfileProps,
  SignInProps,
  SignUpProps,
  UserProfileProps,
} from '@clerk/types';
import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { PRESERVED_QUERYSTRING_PARAMS } from '../core/constants';
import { clerkUIErrorDOMElementNotFound } from '../core/errors';
import { buildVirtualRouterUrl } from '../utils';
const SignIn = lazy(() => import('./components/SignIn').then(module => ({ default: module.SignIn })));
const SignInModal = lazy(() => import('./components/SignIn').then(module => ({ default: module.SignInModal })));
const SignUp = lazy(() => import('./components/SignUp').then(module => ({ default: module.SignUp })));
const SignUpModal = lazy(() => import('./components/SignUp').then(module => ({ default: module.SignUpModal })));
const UserButton = lazy(() => import('./components/UserButton').then(module => ({ default: module.UserButton })));
const UserProfile = lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
const UserProfileModal = lazy(() =>
  import('./components/UserProfile').then(module => ({ default: module.UserProfileModal })),
);
const CreateOrganization = lazy(() =>
  import('./components/CreateOrganization').then(module => ({ default: module.CreateOrganization })),
);
const CreateOrganizationModal = lazy(() =>
  import('./components/CreateOrganization').then(module => ({ default: module.CreateOrganizationModal })),
);
const OrganizationProfile = lazy(() =>
  import('./components/OrganizationProfile').then(module => ({ default: module.OrganizationProfile })),
);
const OrganizationProfileModal = lazy(() =>
  import('./components/OrganizationProfile').then(module => ({ default: module.OrganizationProfileModal })),
);
const OrganizationSwitcher = lazy(() =>
  import('./components/OrganizationSwitcher').then(module => ({ default: module.OrganizationSwitcher })),
);
const ImpersonationFab = lazy(() =>
  import('./components/ImpersonationFab').then(module => ({ default: module.ImpersonationFab })),
);

import { EnvironmentProvider, OptionsProvider } from './contexts';
import { CoreClerkContextWrapper } from './contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from './customizables';
import { FlowMetadataProvider, Modal } from './elements';
import { useClerkModalStateParams, useSafeLayoutEffect } from './hooks';
import Portal from './portal';
import { VirtualRouter } from './router';
import { InternalThemeProvider } from './styledSystem';
import type { AvailableComponentCtx, AvailableComponentProps } from './types';

const ROOT_ELEMENT_ID = 'clerk-components';

export type ComponentControls = {
  mountComponent: (params: {
    appearanceKey: Uncapitalize<AvailableComponentNames>;
    name: AvailableComponentNames;
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
  openModal: <T extends 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile' | 'createOrganization'>(
    modal: T,
    props: T extends 'signIn' ? SignInProps : T extends 'signUp' ? SignUpProps : UserProfileProps,
  ) => void;
  closeModal: (modal: 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile' | 'createOrganization') => void;
};

const AvailableComponents = {
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  OrganizationSwitcher,
  OrganizationProfile,
  CreateOrganization,
};

type AvailableComponentNames = keyof typeof AvailableComponents;

interface HtmlNodeOptions {
  key: string;
  name: AvailableComponentNames;
  appearanceKey: Uncapitalize<AvailableComponentNames>;
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
  signInModal: null | SignInProps;
  signUpModal: null | SignUpProps;
  userProfileModal: null | UserProfileProps;
  organizationProfileModal: null | OrganizationProfileProps;
  createOrganizationModal: null | CreateOrganizationProps;
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
}

let portalCt = 0;

function assertDOMElement(element: HTMLElement): asserts element {
  if (!element) {
    clerkUIErrorDOMElementNotFound();
  }
}

export const mountComponentRenderer = async (
  clerk: Clerk,
  environment: EnvironmentResource,
  options: ClerkOptions,
): Promise<ComponentControls> => {
  // TODO: Init of components should start
  // before /env and /client requests
  let clerkRoot = document.getElementById(ROOT_ELEMENT_ID);

  if (!clerkRoot) {
    clerkRoot = document.createElement('div');
    clerkRoot.setAttribute('id', 'clerk-components');
    document.body.appendChild(clerkRoot);
  }

  const deferredPromise = createDeferredPromise();
  createRoot(clerkRoot).render(
    <Components
      clerk={clerk}
      environment={environment}
      options={options}
      onComponentsMounted={deferredPromise.resolve}
    />,
  );

  await deferredPromise.promise;
  return componentsControls;
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
    signInModal: null,
    signUpModal: null,
    userProfileModal: null,
    organizationProfileModal: null,
    createOrganizationModal: null,
    nodes: new Map(),
  });
  const { signInModal, signUpModal, userProfileModal, organizationProfileModal, createOrganizationModal, nodes } =
    state;

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
      setState(s => ({ ...s, ...restProps }));
    };

    componentsControls.closeModal = name => {
      clearUrlStateParam();
      setState(s => ({ ...s, [name + 'Modal']: null }));
    };

    componentsControls.openModal = (name, props) => {
      setState(s => ({ ...s, [name + 'Modal']: props }));
    };

    props.onComponentsMounted();
  }, []);

  const mountedSignInModal = (
    <AppearanceProvider
      globalAppearance={state.appearance}
      appearanceKey='signIn'
      appearance={signInModal?.appearance}
    >
      <FlowMetadataProvider flow={'signIn'}>
        <InternalThemeProvider>
          <Modal handleClose={() => componentsControls.closeModal('signIn')}>
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('signIn')}
              startPath={buildVirtualRouterUrl({ base: '/sign-in', path: urlStateParam?.path })}
            >
              <SignInModal {...signInModal} />
              <SignUpModal
                afterSignInUrl={signInModal?.afterSignInUrl}
                afterSignUpUrl={signInModal?.afterSignUpUrl}
                redirectUrl={signInModal?.redirectUrl}
              />
            </VirtualRouter>
          </Modal>
        </InternalThemeProvider>
      </FlowMetadataProvider>
    </AppearanceProvider>
  );

  const mountedSignUpModal = (
    <AppearanceProvider
      globalAppearance={state.appearance}
      appearanceKey='signUp'
      appearance={signUpModal?.appearance}
    >
      <FlowMetadataProvider flow={'signUp'}>
        <InternalThemeProvider>
          <Modal handleClose={() => componentsControls.closeModal('signUp')}>
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('signUp')}
              startPath={buildVirtualRouterUrl({ base: '/sign-up', path: urlStateParam?.path })}
            >
              <SignInModal
                afterSignInUrl={signUpModal?.afterSignInUrl}
                afterSignUpUrl={signUpModal?.afterSignUpUrl}
                redirectUrl={signUpModal?.redirectUrl}
              />
              <SignUpModal {...signUpModal} />
            </VirtualRouter>
          </Modal>
        </InternalThemeProvider>
      </FlowMetadataProvider>
    </AppearanceProvider>
  );

  const mountedUserProfileModal = (
    <AppearanceProvider
      globalAppearance={state.appearance}
      appearanceKey='userProfile'
      appearance={userProfileModal?.appearance}
    >
      <FlowMetadataProvider flow='userProfile'>
        <InternalThemeProvider>
          <Modal
            handleClose={() => componentsControls.closeModal('userProfile')}
            containerSx={{ alignItems: 'center' }}
            contentSx={t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
          >
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('userProfile')}
              startPath={buildVirtualRouterUrl({ base: '/user', path: urlStateParam?.path })}
            >
              <UserProfileModal />
            </VirtualRouter>
          </Modal>
        </InternalThemeProvider>
      </FlowMetadataProvider>
    </AppearanceProvider>
  );

  const mountedOrganizationProfileModal = (
    <AppearanceProvider
      globalAppearance={state.appearance}
      appearanceKey='organizationProfile'
      appearance={organizationProfileModal?.appearance}
    >
      <FlowMetadataProvider flow='organizationProfile'>
        <InternalThemeProvider>
          <Modal
            handleClose={() => componentsControls.closeModal('organizationProfile')}
            containerSx={{ alignItems: 'center' }}
            contentSx={t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
          >
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('organizationProfile')}
              startPath={buildVirtualRouterUrl({ base: '/organizationProfile', path: urlStateParam?.path })}
            >
              <OrganizationProfileModal {...organizationProfileModal} />
            </VirtualRouter>
          </Modal>
        </InternalThemeProvider>
      </FlowMetadataProvider>
    </AppearanceProvider>
  );

  const mountedCreateOrganizationModal = (
    <AppearanceProvider
      globalAppearance={state.appearance}
      appearanceKey='createOrganization'
      appearance={createOrganizationModal?.appearance}
    >
      <FlowMetadataProvider flow='createOrganization'>
        <InternalThemeProvider>
          <Modal
            handleClose={() => componentsControls.closeModal('createOrganization')}
            containerSx={{ alignItems: 'center' }}
            contentSx={t => ({ height: `min(${t.sizes.$120}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
          >
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('createOrganization')}
              startPath={buildVirtualRouterUrl({ base: '/createOrganization', path: urlStateParam?.path })}
            >
              <CreateOrganizationModal {...createOrganizationModal} />
            </VirtualRouter>
          </Modal>
        </InternalThemeProvider>
      </FlowMetadataProvider>
    </AppearanceProvider>
  );

  const mountedImpersonationFab = (
    <AppearanceProvider
      globalAppearance={state.appearance}
      appearanceKey='impersonationFab'
    >
      <InternalThemeProvider>
        <ImpersonationFab />
      </InternalThemeProvider>
    </AppearanceProvider>
  );

  return (
    <CoreClerkContextWrapper clerk={props.clerk}>
      <EnvironmentProvider value={props.environment}>
        <OptionsProvider value={state.options}>
          {[...nodes].map(([node, component]) => {
            return (
              <AppearanceProvider
                key={component.key}
                globalAppearance={state.appearance}
                appearanceKey={component.appearanceKey}
                appearance={component.props?.appearance}
              >
                <Portal<AvailableComponentCtx>
                  componentName={component.name}
                  key={component.key}
                  component={AvailableComponents[component.name]}
                  props={component.props || {}}
                  node={node}
                  preservedParams={PRESERVED_QUERYSTRING_PARAMS}
                />
              </AppearanceProvider>
            );
          })}

          <Suspense fallback={''}>
            {signInModal && mountedSignInModal}
            {signUpModal && mountedSignUpModal}
            {userProfileModal && mountedUserProfileModal}
            {organizationProfileModal && mountedOrganizationProfileModal}
            {createOrganizationModal && mountedCreateOrganizationModal}
            {mountedImpersonationFab}
          </Suspense>
        </OptionsProvider>
      </EnvironmentProvider>
    </CoreClerkContextWrapper>
  );
};
