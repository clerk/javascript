import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../reset.styles';
import { shapes, sizes, styles } from './avatar.styles';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarContextValue {
  status: ImageLoadingStatus;
  onStatusChange: (status: ImageLoadingStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function useAvatarContext(part: string): AvatarContextValue {
  const context = React.useContext(AvatarContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <Avatar.Root>`);
  }
  return context;
}

export interface AvatarProps extends React.ComponentPropsWithRef<'span'> {
  shape?: 'circle' | 'square';
  size?: 'fit' | 'lg' | 'md' | 'sm' | 'xs';
}

const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarProps>(function MosaicAvatarRoot(
  { shape = 'circle', size = 'md', className, style, children, ...rest },
  ref,
) {
  const [status, setStatus] = React.useState<ImageLoadingStatus>('idle');
  const value = React.useMemo<AvatarContextValue>(() => ({ status, onStatusChange: setStatus }), [status]);

  return (
    <AvatarContext.Provider value={value}>
      <span
        ref={ref}
        {...mergeStyleProps(
          themeProps('avatar', { shape, size }),
          stylex.props(reset.base, styles.base, shapes[shape], sizes[size]),
          className,
          style,
        )}
        {...rest}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});

export type AvatarImageProps = React.ComponentPropsWithRef<'img'>;

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(function MosaicAvatarImage(
  { src, alt = '', className, style, ...rest },
  ref,
) {
  const { status, onStatusChange } = useAvatarContext('Avatar.Image');

  // Preload `src` and report status to the root, so the fallback shows until the image resolves.
  // A layout effect, because it also has to catch the case below before anything is painted.
  React.useLayoutEffect(() => {
    if (!src) {
      onStatusChange('error');
      return;
    }

    const image = new window.Image();
    image.src = src;

    // An image the browser already holds is complete the moment it is asked for. Resolving it here
    // rather than off an event keeps a remount (a row changing shape) or a swap between two avatars
    // already on screen from dropping to the initials and back for a frame.
    if (image.complete) {
      onStatusChange('loaded');
      return;
    }

    let active = true;
    onStatusChange('loading');
    image.onload = () => active && onStatusChange('loaded');
    image.onerror = () => active && onStatusChange('error');

    return () => {
      active = false;
    };
  }, [src, onStatusChange]);

  if (status !== 'loaded') {
    return null;
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      // An avatar is an identity mark, not content to pull out of the page — dragging one
      // only ever produces a stray ghost image mid-interaction.
      draggable={false}
      {...mergeStyleProps(themeProps('avatar-image'), stylex.props(reset.base, styles.image), className, style)}
      {...rest}
    />
  );
});

export interface AvatarFallbackProps extends React.ComponentPropsWithRef<'span'> {
  /** Wait this many ms before showing the fallback, to avoid a flash on fast connections. */
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(function MosaicAvatarFallback(
  { delayMs, className, style, children, ...rest },
  ref,
) {
  const { status } = useAvatarContext('Avatar.Fallback');
  const [canRender, setCanRender] = React.useState(delayMs === undefined);

  React.useEffect(() => {
    if (delayMs === undefined) {
      return;
    }
    const timer = setTimeout(() => setCanRender(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!canRender || status === 'loaded') {
    return null;
  }

  return (
    <span
      ref={ref}
      {...mergeStyleProps(themeProps('avatar-fallback'), stylex.props(reset.base, styles.fallback), className, style)}
      {...rest}
    >
      {children}
    </span>
  );
});

/**
 * Compound avatar. `Avatar.Root` clips and sizes the box; `Avatar.Image` renders
 * once its source loads; `Avatar.Fallback` shows until then.
 */
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
};
