import { useClerk } from '@clerk/shared/react';
import { Children, cloneElement, isValidElement, type PropsWithChildren, useState } from 'react';

import { useProtect } from '../../common';
import { useActionContext } from './ActionRoot';

type ActionTriggerProps = PropsWithChildren<{
  value: string;
  protect?: boolean;
}>;

export const ActionTrigger = (props: ActionTriggerProps) => {
  const { children, value, protect = false } = props;
  const { active, open } = useActionContext();
  const [
    ,
    //clicked,
    setClicked,
  ] = useState(false);
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

  // useEffect(() => {
  //   const h = async () => {
  //     await validChildren.props.onClick?.();
  //     return open(value);
  //   };
  //   if (isVerified && clicked) {
  //     void h();
  //   }
  // }, [clicked, isVerified, open, validChildren.props, value]);

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
      setClicked(true);
      clerk.openUserVerification({
        afterVerification: async () => {
          await validChildren.props.onClick?.();
          return open(value);
        },
      });
    },
  });
};
