import React from 'react';
import cn from 'classnames';
import { Label } from '../label';

// @ts-ignore
import styles from './Control.module.scss';

export type ControlProps = {
  children?: React.ReactNode;
  className?: string;
  containerStyle?: React.CSSProperties;
  error?: string;
  errorClassName?: string;
  errorStyle?: React.CSSProperties;
  footer?: React.ReactNode;
  hint?: React.ReactNode;
  hintOnClickHandler?: (e: React.MouseEvent) => void;
  htmlFor?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  name?: string;
  optional?: boolean;
  sublabel?: React.ReactNode;
};

export function Control({
  children,
  className,
  containerStyle,
  error,
  errorClassName,
  errorStyle,
  footer,
  hint,
  hintOnClickHandler,
  htmlFor,
  label,
  labelClassName,
  optional,
  sublabel,
}: ControlProps): JSX.Element {
  // Inject hasError prop to children controls to render their error styles.
  // This convention should be enforced with a TS interface.
  const childrenWithErrorProp = React.Children.map(children, child => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      return React.cloneElement(child, { hasError: !!error });
    }
    return child;
  });

  const hintElement = hint ? (
    <span className={styles.hint}>
      {hintOnClickHandler ? <a onClick={hintOnClickHandler}>{hint}</a> : hint}
    </span>
  ) : null;

  const optionalElement = optional ? (
    <span className={styles.optional}>Optional</span>
  ) : null;

  return (
    <div className={cn(styles.control, className)} style={containerStyle}>
      <Label htmlFor={htmlFor} className={styles.labelContainer}>
        {childrenWithErrorProp}
        {sublabel && <span className={cn(styles.sublabel)}>{sublabel}</span>}
        {label && (
          <span className={cn(styles.label, labelClassName)}>
            {label}
            {optionalElement}
            {hintElement}
          </span>
        )}
      </Label>
      <span
        className={cn(
          styles.error,
          { [styles.errorVisible]: error },
          errorClassName,
        )}
        style={errorStyle}
      >
        {error}
      </span>
      {footer}
    </div>
  );
}
