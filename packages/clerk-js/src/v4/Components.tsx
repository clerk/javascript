// import { Modal } from '@clerk/shared/components/modal';
import type { Appearance, Clerk, ClerkOptions, EnvironmentResource, SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';
import ReactDOM from 'react-dom';

import { PRESERVED_QUERYSTRING_PARAMS } from '../core/constants';
import { clerkUIErrorDOMElementNotFound } from '../core/errors';
import { EnvironmentProvider, OptionsProvider } from '../ui/contexts';
import { CoreClerkContextWrapper } from '../ui/contexts/CoreClerkContextWrapper';
import Portal from '../ui/portal';
import { VirtualRouter } from '../ui/router';
import type { AvailableComponentCtx, AvailableComponentProps } from '../ui/types';
import { AppearanceProvider } from './customizables/AppearanceProvider';
import { SignIn, SignInModal } from './signIn';
import { SignUp } from './signUp';
import { InternalThemeProvider } from './styledSystem';

const Modal = (props: any) => {
  return <div {...props}>modal {props.children}</div>;
};

const AvailableComponents = {
  SignIn,
  // SignUp,
  // UserButton,
  // UserProfile,
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
  appearance: Appearance | undefined;
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

export default class Components extends React.Component<ComponentsProps, ComponentsState> {
  static render(clerk: Clerk, environment: EnvironmentResource, options: ClerkOptions): Components {
    /**  Merge theme retrieved from the network with user supplied theme options. */
    // TODO: Remove all helpers
    // injectTheme(
    //   environment.displayConfig.theme,
    //   deepCamelToSnake(options.theme || {}) as DeepPartial<DisplayThemeJSON>,
    // );

    const clerkRoot = document.createElement('DIV');
    clerkRoot.setAttribute('id', 'clerk-components');
    document.body.appendChild(clerkRoot);

    return ReactDOM.render<ComponentsProps, Components>(
      <Components
        clerk={clerk}
        environment={environment}
        options={options}
      />,
      clerkRoot,
    );
  }

  constructor(props: ComponentsProps) {
    super(props);
    this.state = {
      appearance: props.options.appearance,
      signInModal: null,
      signUpModal: null,
      nodes: new Map(),
    };
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

  updateAppearanceProp = (appearance: Appearance | undefined) => {
    this.setState(state => ({
      ...state,
      appearance,
    }));
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
          {/*<SignUpModal*/}
          {/*  afterSignInUrl={signInModal?.afterSignInUrl}*/}
          {/*  afterSignUpUrl={signInModal?.afterSignUpUrl}*/}
          {/*  redirectUrl={signInModal?.redirectUrl}*/}
          {/*/>*/}
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
          {/*<SignInModal*/}
          {/*  afterSignInUrl={signUpModal?.afterSignInUrl}*/}
          {/*  afterSignUpUrl={signUpModal?.afterSignUpUrl}*/}
          {/*  redirectUrl={signUpModal?.redirectUrl}*/}
          {/*/>*/}
          {/*<SignUpModal {...signUpModal} />*/}
        </VirtualRouter>
      </Modal>
    );

    return (
      <StyledSystemProvider>
        <CoreClerkContextWrapper clerk={this.props.clerk}>
          <EnvironmentProvider value={this.props.environment}>
            <OptionsProvider value={this.props.options}>
              {mountedNodes}
              {signInModal && mountedSignInModal}
              {signUpModal && mountedSignUpModal}
            </OptionsProvider>
          </EnvironmentProvider>
        </CoreClerkContextWrapper>
      </StyledSystemProvider>
    );
  }
}
