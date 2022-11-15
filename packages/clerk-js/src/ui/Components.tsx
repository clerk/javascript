import { createDeferredPromise, snakeToCamel } from '@clerk/shared';
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
import React from 'react';
import { createRoot } from 'react-dom/client';

import { PRESERVED_QUERYSTRING_PARAMS } from '../core/constants';
import { clerkUIErrorDOMElementNotFound } from '../core/errors';
import { getClerkQueryParam, removeClerkQueryParam } from '../utils';
import { CreateOrganization, CreateOrganizationModal } from './components/CreateOrganization';
import { ImpersonationFab } from './components/ImpersonationFab';
import { OrganizationProfile, OrganizationProfileModal } from './components/OrganizationProfile';
import { OrganizationSwitcher } from './components/OrganizationSwitcher';
import { SignIn, SignInModal } from './components/SignIn';
import { SignUp, SignUpModal } from './components/SignUp';
import { UserButton } from './components/UserButton';
import { UserProfile, UserProfileModal } from './components/UserProfile';
import { EnvironmentProvider, OptionsProvider } from './contexts';
import { CoreClerkContextWrapper } from './contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from './customizables';
import { FlowMetadataProvider, Modal } from './elements';
import { useSafeLayoutEffect } from './hooks';
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

// TODO: move this elsewhere
const componentNodes = Object.freeze({
  SignUp: 'signUpModal',
  SignIn: 'signInModal',
  UserProfile: 'userProfileModal',
  OrganizationProfile: 'organizationProfileModal',
  CreateOrganization: 'createOrganizationModal',
});

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

  const [urlState, setUrlState] = React.useState(null);

  const readAndRemoveStateParam = () => {
    const urlClerkState = getClerkQueryParam('__clerk_state') ?? '';
    removeClerkQueryParam('__clerk_state');
    return urlClerkState ? JSON.parse(atob(urlClerkState)) : null;
  };

  const decodedRedirectParams = readAndRemoveStateParam() ?? '';

  useSafeLayoutEffect(() => {
    if (decodedRedirectParams) {
      setUrlState(decodedRedirectParams);
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
      setUrlState(null);
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
              startPath={state.options?.startPath || '/sign-in'}
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
              startPath={state.options?.startPath || '/sign-up'}
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
              // startPath={state.options?.startPath || '/user'}
              startPath={`/user${urlState?.path || ''}`}
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
              startPath={state.options?.startPath || '/organization'}
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
              startPath={state.options?.startPath || '/create-organization'}
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

          {signInModal && mountedSignInModal}
          {signUpModal && mountedSignUpModal}
          {userProfileModal && mountedUserProfileModal}
          {organizationProfileModal && mountedOrganizationProfileModal}
          {createOrganizationModal && mountedCreateOrganizationModal}
          {mountedImpersonationFab}
        </OptionsProvider>
      </EnvironmentProvider>
    </CoreClerkContextWrapper>
  );
};
