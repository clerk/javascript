import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { useActiveTags } from '../hooks';
import { createContextForDomValidation } from '../utils/create-context-for-dom-validation';
import { isValidComponentType } from '../utils/is-valid-component-type';
import { SignInRouterCtx } from './context';

// ----------------------------------- TYPES ------------------------------------
//
export type SignInChooseSessionProps = React.HTMLAttributes<HTMLDivElement>;
export type SignInSessionListProps = React.HTMLAttributes<HTMLUListElement> & { asChild?: boolean };
export type SignInSessionListItemProps = Omit<React.HTMLAttributes<HTMLLIElement>, 'children'> & {
  asChild?: boolean;
  children: (session: any) => React.ReactNode;
};

// ---------------------------------- CONTEXT -----------------------------------

export const SignInChooseSessionCtx = createContextForDomValidation('SignInChooseSessionCtx');
const SignInActiveSessionContext = React.createContext<any>(null);

// ----------------------------------- HOOKS ------------------------------------

function useSignInActiveSessionContext() {
  const ctx = React.useContext(SignInActiveSessionContext);

  if (!ctx) {
    throw new Error('SignInActiveSessionContext must be used within a SessionList/SignInSessionListItem');
  }

  return ctx;
}

function useSignInActiveSessionList() {
  return SignInRouterCtx.useSelector(state =>
    state.context.clerk.client.activeSessions.map(s => ({
      id: s.id,
      ...s.publicUserData,
    })),
  );
}

// --------------------------------- COMPONENTS ---------------------------------

export function SignInChooseSession({ children, ...props }: SignInChooseSessionProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:choose-session');

  return activeState ? (
    <SignInChooseSessionCtx.Provider>
      <div {...props}>{children}</div>
    </SignInChooseSessionCtx.Provider>
  ) : null;
}

export function SignInSessionList({ asChild, children, ...props }: SignInSessionListProps) {
  const sessions = useSignInActiveSessionList();

  if (!children || !sessions?.length) {
    return null;
  }

  if (React.Children.count(children) > 1) {
    return React.Children.only(null);
  }

  if (asChild && !isValidComponentType(children, SignInSessionListItem)) {
    // TODO: Update error message
    throw new Error('asChild cannot be used with SessionListItem as the direct child');
  }

  if (!React.isValidElement(children)) {
    // TODO: Update error message
    throw new Error('children must be a valid React element');
  }

  const newChildren = asChild ? (children.props.children as React.ReactNode) : children;
  const childrenWithCtx = sessions.map(session => {
    return (
      <SignInActiveSessionContext.Provider
        key={`SignInActiveSessionContext-${session.id}`}
        value={session}
      >
        {newChildren}
      </SignInActiveSessionContext.Provider>
    );
  });

  if (asChild) {
    return <Slot {...props}>{React.cloneElement(children, undefined, childrenWithCtx)}</Slot>;
  }

  return <ul {...props}>{childrenWithCtx}</ul>;
}

export function SignInSessionListItem({ asChild, children, ...props }: SignInSessionListItemProps) {
  const session = useSignInActiveSessionContext();
  const Comp = asChild ? Slot : 'li';

  return <Comp {...props}>{children({ session })}</Comp>;
}
