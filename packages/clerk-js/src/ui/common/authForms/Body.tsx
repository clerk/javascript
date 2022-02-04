import cn from 'classnames';
import React from 'react';

export type BodyProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Body: React.FC<BodyProps> = ({ children, className }) => {
  return <div className={cn('cl-auth-form-body', className)}>{children}</div>;
};
