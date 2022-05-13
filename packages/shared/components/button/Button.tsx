import cn from 'classnames';
import React from 'react';

//@ts-ignore
import styles from './Button.module.scss';

export type ButtonProps = {
  ref?: React.Ref<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
  flavor?: 'solid' | 'text' | 'icon' | 'outline' | 'link';
  buttonColor?: 'primary' | 'warning' | 'success' | 'error';
  buttonSize?: 'small';
  value?: string;
  disabled?: boolean;
  hoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement> &
  React.AriaAttributes;

export const Button = React.forwardRef(
  (
    {
      value,
      type,
      flavor = 'solid',
      buttonColor = 'primary',
      buttonSize,
      disabled,
      className,
      children,
      style,
      hoverable = false,
      ...rest
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>,
  ): JSX.Element => {
    const classNames = [
      styles.button,
      styles[flavor],
      styles[buttonColor],
      { [styles.disabled]: disabled },
      { [styles.hoverable]: hoverable },
      className,
    ];

    if (buttonSize) {
      classNames.push(styles[buttonSize]);
    }
    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        value={value}
        disabled={disabled}
        className={cn(classNames)}
        style={style}
      >
        {children}
      </button>
    );
  },
);
