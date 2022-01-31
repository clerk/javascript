import React from 'react';
import cn from 'classnames';
import { Input, InputProps } from './Input';
// @ts-ignore
import styles from './InputWithLabel.module.scss';

export type InputWithLabelProps = InputProps & {
  label?: React.ReactNode;
  placement?: 'left' | 'right';
  hasError?: boolean;
  tagTheme?: string;
};

export const InputWithLabel: React.FC<InputWithLabelProps> = ({
  label,
  placement = 'right',
  hasError,
  tagTheme,
  ...rest
}: InputWithLabelProps) => {
  return (
    <span
      className={cn(styles.container, {
        [styles.left]: placement == 'left',
        [styles.error]: hasError,
      })}
    >
      <Input hasError={hasError} {...rest} />
      <span className={cn(styles.tag, styles[placement], tagTheme)}>
        {label}
      </span>
    </span>
  );
};
