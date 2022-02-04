import cn from 'classnames';
import React from 'react';

// @ts-ignore
import styles from './Heading.module.scss';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading: React.FC<HeadingProps> = ({
  as,
  children,
  className,
  ...rest
}) => {
  const Heading = as;
  return (
    <Heading {...rest} className={cn(styles.heading, styles[as], className)}>
      {children}
    </Heading>
  );
};
