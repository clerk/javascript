import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { skeletonStyles } from '../../styles/skeleton.styles';
import { shapes, sizes, styles } from './avatar.styles';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarContextValue {
  bordered: boolean;
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
  bordered?: boolean;
  shape?: 'circle' | 'square';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'fit';
}

const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarProps>(function MosaicAvatarRoot(
  { bordered = true, shape = 'circle', size = 'md', render, xstyle, ...rest },
  ref,
) {
  const [status, setStatus] = React.useState<ImageLoadingStatus>('idle');
  const value = React.useMemo<AvatarContextValue>(
    () => ({ bordered, status, onStatusChange: setStatus }),
    [bordered, status],
  );
  const interactive = Boolean(render);
  const element = useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('avatar', { bordered, shape, size }),
        stylex.props(
          reset.base,
          styles.base,
          shapes[shape],
          sizes[size],
          interactive && styles.interactive,
          interactive && focusOutline.visible,
          xstyle,
        ),
        rest,
      ),
    },
  });

  return <AvatarContext.Provider value={value}>{element}</AvatarContext.Provider>;
});

export type AvatarImageProps = MosaicElementProps<'img'>;

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(function MosaicAvatarImage(
  { src, srcSet, sizes, alt = '', onLoad, onError, xstyle, ...rest },
  ref,
) {
  const { bordered, status, onStatusChange } = useAvatarContext('Avatar.Image');
  const imageRef = React.useRef<HTMLImageElement>(null);
  const mergedRef = useMergeRefs([imageRef, ref]);

  useSafeLayoutEffect(() => {
    const image = imageRef.current;
    if (!image || (!src && !srcSet)) {
      onStatusChange('error');
      return;
    }

    if (image.complete) {
      onStatusChange(image.naturalWidth > 0 ? 'loaded' : 'error');
      return;
    }

    onStatusChange('loading');
  }, [src, srcSet, sizes, onStatusChange]);

  return (
    <img
      ref={mergedRef}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      // An avatar is an identity mark, not content to pull out of the page — dragging one
      // only ever produces a stray ghost image mid-interaction.
      draggable={false}
      onLoad={event => {
        onStatusChange('loaded');
        onLoad?.(event);
      }}
      onError={event => {
        onStatusChange('error');
        onError?.(event);
      }}
      {...mergeStyleProps(
        themeProps('avatar-image'),
        stylex.props(
          reset.base,
          styles.image,
          bordered && styles.overlay,
          (status === 'loading' || status === 'error' || (!src && !srcSet)) && styles.imageHidden,
          xstyle,
        ),
        rest,
      )}
    />
  );
});

export interface AvatarFallbackProps extends MosaicElementProps<'span'> {
  /** Wait this many ms before showing the fallback, to avoid a flash on fast connections. */
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(function MosaicAvatarFallback(
  { delayMs, xstyle, children, ...rest },
  ref,
) {
  const { bordered, status } = useAvatarContext('Avatar.Fallback');
  const [canRender, setCanRender] = React.useState(delayMs === undefined);

  React.useEffect(() => {
    if (delayMs === undefined) {
      return;
    }
    const timer = setTimeout(() => setCanRender(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const pending = canRender && status === 'loading';

  if (!canRender || status === 'loaded') {
    return null;
  }

  return (
    <span
      ref={ref}
      {...mergeStyleProps(
        themeProps('avatar-fallback', { pending }),
        stylex.props(
          reset.base,
          styles.fallback,
          bordered && styles.overlay,
          pending && skeletonStyles.shimmer,
          xstyle,
        ),
        rest,
      )}
    >
      <span {...mergeStyleProps(themeProps('avatar-fallback-content'), stylex.props(styles.fallbackContent))}>
        {children}
      </span>
    </span>
  );
});

export type AvatarIconProps = MosaicElementProps<'span'>;

const AvatarIcon = React.forwardRef<HTMLSpanElement, AvatarIconProps>(function MosaicAvatarIcon(
  { xstyle, ...rest },
  ref,
) {
  useAvatarContext('Avatar.Icon');

  return (
    <span
      ref={ref}
      aria-hidden
      {...mergeStyleProps(themeProps('avatar-icon'), stylex.props(reset.base, styles.icon, xstyle), rest)}
    />
  );
});

/**
 * Compound avatar. `Avatar.Root` positions and sizes the box; `Avatar.Image` renders
 * from its source; `Avatar.Fallback` holds the space while the image is unavailable,
 * as a blank placeholder that shimmers only while an image is actually on its way; `Avatar.Icon`
 * adds an optional corner affordance.
 */
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Icon: AvatarIcon,
};
