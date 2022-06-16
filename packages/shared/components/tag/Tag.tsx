import cn from 'classnames';
import React from 'react';

import { titleize } from '../../utils';
// @ts-ignore
import styles from './Tag.module.scss';
import { VerificationStatus } from '@clerk/types';

export type TagProps = React.PropsWithChildren<{
  color: 'primary' | 'warning' | 'success' | 'error';
  size?: 'lg' | 'sm' | 'xs';
  text?: string;
  Icon?: React.ReactNode;
  className?: string;
  style?: Record<string, unknown>;
}>;

export function Tag({ color = 'success', size = 'sm', text, children, Icon, className, style }: TagProps): JSX.Element {
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
  status: VerificationStatus;
  className?: string;
};

export function VerificationStatusTag({ status, className }: VerificationStatusTagProps): JSX.Element | null {
  if (status === 'transferable') {
    return null;
  }

  return (
    <Tag
      className={className}
      color={status === 'verified' ? 'success' : 'error'}
    >
      {titleize(status)}
    </Tag>
  );
}
