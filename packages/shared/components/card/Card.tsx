import React from 'react';
import cn from 'classnames';
// @ts-ignore
import styles from './Card.module.scss';

export type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
}: CardProps) => {
  return <div className={cn(styles.card, className)}>{children}</div>;
};
