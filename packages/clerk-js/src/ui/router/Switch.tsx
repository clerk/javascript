import React from 'react';

import type { RouteProps } from './Route';
import { Route } from './Route';
import { useRouter } from './RouteContext';

function assertRoute(v: any): v is React.ReactElement<RouteProps> {
  return !!v && React.isValidElement(v) && typeof v === 'object' && (v as React.ReactElement).type === Route;
}

export function Switch({ children }: { children: React.ReactNode }): JSX.Element {
  const router = useRouter();

  let node: React.ReactNode = null;
  React.Children.forEach(children, child => {
    if (node || !assertRoute(child)) {
      return;
    }

    const { index, path } = child.props;
    if ((!index && !path) || router.matches(path, index)) {
      node = child;
    }
  });

  return <>{node}</>;
}
