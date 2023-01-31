import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react';
import React from 'react';

export const withFloatingTree = <T,>(Component: React.ComponentType<T>): React.ComponentType<T> => {
  return (props: T) => {
    const parentId = useFloatingParentNodeId();
    if (parentId == null) {
      return (
        <FloatingTree>
          {/* @ts-expect-error */}
          <Component {...props} />
        </FloatingTree>
      );
    }

    /* @ts-expect-error */
    return <Component {...props} />;
  };
};
