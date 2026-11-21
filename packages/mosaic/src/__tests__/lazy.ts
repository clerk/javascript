import * as React from 'react';

export const isReact18 = React.version.startsWith('18.');

export function lazyNode(payload: unknown, init: (payload: unknown) => unknown = p => p): React.ReactElement {
  const lazy = { $$typeof: Symbol.for('react.lazy'), _payload: payload, _init: init };
  // @ts-expect-error -- A Flight lazy node is not typed as a ReactElement, but it reaches element props in its place
  return lazy;
}
