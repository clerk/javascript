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

export type MountComponentRenderer = (
  clerk: Clerk,
  environment: EnvironmentResource,
  options: ClerkOptions,
) => ComponentControls;

export type ComponentControls = {
  mountComponent: (params: {
    name: AvailableComponentNames;
    node: HTMLDivElement;
    nodeClassName: string;
    props?: AvailableComponentProps;
  }) => void;
  unmountComponent: (params: { node: HTMLDivElement }) => void;
  updateAppearanceProp: (appearance: Appearance | undefined) => void;
  openModal: <T extends 'signIn' | 'signUp'>(modal: T, props: T extends 'signIn' ? SignInProps : SignUpProps) => void;
  closeModal: (modal: 'signIn' | 'signUp') => void;
};

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

const addMountNodeClass = (node: HTMLDivElement, className: string) => {
  node.className = 'cl-component ' + className;
};

export const mountComponentRenderer = (
  clerk: Clerk,
  environment: EnvironmentResource,
  options: ClerkOptions,
): ComponentControls => {
  const clerkRoot = document.createElement('div');
  clerkRoot.setAttribute('id', 'clerk-components');
  document.body.appendChild(clerkRoot);

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
    signInModal: null,
    signUpModal: null,
    nodes: new Map(),
  });
  const { signInModal, signUpModal, nodes } = state;
  const mountedNodes: JSX.Element[] = [];

  React.useEffect(() => {
    componentsControls.mountComponent = params => {
      const { node, name, nodeClassName, props } = params;
      assertDOMElement(node);
      addMountNodeClass(node, nodeClassName);
      setState(s => {
        s.nodes.set(node, { key: `p${++portalCt}`, name, props });
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

    componentsControls.updateAppearanceProp = appearance => {
      setState(s => ({ ...s, appearance }));
    };

    componentsControls.closeModal = modal => {
      if (modal === 'signIn') {
        setState(s => ({ ...s, signInModal: null }));
      } else {
        setState(s => ({ ...s, signUpModal: null }));
      }
    };

    componentsControls.openModal = (modal, props) => {
      if (modal === 'signIn') {
        setState(s => ({ ...s, signInModal: props }));
      } else {
        setState(s => ({ ...s, signUpModal: props }));
      }
    };
  }, []);

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
      handleClose={() => componentsControls.closeModal('signIn')}
      className='cl-modal-backdrop'
      modalClassname='cl-modal-container'
    >
      <VirtualRouter
        preservedParams={PRESERVED_QUERYSTRING_PARAMS}
        onExternalNavigate={() => componentsControls.closeModal('signIn')}
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
      handleClose={() => componentsControls.closeModal('signUp')}
      className='cl-modal-backdrop'
      modalClassname='cl-modal-container'
    >
      <VirtualRouter
        preservedParams={PRESERVED_QUERYSTRING_PARAMS}
        onExternalNavigate={() => componentsControls.closeModal('signUp')}
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
    <AppearanceProvider appearance={state.appearance}>
      <CoreClerkContextWrapper clerk={props.clerk}>
        <EnvironmentProvider value={props.environment}>
          <OptionsProvider value={props.options}>
            {mountedNodes}
            {signInModal && mountedSignInModal}
            {signUpModal && mountedSignUpModal}
          </OptionsProvider>
        </EnvironmentProvider>
      </CoreClerkContextWrapper>
    </AppearanceProvider>
  );
};
