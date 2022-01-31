import React from 'react';

export type FooterProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Footer: React.FC<FooterProps> = ({ children }) => {
  return <div className='cl-auth-form-footer'>{children}</div>;
};
