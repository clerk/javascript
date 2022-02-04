import React from 'react';
import ReactDOM from 'react-dom';

export type PortalProps = {
  className?: string;
  children: React.ReactNode;
  hostEl?: HTMLElement | null;
};

export function Portal({
  children,
  hostEl,
  className,
}: PortalProps): JSX.Element {
  const el = React.useMemo(() => document.createElement('div'), []);

  React.useEffect(() => {
    const host = hostEl && hostEl.appendChild ? hostEl : document.body;
    const classList: string[] = [];

    if (className) {
      className.split(' ').forEach(item => classList.push(item));
    }

    classList.forEach(item => el.classList.add(item));

    host.appendChild(el);

    return () => {
      host.removeChild(el);
    };
  }, [el, hostEl, className]);

  return ReactDOM.createPortal(children, el);
}
