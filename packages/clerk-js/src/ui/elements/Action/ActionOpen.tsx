import type { PropsWithChildren } from 'react';

import { useActionContext } from './ActionRoot';

type ActionOpenProps = PropsWithChildren<{ value: string }>;

export const ActionOpen = (props: ActionOpenProps) => {
  const { children, value } = props;
  const { active } = useActionContext();

  if (active !== value) {
    return null;
  }

  return children;
};
