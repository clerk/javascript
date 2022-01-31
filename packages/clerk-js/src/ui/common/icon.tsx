import React from 'react';
import cn from 'classnames';

interface IconProps {
  children: React.ReactElement;
  className?: string;
}

export const Icon = ({ children, className }: IconProps): JSX.Element => {
  return React.cloneElement(children, {
    className: cn('cl-icon', className),
  });
};
