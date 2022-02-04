import React from 'react';

export type ErrorProps = {
  children: React.ReactNode;
  style?: {};
} & React.HTMLAttributes<HTMLDivElement>;

// Renders global errors across components, will be replaced by notification snackbars.
export const Error: React.FC<ErrorProps> = ({ children, style }) => {
  if (!children) {
    return null;
  }
  return (
    <div className='cl-error' style={style}>
      {children}
    </div>
  );
};
