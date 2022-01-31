import React from 'react';
import cn from 'classnames';
// @ts-ignore
import styles from './Tag.module.scss';
import { titleize } from '../../utils';

export type TagProps = React.PropsWithChildren<{
  color: 'primary' | 'warning' | 'success' | 'error';
  size?: 'lg' | 'sm' | 'xs';
  text?: string;
  Icon?: React.ReactNode;
  className?: string;
  style?: Record<string, unknown>;
}>;

export function Tag({
  color = 'success',
  size = 'sm',
  text,
  children,
  Icon,
  className,
  style,
}: TagProps): JSX.Element {
  return (
    <span
      className={cn(styles.tag, styles[color], styles[size], className)}
      style={style}
    >
      {Icon && <span className={styles.icon}>{Icon}</span>}
      {text || children}
    </span>
  );
}

/**
 * Special purpose Tag for Verification statuses -
 * TODO: Types will progressively roll out so the status should not be a string
 */
type VerificationStatusTagProps = {
  status: string;
  className?: string;
};

export function VerificationStatusTag({
  status,
  className,
}: VerificationStatusTagProps): JSX.Element | null {
  return status.match(/expired|unverified|failed/) ? (
    <Tag className={className} color="error">
      {titleize(status)}
    </Tag>
  ) : status === 'verified' ? (
    <Tag className={className} color="success">
      Verified
    </Tag>
  ) : null;
}
