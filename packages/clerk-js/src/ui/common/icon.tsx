import cn from 'classnames';
import React from 'react';

interface IconProps {
  children: React.ReactElement;
  className?: string;
}

export const Icon = ({ children, className }: IconProps): JSX.Element => {
  return React.cloneElement(children, {
    className: cn('cl-icon', className),
  });
};
