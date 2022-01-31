import React from 'react';
import ReactDOM from 'react-dom';
import { SIGN_UP_IN_PRESERVED_PARAMS } from 'core/constants';
import { clerkUIErrorDOMElementNotFound } from 'core/errors';
import type {
  SignInCtx,
  SignUpCtx,
  UserButtonCtx,
  UserProfileCtx,
} from 'ui/contexts';
import { EnvironmentProvider, OptionsProvider } from 'ui/contexts';
import { VirtualRouter } from 'ui/router';
import Portal from './portal';
import { SignIn, SignInModal } from './signIn';
import { SignUp, SignUpModal } from './signUp';
import { UserButton } from './userButton';
import { UserProfile } from './userProfile';
import { Modal } from '@clerk/shared/components/modal';
import { camelToSnakeKeys } from '@clerk/shared/utils/object';

import type {
  Clerk,
  ClerkOptions,
  DeepPartial,
  DisplayThemeJSON,
  EnvironmentResource,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
} from '@clerk/types';

import './styles/clerk.scss';
import { CoreClerkContextWrapper } from './contexts/CoreClerkContextWrapper';
import { injectTheme } from 'utils/theming';

export interface MountProps<T> {
  key: string;
  props: T;
}

export interface ComponentsProps {
  clerk: Clerk;
  environment: EnvironmentResource;
  options: ClerkOptions;
}

export interface ComponentsState {
  signInModal: null | SignInProps;
  signUpModal: null | SignUpProps;
  signInNodes: Map<HTMLDivElement, MountProps<SignInProps>>;
  signUpNodes: Map<HTMLDivElement, MountProps<SignUpProps>>;
  userProfileNodes: Map<HTMLDivElement, MountProps<UserProfileProps>>;
  userButtonNodes: Map<HTMLDivElement, MountProps<UserButtonProps>>;
}

let portalCt = 0;

function assertDOMElement(element: HTMLElement): asserts element {
  if (!element) {
    clerkUIErrorDOMElementNotFound();
  }
}

export default class Components extends React.Component<
  ComponentsProps,
  ComponentsState
> {
  state: ComponentsState = {
    signInModal: null,
    signUpModal: null,
    signInNodes: new Map<HTMLDivElement, MountProps<SignInProps>>(),
    signUpNodes: new Map<HTMLDivElement, MountProps<SignUpProps>>(),
    userProfileNodes: new Map<HTMLDivElement, MountProps<UserProfileProps>>(),
    userButtonNodes: new Map<HTMLDivElement, MountProps<UserButtonProps>>(),
  };

  static render(
    clerk: Clerk,
    environment: EnvironmentResource,
    options: ClerkOptions,
  ): Components {
    /**  Merge theme retrieved from the network with user supplied theme options. */
    injectTheme(
      environment.displayConfig.theme,
      camelToSnakeKeys(options.theme || {}) as DeepPartial<DisplayThemeJSON>,
    );

    const clerkRoot = document.createElement('DIV');
    clerkRoot.setAttribute('id', 'clerk-components');
    document.body.appendChild(clerkRoot);

    // eslint-disable-next-line react/no-render-return-value
    return ReactDOM.render<ComponentsProps, Components>(
      <Components clerk={clerk} environment={environment} options={options} />,
      clerkRoot,
    );
  }

  private static _addMountNodeClass(node: HTMLDivElement, className: string) {
    node.className = 'cl-component ' + className;
  }

  openSignIn = (nodeProps: SignInProps = {}): void => {
    this.setState({ signInModal: nodeProps });
  };

  closeSignIn = (): void => {
    this.setState({ signInModal: null });
  };

  openSignUp = (nodeProps: SignUpProps = {}): void => {
    this.setState({ signUpModal: nodeProps });
  };

  closeSignUp = (): void => {
    this.setState({ signUpModal: null });
  };

  mountSignIn = (node: HTMLDivElement, nodeProps: SignInProps): void => {
    assertDOMElement(node);
    Components._addMountNodeClass(node, 'cl-sign-in');
    this.setState(state => {
      const signInNodes = new Map(state.signInNodes);
      portalCt = portalCt + 1;
      signInNodes.set(node, {
        key: `p${portalCt}`,
        props: nodeProps,
      });
      return { signInNodes };
    });
  };

  unmountSignIn = (node: HTMLDivElement): void => {
    this.setState(state => {
      const newNodes = new Map(state.signInNodes);
      newNodes.delete(node);
      return { signInNodes: newNodes };
    });
  };

  mountSignUp = (node: HTMLDivElement, signUpProps: SignUpProps): void => {
    assertDOMElement(node);
    Components._addMountNodeClass(node, 'cl-sign-up');
    this.setState(state => {
      const signUpNodes = new Map(state.signUpNodes);
      portalCt = portalCt + 1;
      signUpNodes.set(node, {
        key: `p${portalCt}`,
        props: signUpProps,
      });
      return { signUpNodes };
    });
  };

  unmountSignUp = (node: HTMLDivElement): void => {
    this.setState(state => {
      const newNodes = new Map(state.signUpNodes);
      newNodes.delete(node);
      return { signUpNodes: newNodes };
    });
  };

  mountUserProfile = (
    node: HTMLDivElement,
    userProfileProps: UserProfileProps,
  ): void => {
    assertDOMElement(node);
    Components._addMountNodeClass(node, 'cl-user-profile');
    this.setState(state => {
      const userProfileNodes = new Map(state.userProfileNodes);
      portalCt = portalCt + 1;
      userProfileNodes.set(node, {
        key: `p${portalCt}`,
        props: userProfileProps,
      });
      return { userProfileNodes };
    });
  };

  unmountUserProfile = (node: HTMLDivElement): void => {
    this.setState(state => {
      const newNodes = new Map(state.userProfileNodes);
      newNodes.delete(node);
      return { userProfileNodes: newNodes };
    });
  };

  mountUserButton = (
    node: HTMLDivElement,
    userButtonProps: UserButtonProps,
  ): void => {
    assertDOMElement(node);
    Components._addMountNodeClass(node, 'cl-user-button');
    this.setState(state => {
      const userButtonNodes = new Map(state.userButtonNodes);
      portalCt = portalCt + 1;
      userButtonNodes.set(node, {
        key: `p${portalCt}`,
        props: userButtonProps,
      });
      return { userButtonNodes };
    });
  };

  unmountUserButton = (node: HTMLDivElement): void => {
    this.setState(state => {
      const newNodes = new Map(state.userButtonNodes);
      newNodes.delete(node);
      return { userButtonNodes: newNodes };
    });
  };

  render(): JSX.Element {
    const {
      signInModal,
      signUpModal,
      signInNodes,
      signUpNodes,
      userProfileNodes,
      userButtonNodes,
    } = this.state;

    const mountedSignInNodes = [...signInNodes.keys()].map(k => {
      const data = signInNodes.get(k) as MountProps<SignInProps>;
      return (
        <Portal<SignInCtx>
          componentName='SignIn'
          key={data.key}
          component={SignIn}
          props={data.props}
          node={k}
          preservedParams={SIGN_UP_IN_PRESERVED_PARAMS}
        />
      );
    });

    const mountedSignUpNodes = [...signUpNodes.keys()].map(k => {
      const data = signUpNodes.get(k) as MountProps<SignUpProps>;
      return (
        <Portal<SignUpCtx>
          componentName='SignUp'
          key={data.key}
          component={SignUp}
          props={data.props}
          node={k}
          preservedParams={SIGN_UP_IN_PRESERVED_PARAMS}
        />
      );
    });

    const mountedUserProfileNodes = [...userProfileNodes.keys()].map(k => {
      const data = userProfileNodes.get(k) as MountProps<UserProfileProps>;
      return (
        <Portal<UserProfileCtx>
          componentName='UserProfile'
          key={data.key}
          component={UserProfile}
          props={data.props}
          node={k}
        />
      );
    });

    const mountedUserButtonNodes = [...userButtonNodes.keys()].map(k => {
      const data = userButtonNodes.get(k) as MountProps<UserButtonProps>;
      return (
        <Portal<UserButtonCtx>
          componentName='UserButton'
          key={data.key}
          component={UserButton}
          props={data.props}
          node={k}
        />
      );
    });

    const mountedSignInModal = (
      <Modal
        active
        handleClose={() => this.closeSignIn()}
        className='cl-modal-backdrop'
        modalClassname='cl-modal-container'
      >
        <VirtualRouter
          preservedParams={SIGN_UP_IN_PRESERVED_PARAMS}
          onExternalNavigate={() => this.closeSignIn()}
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
    );

    const mountedSignUpModal = (
      <Modal
        active
        handleClose={() => this.closeSignUp()}
        className='cl-modal-backdrop'
        modalClassname='cl-modal-container'
      >
        <VirtualRouter
          preservedParams={SIGN_UP_IN_PRESERVED_PARAMS}
          onExternalNavigate={() => this.closeSignUp()}
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
    );

    return (
      <CoreClerkContextWrapper clerk={this.props.clerk}>
        <EnvironmentProvider value={this.props.environment}>
          <OptionsProvider value={this.props.options}>
            {mountedSignInNodes}
            {mountedSignUpNodes}
            {mountedUserProfileNodes}
            {mountedUserButtonNodes}
            {signInModal && mountedSignInModal}
            {signUpModal && mountedSignUpModal}
          </OptionsProvider>
        </EnvironmentProvider>
      </CoreClerkContextWrapper>
    );
  }
}
