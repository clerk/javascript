import { useEffect, useRef } from 'react';

type ExternalElementMounterProps = {
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

export const ExternalElementMounter = ({ mount, unmount, ...rest }: ExternalElementMounterProps) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const stableMountRef = useRef(mount);
  const stableUnmountRef = useRef(unmount);

  // Update refs when functions change, but don't trigger re-mount
  stableMountRef.current = mount;
  stableUnmountRef.current = unmount;

  useEffect(() => {
    let elRef: HTMLDivElement | undefined;
    if (nodeRef.current) {
      elRef = nodeRef.current;
      stableMountRef.current(nodeRef.current);
    }
    return () => {
      stableUnmountRef.current(elRef);
    };
  }, []);

  return (
    <div
      ref={nodeRef}
      {...rest}
    />
  );
};
