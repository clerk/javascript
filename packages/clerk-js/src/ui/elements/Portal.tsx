import React from 'react';
import { createPortal } from 'react-dom';

type PortalProps = React.PropsWithChildren;

// No longer In use
export const Portal = (props: PortalProps) => {
  const elRef = React.useRef(document.createElement('div'));

  React.useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      document.body.removeChild(elRef.current);
    };
  }, []);

  return createPortal(props.children, elRef.current);
};
