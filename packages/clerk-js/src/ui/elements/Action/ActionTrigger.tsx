import { useClerk } from '@clerk/shared/react';
import { Children, cloneElement, isValidElement, type PropsWithChildren } from 'react';

import { useProtect } from '../../common';
import { useActionContext } from './ActionRoot';

type ActionTriggerProps = PropsWithChildren<{
  value: string;
  protect?: boolean;
}>;

export const ActionTrigger = (props: ActionTriggerProps) => {
  const { children, value, protect = false } = props;
  const { active, open } = useActionContext();

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

  if (active === value) {
    return null;
  }

  return cloneElement(validChildren, {
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onClick: async () => {
      if (!protect || (protect && isVerified)) {
        await validChildren.props.onClick?.();
        return open(value);
      }
      clerk.openUserVerification({
        level: 'L2.secondFactor',
        afterVerification: async () => {
          await validChildren.props.onClick?.();
          return open(value);
        },
      });
    },
  });
};
