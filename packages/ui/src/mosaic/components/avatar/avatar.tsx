import { useRender } from '@clerk/headless/utils';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
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

export interface AvatarProps extends MosaicComponentProps<'span'> {
  shape?: 'circle' | 'square';
  size?: 'fit' | 'lg' | 'md' | 'sm' | 'xs';
}

const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarProps>(function MosaicAvatarRoot(
  { shape = 'circle', size = 'md', render, className, style, ...rest },
  ref,
) {
  const [status, setStatus] = React.useState<ImageLoadingStatus>('idle');
  const value = React.useMemo<AvatarContextValue>(() => ({ status, onStatusChange: setStatus }), [status]);
  const interactive = Boolean(render);
  const element = useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('avatar', { shape, size }),
        stylex.props(reset.base, styles.base, shapes[shape], sizes[size], interactive && styles.interactive),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <AvatarContext.Provider value={value}>{element}</AvatarContext.Provider>;
});

export type AvatarImageProps = React.ComponentPropsWithRef<'img'>;

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(function MosaicAvatarImage(
  { src, alt = '', className, style, ...rest },
  ref,
) {
  const { status, onStatusChange } = useAvatarContext('Avatar.Image');

  // Preload `src` and report status to the root, so the fallback shows until the image resolves.
  // A layout effect, because it also has to catch the case below before anything is painted.
  useSafeLayoutEffect(() => {
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

  const pending = status === 'loading';

  return (
    <span
      ref={ref}
      {...mergeStyleProps(
        themeProps('avatar-fallback', { pending }),
        stylex.props(reset.base, styles.fallback, pending && styles.fallbackPending),
        className,
        style,
      )}
      {...rest}
    >
      <span {...mergeStyleProps(themeProps('avatar-fallback-content'), stylex.props(styles.fallbackContent))}>
        {children}
      </span>
    </span>
  );
});

export type AvatarIconProps = React.ComponentPropsWithRef<'span'>;

const AvatarIcon = React.forwardRef<HTMLSpanElement, AvatarIconProps>(function MosaicAvatarIcon(
  { className, style, ...rest },
  ref,
) {
  useAvatarContext('Avatar.Icon');

  return (
    <span
      ref={ref}
      aria-hidden
      {...mergeStyleProps(themeProps('avatar-icon'), stylex.props(reset.base, styles.icon), className, style)}
      {...rest}
    />
  );
});

/**
 * Compound avatar. `Avatar.Root` positions and sizes the box; `Avatar.Image` renders
 * once its source loads; `Avatar.Fallback` holds the space until then, as a blank
 * placeholder that pulses only while an image is actually on its way; `Avatar.Icon`
 * adds an optional corner affordance.
 */
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Icon: AvatarIcon,
};
