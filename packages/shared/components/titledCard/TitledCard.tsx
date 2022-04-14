import cn from 'classnames';
import React from 'react';

import { Card } from '../card';
// @ts-ignore
import styles from './TitledCard.module.scss';

export type CardTitleProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  notice?: React.ReactNode;
  subtitleClassName?: string;
  noticeClassName?: string;
  className?: string;
};

export type TitledCardProps = CardTitleProps & {
  children: React.ReactNode;
};

export function CardTitle({
  title,
  subtitle,
  notice,
  subtitleClassName,
  noticeClassName,
  className,
}: CardTitleProps): JSX.Element | null {
  if (!title && !subtitle && !notice) {
    return null;
  }

  return (
    <div className={cn(styles.titleContainer, className)}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {subtitle && <p className={cn(styles.subtitle, subtitleClassName)}>{subtitle}</p>}
      {notice && <p className={cn(styles.notice, noticeClassName)}>{notice}</p>}
    </div>
  );
}

export function TitledCard({ children, className, ...titleProps }: TitledCardProps): JSX.Element {
  return (
    <Card className={cn(styles.card, className)}>
      <CardTitle {...titleProps} />
      {children}
    </Card>
  );
}
