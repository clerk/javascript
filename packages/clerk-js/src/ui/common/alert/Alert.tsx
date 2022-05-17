import React from 'react';

export type AlertType = 'info' | 'error';

export type AlertProps = {
  type: AlertType;
  children: React.ReactNode;
  style?: {};
} & React.HTMLAttributes<HTMLDivElement>;

// Renders global alerts across components, will be replaced by notification snackbars.
export function Alert({ type, children, style }: AlertProps): JSX.Element {
  if (!children) {
    return <></>;
  }

  return (
    <div
      className={`cl-${type}`}
      style={style}
    >
      {children}
    </div>
  );
}
