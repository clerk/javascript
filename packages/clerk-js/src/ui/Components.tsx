import type { Appearance, Clerk, ClerkOptions, EnvironmentResource, SignInProps, SignUpProps } from '@clerk/types';
import { OrganizationProfileProps } from '@clerk/types';
import { UserProfileProps } from '@clerk/types/src';
import React from 'react';
import ReactDOM from 'react-dom';

import { PRESERVED_QUERYSTRING_PARAMS } from '../core/constants';
import { clerkUIErrorDOMElementNotFound } from '../core/errors';
import { EnvironmentProvider, OptionsProvider } from './contexts';
import { CoreClerkContextWrapper } from './contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from './customizables';
import { FlowMetadataProvider, Modal } from './elements';
import { useSafeLayoutEffect } from './hooks';
import { ImpersonationFab } from './ImpersonationFab';
import Portal from './portal';
import { VirtualRouter } from './router';
import { SignIn, SignInModal } from './SignIn';
import { SignUp, SignUpModal } from './SignUp';
import { InternalThemeProvider } from './styledSystem';
import type { AvailableComponentProps } from './types';
import { AvailableComponentCtx } from './types';
import { UserButton } from './UserButton';
import { UserProfile, UserProfileModal } from './UserProfile';

const ROOT_ELEMENT_ID = 'clerk-components';

export type MountComponentRenderer = (
  clerk: Clerk,
  environment: EnvironmentResource,
  options: ClerkOptions,
) => ComponentControls;

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
  openModal: <T extends 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile'>(
    modal: T,
    props: T extends 'signIn' ? SignInProps : T extends 'signUp' ? SignUpProps : UserProfileProps,
  ) => void;
  closeModal: (modal: 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile') => void;
};

const AvailableComponents = {
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  OrganizationProfile: () => <div>hello from org profile</div>,
  OrganizationSwitcher: () => <div>hello from org switcher</div>,
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
}

interface ComponentsState {
  appearance: Appearance | undefined;
  options: ClerkOptions | undefined;
  signInModal: null | SignInProps;
  signUpModal: null | SignUpProps;
  userProfileModal: null | UserProfileProps;
  organizationProfileModal: null | OrganizationProfileProps;
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
}

let portalCt = 0;

function assertDOMElement(element: HTMLElement): asserts element {
  if (!element) {
    clerkUIErrorDOMElementNotFound();
  }
}

export const mountComponentRenderer = (
  clerk: Clerk,
  environment: EnvironmentResource,
  options: ClerkOptions,
): ComponentControls => {
  // TODO: Init of components should start
  // before /env and /client requests
  let clerkRoot = document.getElementById(ROOT_ELEMENT_ID);

  if (!clerkRoot) {
    clerkRoot = document.createElement('div');
    clerkRoot.setAttribute('id', 'clerk-components');
    document.body.appendChild(clerkRoot);
  }

  ReactDOM.render<ComponentsProps>(
    <Components
      clerk={clerk}
      environment={environment}
      options={options}
    />,
    clerkRoot,
  );

  return componentsControls;
};

const componentsControls = {} as ComponentControls;

const Components = (props: ComponentsProps) => {
  const [state, setState] = React.useState<ComponentsState>({
    appearance: props.options.appearance,
    options: props.options,
    signInModal: null,
    signUpModal: null,
    userProfileModal: null,
    organizationProfileModal: null,
    nodes: new Map(),
  });
  const { signInModal, signUpModal, userProfileModal, organizationProfileModal, nodes } = state;

  useSafeLayoutEffect(() => {
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
      setState(s => ({ ...s, [name + 'Modal']: null }));
    };

    componentsControls.openModal = (name, props) => {
      setState(s => ({ ...s, [name + 'Modal']: props }));
    };
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
              startPath='/sign-in'
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
              startPath='/sign-up'
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
            containerSx={{
              alignItems: 'center',
            }}
            contentSx={t => ({
              height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`,
              margin: 0,
              // height: t.sizes.$176,
              // maxHeight: `min(${t.sizes.$176}, calc(100vh - ${t.sizes.$20}))`,
            })}
          >
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('userProfile')}
              startPath='/user'
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
            contentSx={t => ({
              height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`,
              margin: 0,
            })}
          >
            <VirtualRouter
              preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              onExternalNavigate={() => componentsControls.closeModal('organizationProfile')}
              startPath='/user'
            >
              hello from org profil
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
          {mountedImpersonationFab}
        </OptionsProvider>
      </EnvironmentProvider>
    </CoreClerkContextWrapper>
  );
};
