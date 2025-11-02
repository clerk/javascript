import { useClerk } from '@clerk/shared/react/index';
import type { PropsWithChildren } from 'react';

export const DevOnly = ({ children }: PropsWithChildren) => {
  const clerk = useClerk();
  if (clerk.instanceType !== 'development') {
    return null;
  }

  return children;
};
