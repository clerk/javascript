import React from 'react';
import cn from 'classnames';
import { useInput } from '../../hooks/useInput';
// @ts-ignore
import styles from './Toggle.module.scss';

export type ToggleProps = {
  name?: string;
  value?: string;
  checked: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  handleChange?: (el: HTMLInputElement) => void;
};

export const Toggle: React.FC<ToggleProps> = ({
  name,
  value,
  checked = false,
  disabled,
  label,
  handleChange,
}: ToggleProps) => {
  const { onChange, onKeyPress, ref } = useInput(handleChange);

  return (
    <label
      className={cn(styles.container, { [styles.disabled]: disabled })}
      onKeyPress={onKeyPress}
    >
      {label && <span className={styles.label}>{label}</span>}
      <span
        className={styles.toggle}
        role='switch'
        tabIndex={0}
        aria-checked={checked}
        aria-label={label as string}
      >
        <input
          ref={ref}
          name={name}
          value={value}
          type='checkbox'
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          tabIndex={-1}
        />
        <span className={styles.slider}></span>
      </span>
    </label>
  );
};
