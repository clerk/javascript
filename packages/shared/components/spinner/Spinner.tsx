import React from 'react';
import cn from 'classnames';

// @ts-ignore
import styles from './Spinner.module.scss';

export type SpinnerProps = {
  inverted?: boolean;
  className?: string;
};

export function Spinner({ inverted, className }: SpinnerProps): JSX.Element {
  return (
    <div
      className={cn(styles.spinner, className, { [styles.inverted]: inverted })}
    />
  );
}
