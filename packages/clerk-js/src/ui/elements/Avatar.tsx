import { isRetinaDisplay } from '@clerk/shared';
import React from 'react';

import { descriptors, Flex, Image, Text } from '../customizables';
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
      elementDescriptor={[boxElementDescriptor || descriptors.avatarBox]}
      sx={[
        theme => ({
          flexShrink: 0,
          borderRadius: rounded ? theme.radii.$circle : theme.radii.$md,
          overflow: 'hidden',
          width: size(theme),
          height: size(theme),
          border: theme.borders.$normal,
          borderColor: theme.colors.$avatarBorder,
          backgroundColor: theme.colors.$avatarBackground,
          backgroundClip: 'padding-box',
        }),
        sx,
      ]}
    >
      {ImgOrFallback}
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
