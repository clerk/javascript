import cn from 'classnames';
import React from 'react';

// @ts-ignore
import styles from './Label.module.scss';

export type LabelProps = {
  text?: string;
  className?: string;
  children?: React.ReactNode;
} & React.LabelHTMLAttributes<HTMLLabelElement> &
  React.AriaAttributes;

export const Label: React.FC<LabelProps> = ({
  text,
  className,
  children,
  htmlFor,
  ...rest
}: LabelProps) => {
  if (!text && !children) {
    return null;
  }
  return (
    <label htmlFor={htmlFor} className={cn(styles.label, className)} {...rest}>
      {text || children}
    </label>
  );
};
