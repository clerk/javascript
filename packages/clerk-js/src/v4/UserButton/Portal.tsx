import React from 'react';
import { createPortal } from 'react-dom';

import { useSafeLayoutEffect } from '../hooks';

type PortalProps = React.PropsWithChildren<{}>;

export const Portal = (props: PortalProps) => {
  const elRef = React.useRef<HTMLDivElement>();

  useSafeLayoutEffect(() => {
    elRef.current = document.createElement('div');
    elRef.current.classList.add('cl-portal-root');
    document.body.appendChild(elRef.current);
    return () => {
      if (elRef.current) {
        document.body.removeChild(elRef.current);
        elRef.current = undefined;
      }
    };
  }, []);

  return elRef.current ? createPortal(props.children, elRef.current) : null;
};
