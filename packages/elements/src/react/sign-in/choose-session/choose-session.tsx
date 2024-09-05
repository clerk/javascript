import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { createContextForDomValidation } from '~/react/utils/create-context-for-dom-validation';
import { isValidComponentType } from '~/react/utils/is-valid-component-type';

import {
  SignInActiveSessionContext,
  type SignInActiveSessionListItem,
  useSignInActiveSessionContext,
  useSignInActiveSessionList,
  useSignInChooseSessionIsActive,
} from './choose-session.hooks';

// ----------------------------------- TYPES ------------------------------------

export type SignInChooseSessionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};
export type SignInSessionListProps = React.HTMLAttributes<HTMLUListElement> & {
  asChild?: boolean;
  includeCurrentSession?: true;
};
export type SignInSessionListItemProps = Omit<React.HTMLAttributes<HTMLLIElement>, 'children'> & {
  asChild?: boolean;
  children: ({ session }: { session: SignInActiveSessionListItem }) => React.ReactNode;
};

// ---------------------------------- CONTEXT -----------------------------------

export const SignInChooseSessionCtx = createContextForDomValidation('SignInChooseSessionCtx');

// --------------------------------- COMPONENTS ---------------------------------

export function SignInChooseSession({ asChild, children, ...props }: SignInChooseSessionProps) {
  const activeState = useSignInChooseSessionIsActive();
  const Comp = asChild ? Slot : 'div';

  return activeState ? (
    <SignInChooseSessionCtx.Provider>
      <Comp {...props}>{children}</Comp>
    </SignInChooseSessionCtx.Provider>
  ) : null;
}

export function SignInSessionList({ asChild, children, includeCurrentSession, ...props }: SignInSessionListProps) {
  const sessions = useSignInActiveSessionList({ omitCurrent: !includeCurrentSession });

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

export function SignInSessionListItem(props: SignInSessionListItemProps) {
  const { asChild = false, children, ...passthroughProps } = props;
  const session = useSignInActiveSessionContext();
  const Comp = asChild ? Slot : 'li';

  return <Comp {...passthroughProps}>{children({ session })}</Comp>;
}
