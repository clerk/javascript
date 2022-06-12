import { isRetinaDisplay } from '@clerk/shared/utils/isRetinaDisplay';
import React from 'react';

import { descriptors, Flex, Image } from '../customizables';

type AvatarProps = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
  profileImageFetchSize?: number;
  size?: number;
  optimize?: boolean;
};

export const Avatar = (props: AvatarProps) => {
  const { size = 24, firstName, lastName, name, profileImageUrl, optimize, profileImageFetchSize = 64 } = props;
  const [error, setError] = React.useState(false);
  const initials = getInitials(firstName, lastName, name);
  const fullName = getFullName(firstName, lastName, name);
  const avatarExists = hasAvatar(profileImageUrl);

  let src;

  if (!avatarExists) {
    src = GRAVATAR_DEFAULT_AVATAR;
  } else if (!optimize) {
    const optimizedHeight = Math.max(profileImageFetchSize, size) * (isRetinaDisplay() ? 2 : 1);
    const srcUrl = new URL(profileImageUrl!);
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
        width={size}
        height={size}
        onError={() => setError(true)}
      />
    );

  // TODO: Revise size handling. Do we need to by this dynamic or should we use the theme instead?
  return (
    <Flex
      elementDescriptor={descriptors.avatar}
      sx={theme => ({
        borderRadius: theme.radii.$circle,
        overflow: 'hidden',
        minWidth: size,
        minHeight: size,
        border: theme.borders.$normal,
        borderColor: theme.colors.$blackAlpha200,
      })}
    >
      {ImgOrFallback}
    </Flex>
  );
};

function InitialsAvatarFallback(props: AvatarProps) {
  const { size, firstName, lastName, name } = props;
  const initials = getInitials(firstName, lastName, name);
  const fullName = getFullName(firstName, lastName, name);

  return (
    <svg
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0, 0, 100, 100'
      style={{ width: size, height: size }}
      aria-label={fullName}
    >
      <title>{fullName}</title>
      <circle
        cx='50'
        cy='50'
        r='49'
        fill='currentColor'
        strokeWidth='0'
      />
      <text
        x='50'
        y='71.5'
        fontFamily='inherit'
        fontSize='60'
        fontWeight='400'
        textAnchor='middle'
        fill='#ffffff'
      >
        {initials}
      </text>
    </svg>
  );
}

const getFullName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  name: string | null | undefined,
) => name || [firstName, lastName].join(' ').trim() || '';

const getInitials = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  name: string | null | undefined,
) => [(firstName || '')[0], (lastName || '')[0]].join('').trim() || (name || '')[0];

const CLERK_IMAGE_URL_REGEX = /https\:\/\/images\.(lcl)?clerk/i;
const GRAVATAR_DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp';

function hasAvatar(profileImageUrl: string | undefined | null): boolean {
  return CLERK_IMAGE_URL_REGEX.test(profileImageUrl!);
}
