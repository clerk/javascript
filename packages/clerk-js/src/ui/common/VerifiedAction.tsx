import { useClerk } from '@clerk/shared/react';
import { Children, cloneElement, isValidElement, type PropsWithChildren } from 'react';

import { useProtect } from './Gate';

type ActionTriggerProps = PropsWithChildren;

export const VerifiedAction = (props: ActionTriggerProps) => {
  const { children } = props;
  const clerk = useClerk();

  const isVerified = useProtect({
    assurance: {
      level: 'secondFactor',
      maxAge: '10m',
    },
  });

  const validChildren = Children.only(children);
  if (!isValidElement(validChildren)) {
    throw new Error('Children of ActionTrigger must be a valid element');
  }

  return cloneElement(validChildren, {
    //@ts-ignore
    onClick: async () => {
      if (isVerified) {
        return validChildren.props.onClick?.();
      }
      clerk.openUserVerification();
    },
  });
};
