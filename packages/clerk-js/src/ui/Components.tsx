/* eslint-disable simple-import-sort/imports */
/* disable sorting, clerk.scss should always be imported
/* after dependencies from /shared */
import { Modal } from '@clerk/shared/components/modal';
import { deepCamelToSnake } from '@clerk/shared/utils/object';
import type {
  Clerk,
  ClerkOptions,
  DeepPartial,
  DisplayThemeJSON,
  EnvironmentResource,
  SignInProps,
  SignUpProps,
} from '@clerk/types';

import { PRESERVED_QUERYSTRING_PARAMS } from 'core/constants';
import { clerkUIErrorDOMElementNotFound } from 'core/errors';
import React from 'react';
import ReactDOM from 'react-dom';
import { EnvironmentProvider, OptionsProvider } from 'ui/contexts';
import { VirtualRouter } from 'ui/router';
import { injectTheme } from 'utils/theming';

import { CoreClerkContextWrapper } from './contexts/CoreClerkContextWrapper';
import Portal from './portal';
import { SignIn, SignInModal } from './signIn';
import { SignUp, SignUpModal } from './signUp';
import type { AvailableComponentCtx, AvailableComponentProps } from './types';
import { UserButton } from './userButton';
import { UserProfile } from './userProfile';

import './styles/clerk.scss';

const AvailableComponents = {
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
};

type AvailableComponentNames = keyof typeof AvailableComponents;

interface HtmlNodeOptions {
  key: string;
  name: AvailableComponentNames;
  props?: AvailableComponentProps;
}

interface ComponentsProps {
  clerk: Clerk;
  environment: EnvironmentResource;
  options: ClerkOptions;
}

interface ComponentsState {
  signInModal: null | SignInProps;
  signUpModal: null | SignUpProps;
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
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
    nodes: new Map(),
  };

  static render(
    clerk: Clerk,
    environment: EnvironmentResource,
    options: ClerkOptions,
  ): Components {
    /**  Merge theme retrieved from the network with user supplied theme options. */
    injectTheme(
      environment.displayConfig.theme,
      deepCamelToSnake(options.theme || {}) as DeepPartial<DisplayThemeJSON>,
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

  mountComponent = ({
    name,
    node,
    nodeClassName,
    props,
  }: {
    name: AvailableComponentNames;
    node: HTMLDivElement;
    nodeClassName: string;
    props?: AvailableComponentProps;
  }): void => {
    assertDOMElement(node);
    Components._addMountNodeClass(node, nodeClassName);
    this.setState(({ nodes }) => {
      (portalCt = portalCt + 1),
        nodes.set(node, {
          key: `p${portalCt}`,
          name,
          props,
        });
      return { nodes };
    });
  };

  unmountComponent = ({ node }: { node: HTMLDivElement }): void => {
    this.setState(({ nodes }) => {
      nodes.delete(node);
      return { nodes };
    });
  };

  render(): JSX.Element {
    const { signInModal, signUpModal, nodes } = this.state;

    const mountedNodes: JSX.Element[] = [];

    nodes.forEach(({ key, name, props }, node) => {
      mountedNodes.push(
        <Portal<AvailableComponentCtx>
          componentName={name}
          key={key}
          component={AvailableComponents[name]}
          props={props || {}}
          node={node}
          preservedParams={PRESERVED_QUERYSTRING_PARAMS}
        />,
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
          preservedParams={PRESERVED_QUERYSTRING_PARAMS}
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
          preservedParams={PRESERVED_QUERYSTRING_PARAMS}
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
            {mountedNodes}
            {signInModal && mountedSignInModal}
            {signUpModal && mountedSignUpModal}
          </OptionsProvider>
        </EnvironmentProvider>
      </CoreClerkContextWrapper>
    );
  }
}
