import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Avatar } from '../components/avatar';
import type { ButtonProps } from '../components/button';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { mergeStyleProps, themeProps } from '../props';
import { colorVars, radiusVars } from '../tokens.stylex';

export interface AvatarButtonProps extends Omit<ButtonProps, 'children' | 'shape' | 'size'> {
  imageUrl?: string;
  name: string;
  fallback?: React.ReactNode;
}

const styles = stylex.create({
  root: {
    borderWidth: 0,
    position: 'relative',
  },
  editSurface: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-full'],
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-card'],
    boxSizing: 'border-box',
    display: 'flex',
    insetInlineStart: '-4.5px',
    justifyContent: 'center',
    position: 'absolute',
    height: '20px',
    top: '25px',
    width: '20px',
  },
});

export const AvatarButton = React.forwardRef<HTMLButtonElement, AvatarButtonProps>(function AvatarButton(
  {
    imageUrl,
    name,
    fallback,
    color = 'neutral',
    variant = 'ghost',
    className,
    style,
    'aria-label': ariaLabel = 'Edit profile picture',
    ...rest
  },
  ref,
) {
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Button
      ref={ref}
      aria-label={ariaLabel}
      color={color}
      shape='circle'
      size='lg'
      variant={variant}
      {...mergeStyleProps(themeProps('avatar-button'), stylex.props(styles.root), className, style)}
      {...rest}
    >
      <Avatar.Root
        aria-hidden
        size='md'
      >
        <Avatar.Image
          alt=''
          src={imageUrl}
        />
        <Avatar.Fallback>{fallback ?? initials}</Avatar.Fallback>
      </Avatar.Root>
      <span
        aria-hidden
        {...mergeStyleProps(themeProps('avatar-button-edit-surface'), stylex.props(styles.editSurface))}
      >
        <Icon
          aria-hidden
          name='pen'
          size='xs'
        />
      </span>
    </Button>
  );
});
