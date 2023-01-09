import { isRetinaDisplay } from '@clerk/shared';
import React from 'react';

import { Box, descriptors, Flex, Image, Text } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { InternalTheme } from '../foundations';
import type { PropsOfComponent } from '../styledSystem';
import { common } from '../styledSystem';

type AvatarProps = PropsOfComponent<typeof Flex> & {
  size?: (theme: InternalTheme) => string | number;
  title?: string;
  initials?: string;
  imageUrl?: string | null;
  imageFetchSize?: number;
  optimize?: boolean;
  rounded?: boolean;
  boxElementDescriptor?: ElementDescriptor;
  imageElementDescriptor?: ElementDescriptor;
};

export const Avatar = (props: AvatarProps) => {
  const {
    size = () => 26,
    title,
    initials,
    imageUrl,
    optimize,
    rounded = true,
    imageFetchSize = 64,
    sx,
    boxElementDescriptor,
    imageElementDescriptor,
  } = props;
  const [error, setError] = React.useState(false);
  const avatarExists = hasAvatar(imageUrl);
  let src;
  if (!avatarExists) {
    src = GRAVATAR_DEFAULT_AVATAR;
  } else if (!optimize && imageUrl) {
    const optimizedHeight = Math.max(imageFetchSize) * (isRetinaDisplay() ? 2 : 1);
    const srcUrl = new URL(imageUrl);
    srcUrl.searchParams.append('height', optimizedHeight.toString());
    src = srcUrl.toString();
  } else {
    src = imageUrl;
  }

  const ImgOrFallback =
    initials && (!avatarExists || error) ? (
      <InitialsAvatarFallback initials={initials} />
    ) : (
      <Image
        elementDescriptor={[imageElementDescriptor, descriptors.avatarImage]}
        title={title}
        alt={title}
        src={src || ''}
        width='100%'
        height='100%'
        sx={{ objectFit: 'cover' }}
        onError={() => setError(true)}
      />
    );

  // TODO: Revise size handling. Do we need to be this dynamic or should we use the theme instead?
  return (
    <Flex
      elementDescriptor={[boxElementDescriptor, descriptors.avatarBox]}
      sx={[
        t => ({
          flexShrink: 0,
          borderRadius: rounded ? t.radii.$circle : t.radii.$md,
          overflow: 'hidden',
          width: 'var(--cl-avatar-size)',
          height: 'var(--cl-avatar-size)',
          backgroundColor: t.colors.$avatarBackground,
          backgroundClip: 'padding-box',
          position: 'relative',
          boxShadow: 'var(--cl-shimmer-hover-shadow)',
          transition: `box-shadow ${t.transitionDuration.$slower} ${t.transitionTiming.$easeOut}`,
          '--cl-avatar-size': size(t),
        }),
        sx,
      ]}
    >
      {ImgOrFallback}

      {/**
       * This Box is the "shimmer" effect for the avatar.
       * The ":after" selector is responsible for the border shimmer animation.
       */}
      <Box
        elementDescriptor={descriptors.avatarShimmerBox}
        sx={t => ({
          overflow: 'hidden',
          background: t.colors.$whiteAlpha500,
          position: 'absolute',
          width: '25%',
          height: '100%',
          transition: `all ${t.transitionDuration.$slower} ${t.transitionTiming.$easeOut}`,
          transform: 'var(--cl-shimmer-hover-transform, skewX(-45deg) translateX(-300%))',
          ':after': {
            display: 'block',
            content: "''",
            position: 'absolute',
            width: '400%',
            height: '100%',
            transform: 'var(--cl-shimmer-hover-after-transform, skewX(45deg) translateX(75%))',
            transition: `all ${t.transitionDuration.$slower} ${t.transitionTiming.$easeOut}`,
            border: t.borders.$heavy,
            borderColor: t.colors.$whiteAlpha500,
            borderRadius: rounded ? t.radii.$circle : t.radii.$md,
          },
        })}
      />
    </Flex>
  );
};

const InitialsAvatarFallback = (props: { initials: string }) => {
  const initials = props.initials;

  return (
    <Text
      as='span'
      sx={{ ...common.centeredFlex('inline-flex'), width: '100%' }}
    >
      {initials}
    </Text>
  );
};

const GRAVATAR_DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp';
const CLERK_IMAGE_URL_REGEX = /https:\/\/images\.(lcl)?clerk/i;

// TODO: How do we want to handle this?
export function hasAvatar(imageUrl: string | undefined | null): boolean {
  if (!imageUrl) {
    return false;
  }
  return CLERK_IMAGE_URL_REGEX.test(imageUrl) || !!imageUrl;
}
