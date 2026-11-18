import type { Ref } from 'react';
import { useEffect, useRef } from 'react';

type ExternalElementMounterProps = {
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
  // In React 19, ref is a regular prop for function components (not wrapped in
  // forwardRef). Without this field, ref ends up in ...rest and overwrites the
  // internal nodeRef when spread onto the div, preventing mount from being called.
  ref?: Ref<HTMLDivElement>;
};

export const ExternalElementMounter = ({
  mount,
  unmount,
  ref: _forwardedRef,
  ...rest
}: ExternalElementMounterProps) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    let elRef: HTMLDivElement | undefined;
    if (nodeRef.current) {
      elRef = nodeRef.current;
      mount(nodeRef.current);
    }
    return () => {
      unmount(elRef);
    };
  }, [nodeRef.current]);

  return (
    <div
      ref={nodeRef}
      {...rest}
    />
  );
};
