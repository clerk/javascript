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
    rounded = true,
    imageFetchSize = 80,
    sx,
    boxElementDescriptor,
    imageElementDescriptor,
  } = props;
  const [error, setError] = React.useState(false);

  const ImgOrFallback =
    initials && (!imageUrl || error) ? (
      <InitialsAvatarFallback initials={initials} />
    ) : (
      <Image
        elementDescriptor={[imageElementDescriptor, descriptors.avatarImage]}
        title={title}
        alt={title}
        src={imageUrl || ''}
        sx={{ objectFit: 'cover', width: '100%', height: '100%' }}
        onError={() => setError(true)}
        size={imageFetchSize}
      />
    );

  // TODO: Revise size handling. Do we need to be this dynamic or should we use the theme instead?
  return (
    <Flex
      as='span'
      elementDescriptor={[boxElementDescriptor, descriptors.avatarBox]}
      sx={[
        t => ({
          flexShrink: 0,
          borderRadius: rounded ? t.radii.$circle : t.radii.$avatar,
          overflow: 'hidden',
          width: size(t),
          height: size(t),
          backgroundColor: t.colors.$avatarBackground,
          backgroundClip: 'padding-box',
          position: 'relative',
        }),
        sx,
      ]}
    >
      {ImgOrFallback}

      {/* /**
       * This Box is the "shimmer" effect for the avatar.
       * The ":after" selector is responsible for the border shimmer animation.
       */}
      <Box
        as='span'
        sx={t => ({
          overflow: 'hidden',
          background: t.colors.$colorShimmer,
          position: 'absolute',
          width: '25%',
          height: '100%',
          transition: `all ${t.transitionDuration.$slow} ${t.transitionTiming.$easeOut}`,
          transform: 'var(--cl-shimmer-hover-transform, skewX(-45deg) translateX(-300%))',
          ':after': {
            display: 'block',
            boxSizing: 'border-box',
            content: "''",
            position: 'absolute',
            width: '400%',
            height: '100%',
            transform: 'var(--cl-shimmer-hover-after-transform, skewX(45deg) translateX(75%))',
            transition: `all ${t.transitionDuration.$slow} ${t.transitionTiming.$easeOut}`,
            borderWidth: t.borderWidths.$heavy,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$colorShimmer,
            borderRadius: rounded ? t.radii.$circle : t.radii.$avatar,
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
