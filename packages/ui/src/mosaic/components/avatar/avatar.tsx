import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeProps, themeProps } from '../../props';
import { styles } from './avatar.styles';

export interface AvatarProps extends React.ComponentPropsWithRef<'span'> {
  shape?: 'circle' | 'square';
  size?: 'lg' | 'md' | 'sm' | 'xs';
  /** Image source. When set, renders an `<img>` filling the box; otherwise `children` is the fallback. */
  src?: string;
  alt?: string;
}

const sizeStyles = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function MosaicAvatar(
  { shape = 'circle', size = 'md', src, alt = '', className, style, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...mergeProps(
        themeProps('avatar', { shape, size }),
        stylex.props(styles.base, shape === 'circle' ? styles.shapeCircle : styles.shapeSquare, sizeStyles[size]),
        className,
        style,
      )}
      {...rest}
    >
      {src ? (
        <img
          alt={alt}
          src={src}
          {...stylex.props(styles.image)}
        />
      ) : (
        children
      )}
    </span>
  );
});
