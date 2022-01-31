import cn from 'classnames';
import React from 'react';
import { useInput } from '../../hooks';
// @ts-ignore
import styles from './Input.module.scss';

export type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

export type InputProps = {
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
  value?: string;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: InputType;
  hasError?: boolean;
  className?: string;
  handleChange?: (el: HTMLInputElement) => void;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.AriaAttributes;

export const Input: React.FC<InputProps> = React.forwardRef(
  (
    {
      type = 'text',
      name,
      value,
      handleChange,
      className,
      hasError,
      ...rest
    }: InputProps,
    ref,
  ) => {
    const { onChange } = useInput(handleChange);

    return (
      <input
        {...rest}
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(styles.input, { [styles.error]: hasError }, className)}
      />
    );
  },
);
Input.displayName = 'Input';
