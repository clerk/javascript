import React from 'react';
import { createPortal } from 'react-dom';

type PortalProps = React.PropsWithChildren<{}>;

export const Portal = (props: PortalProps) => {
  const el = React.useMemo<HTMLDivElement>(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return div;
  }, []);

  React.useEffect(() => {
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  return createPortal(props.children, el);
};
