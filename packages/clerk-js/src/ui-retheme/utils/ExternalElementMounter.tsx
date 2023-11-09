import { useEffect, useRef } from 'react';

type ExternalElementMounterProps = {
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

export const ExternalElementMounter = ({ mount, unmount, ...rest }: ExternalElementMounterProps) => {
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
