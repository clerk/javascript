import React from 'react';
import cn from 'classnames';
// @ts-ignore
import styles from './Radio.module.scss';
import { Switch } from '../switch';

export type RadioProps = {
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
  value?: string;
  checked: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
  handleChange?: (el: HTMLInputElement) => void;
};

export type CheckMarkIconProps = {
  checked: boolean;
  label?: React.ReactNode;
};

const Icon = ({ checked, label }: CheckMarkIconProps) => (
  <span
    className={styles.checkmark}
    tabIndex={0}
    aria-checked={checked}
    aria-label={label as string}
  />
);

export type RadioComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<RadioProps> & React.RefAttributes<any>
>;

export const Radio: RadioComponent = React.forwardRef(
  (
    {
      name,
      value,
      checked = false,
      disabled,
      label,
      className,
      handleChange,
    }: RadioProps,
    ref,
  ): JSX.Element => (
    <Switch
      ref={ref}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      label={label}
      containerClassName={styles.container}
      className={cn(styles.label, className)}
      handleChange={handleChange}
      Icon={Icon}
    />
  ),
);

Radio.displayName = 'Radio';
