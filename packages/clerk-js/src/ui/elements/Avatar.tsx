import { isRetinaDisplay } from '@clerk/shared';
import React from 'react';

import { BoringAvatar } from '../common/BoringAvatar';
import { descriptors, Flex, Image, Text, useAppearance } from '../customizables';
import { ElementDescriptor } from '../customizables/elementDescriptors';
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
  boxElementDescriptor?: ElementDescriptor;
  imageElementDescriptor?: ElementDescriptor;
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
    boxElementDescriptor,
    imageElementDescriptor,
  } = props;
  const [error, setError] = React.useState(false);
  const fullName = getFullName({ firstName, lastName, name });
  const avatarExists = hasAvatar(profileImageUrl);
  let src;

  if (avatarExists && !optimize && profileImageUrl) {
    const optimizedHeight = Math.max(profileImageFetchSize) * (isRetinaDisplay() ? 2 : 1);
    const srcUrl = new URL(profileImageUrl);
    srcUrl.searchParams.append('height', optimizedHeight.toString());
    src = srcUrl.toString();
  } else {
    src = profileImageUrl;
  }

  const ImgOrFallback =
    !avatarExists || error ? (
      <InitialsAvatarFallback {...props} />
    ) : (
      <Image
        elementDescriptor={imageElementDescriptor || descriptors.avatarImage}
        alt={fullName}
        title={fullName}
        src={src || ''}
        width='100%'
        height='100%'
        onError={() => setError(true)}
      />
    );

  // TODO: Revise size handling. Do we need to be this dynamic or should we use the theme instead?
  return (
    <Flex
      elementDescriptor={boxElementDescriptor || descriptors.avatar}
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
  const { parsedInternalTheme } = useAppearance();

  return (
    <Flex
      sx={{ position: 'relative' }}
      justify='center'
      align='center'
    >
      <BoringAvatar
        size={props.size?.(parsedInternalTheme)}
        colors={parsedInternalTheme.colors.$colorAvatarGradient}
      />
      {initials && (
        <Text
          as='span'
          sx={{ ...common.centeredFlex('inline-flex'), width: '100%', position: 'absolute' }}
        >
          {initials}
        </Text>
      )}
    </Flex>
  );
}

const CLERK_IMAGE_URL_REGEX = /https:\/\/images\.(lcl)?clerk/i;
const GRAVATAR_URL_REGEX = /gravatar/i;
// TODO: How do we want to handle this?
export function hasAvatar(profileImageUrl: string | undefined | null): boolean {
  return (
    (CLERK_IMAGE_URL_REGEX.test(profileImageUrl!) || !!profileImageUrl) &&
    !GRAVATAR_URL_REGEX.test(profileImageUrl as string)
  );
}
