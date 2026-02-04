import { Children, cloneElement, isValidElement, type PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionTriggerProps = PropsWithChildren<{
  value: string;
  hideOnActive?: boolean;
}>;

export const ActionTrigger = (props: ActionTriggerProps) => {
  const { children, value, hideOnActive = true } = props;
  const { active, open } = useActionContext();

  const validChildren = Children.only(children);
  if (!isValidElement(validChildren)) {
    throw new Error('Children of ActionTrigger must be a valid element');
  }

  if (hideOnActive && active === value) {
    return null;
  }

  return cloneElement(validChildren, {
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onClick: async () => {
      await validChildren.props.onClick?.();
      open(value);
    },
  });
};
