import { isRetinaDisplay } from '@clerk/shared/utils/isRetinaDisplay';
import React from 'react';

import { descriptors, Flex, Image, Text } from '../customizables';
import { InternalTheme } from '../foundations';
import { common, ThemableCssProp } from '../styledSystem';
import { getFullName, getInitials } from '../utils';

type AvatarProps = {
  size?: (theme: InternalTheme) => string | number;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
  profileImageFetchSize?: number;
  optimize?: boolean;
  sx?: ThemableCssProp;
};

export const Avatar = (props: AvatarProps) => {
  const {
    size = () => 26,
    firstName,
    lastName,
    name,
    profileImageUrl,
    optimize,
    profileImageFetchSize = 64,
    sx,
  } = props;
  const [error, setError] = React.useState(false);
  const initials = getInitials({ firstName, lastName, name });
  const fullName = getFullName({ firstName, lastName, name });
  const avatarExists = hasAvatar(profileImageUrl);
  let src;

  if (!avatarExists) {
    src = GRAVATAR_DEFAULT_AVATAR;
  } else if (!optimize && profileImageUrl) {
    const optimizedHeight = Math.max(profileImageFetchSize) * (isRetinaDisplay() ? 2 : 1);
    const srcUrl = new URL(profileImageUrl);
    srcUrl.searchParams.append('height', optimizedHeight.toString());
    src = srcUrl.toString();
  } else {
    src = profileImageUrl;
  }

  const ImgOrFallback =
    initials && (!avatarExists || error) ? (
      <InitialsAvatarFallback {...props} />
    ) : (
      <Image
        elementDescriptor={descriptors.avatarImage}
        alt={fullName}
        title={fullName}
        src={src || GRAVATAR_DEFAULT_AVATAR}
        width='100%'
        height='100%'
        onError={() => setError(true)}
      />
    );

  // TODO: Revise size handling. Do we need to be this dynamic or should we use the theme instead?
  return (
    <Flex
      elementDescriptor={descriptors.avatar}
      sx={[
        theme => ({
          flexShrink: 0,
          borderRadius: theme.radii.$circle,
          overflow: 'hidden',
          width: size(theme),
          height: size(theme),
          border: theme.borders.$normal,
          borderColor: theme.colors.$avatarBorder,
          backgroundColor: theme.colors.$avatarBackground,
          color: theme.colors.$colorText,
          objectFit: 'cover',
          backgroundClip: 'padding-box',
        }),
        sx,
      ]}
    >
      {ImgOrFallback}
    </Flex>
  );
};

function InitialsAvatarFallback(props: AvatarProps) {
  const initials = getInitials(props);

  return (
    <Text
      as='span'
      sx={{ ...common.centeredFlex('inline-flex'), width: '100%' }}
    >
      {initials}
    </Text>
  );
}

const CLERK_IMAGE_URL_REGEX = /https:\/\/images\.(lcl)?clerk/i;
const GRAVATAR_DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp';

// TODO: How do we want to handle this?
export function hasAvatar(profileImageUrl: string | undefined | null): boolean {
  return CLERK_IMAGE_URL_REGEX.test(profileImageUrl!) || !!profileImageUrl;
}
