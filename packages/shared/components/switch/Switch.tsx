import cn from 'classnames';
import React from 'react';

import { useInput } from '../../hooks/useInput';
// @ts-ignore
import styles from './Switch.module.scss';

export type SwitchProps = {
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
  value?: string;
  checked: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  Icon?: (props: any) => JSX.Element;
  containerClassName?: string;
  className?: string;
  handleChange?: (el: HTMLInputElement) => void;
};

export type SwitchComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SwitchProps> & React.RefAttributes<any>
>;

export const Switch: SwitchComponent = React.forwardRef(
  (
    { name, value, checked = false, disabled, label, containerClassName, className, Icon, handleChange }: SwitchProps,
    ref,
  ): JSX.Element => {
    const { onChange, onKeyPress } = useInput(handleChange);

    return (
      <label
        className={cn(styles.container, containerClassName, {
          [styles.disabled]: disabled,
        })}
        onKeyPress={onKeyPress}
      >
        <input
          ref={ref}
          type='radio'
          name={name}
          value={value}
          checked={checked}
          tabIndex={-1}
          onChange={onChange}
          disabled={disabled}
          role='radio'
        />
        {label && <span className={cn(className)}>{label}</span>}
        {Icon && (
          <Icon
            checked={checked}
            label={label}
          />
        )}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
