import React from 'react';

export type InfoProps = {
  children: React.ReactNode;
  style?: {};
} & React.HTMLAttributes<HTMLDivElement>;

// Renders global info across components, will be replaced by notification snackbars.
export const Info: React.FC<InfoProps> = ({ children, style }) => {
  if (!children) {
    return null;
  }
  return (
    <div
      className='cl-info'
      style={style}
    >
      {children}
    </div>
  );
};
