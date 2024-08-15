import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { createContextForDomValidation } from '~/react/utils/create-context-for-dom-validation';
import { isValidComponentType } from '~/react/utils/is-valid-component-type';

import {
  SignInActiveSessionContext,
  useSignInActiveSessionContext,
  useSignInActiveSessionList,
  useSignInChooseSessionIsActive,
} from './choose-session.hooks';

// ----------------------------------- TYPES ------------------------------------

export type SignInChooseSessionProps = React.HTMLAttributes<HTMLDivElement>;
export type SignInSessionListProps = React.HTMLAttributes<HTMLUListElement> & { asChild?: boolean };
export type SignInSessionListItemProps = Omit<React.HTMLAttributes<HTMLLIElement>, 'children'> & {
  asChild?: boolean;
  children: (session: any) => React.ReactNode;
};

// ---------------------------------- CONTEXT -----------------------------------

export const SignInChooseSessionCtx = createContextForDomValidation('SignInChooseSessionCtx');

// --------------------------------- COMPONENTS ---------------------------------

export function SignInChooseSession({ children, ...props }: SignInChooseSessionProps) {
  const activeState = useSignInChooseSessionIsActive();

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

  if (asChild && isValidComponentType(children, SignInSessionListItem)) {
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
