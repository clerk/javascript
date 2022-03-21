import cn from 'classnames';
import React from 'react';

import { CheckmarkIcon } from '../../assets/icons';
import { useInput } from '../../hooks';
// @ts-ignore
import styles from './Checkbox.module.scss';

export type CheckboxProps = {
  name?: string;
  value?: string;
  checked: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  /** Specific Tag component to show beside the checkbox label text */
  labelTag?: React.ReactNode;
  labelClassname?: string;
  handleChange?: (el: HTMLInputElement) => void;
};

export function Checkbox({
  name,
  value,
  checked = false,
  disabled,
  label,
  labelTag,
  labelClassname,
  handleChange,
}: CheckboxProps): JSX.Element {
  const { onChange, onKeyPress, ref } = useInput(handleChange);
  return (
    <label
      className={cn(styles.container)}
      onKeyPress={onKeyPress}
    >
      {label && (
        <>
          <span
            className={cn(styles.label, labelClassname, {
              [styles.disabled]: disabled,
            })}
          >
            {label}
          </span>
          {labelTag}
        </>
      )}
      <input
        ref={ref}
        type='checkbox'
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        tabIndex={-1}
        disabled={disabled}
        className={cn({ [styles.disabled]: disabled })}
      />
      <span
        className={cn(styles.checkmark, { [styles.disabled]: disabled })}
        tabIndex={0}
        role='checkbox'
        aria-checked={checked}
        aria-label={label as string}
      >
        {checked && <CheckmarkIcon />}
      </span>
    </label>
  );
}
