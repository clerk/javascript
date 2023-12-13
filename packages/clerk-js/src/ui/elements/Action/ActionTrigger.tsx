import { Children, cloneElement, isValidElement, type PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionTriggerProps = PropsWithChildren;

export const ActionTrigger = (props: ActionTriggerProps) => {
  const { children } = props;
  const { isOpen, toggle } = useActionContext();

  const validChildren = Children.only(children);
  if (!isValidElement(validChildren)) {
    throw new Error('Children of ActionTrigger must be a valid element');
  }

  if (isOpen) {
    return null;
  }

  return cloneElement(validChildren, {
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onClick: async () => {
      await validChildren.props.onClick?.();
      toggle();
    },
  });
};
