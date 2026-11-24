import * as React from 'react';

import type { RenderProp } from './use-render';

export function unwrapLazyElement<T extends React.ReactNode | RenderProp>(value: T): T | React.ReactElement {
  const isLazy =
    typeof value === 'object' && value !== null && '$$typeof' in value && value.$$typeof === Symbol.for('react.lazy');
  if (!isLazy || React.version.startsWith('18.')) {
    return value;
  }
  const [child] = React.Children.toArray(value);
  return React.isValidElement(child) ? child : value;
}
