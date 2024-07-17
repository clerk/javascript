import { forwardRef } from 'react';

// Credit to @mattpocock
// https://github.com/total-typescript/react-typescript-tutorial/blob/ca06b2a1f3c15c77e7e0d2d3f3e98466436a6d8f/src/08-advanced-patterns/72-as-prop-with-forward-ref.solution.tsx#L12

type FixedForwardRef = <
  T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  P = {},
>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode,
) => (props: P & React.RefAttributes<T>) => React.ReactNode;

export const fixedForwardRef = forwardRef as FixedForwardRef;
