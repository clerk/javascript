import React from 'react';
import cn from 'classnames';
//@ts-ignore
import styles from './Avatar.module.scss';
import { isRetinaDisplay } from '../../utils/isRetinaDisplay';

const CLERK_DEFAULT_AVATAR =
  'https://images.clerk.services/clerk/default-profile.svg';
const GRAVATAR_DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp';

function hasAvatar(profileImageUrl: string | undefined) {
  // TODO: Revise this brittle check. Users without avatar should have null or undefined profile_image_url
  return (
    !!profileImageUrl &&
    profileImageUrl !== CLERK_DEFAULT_AVATAR &&
    profileImageUrl !== GRAVATAR_DEFAULT_AVATAR
  );
}

function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  name: string | null | undefined,
) {
  return (
    [(firstName || '')[0], (lastName || '')[0]].join('').trim() ||
    (name || '')[0]
  );
}

function getFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  name: string | null | undefined,
) {
  return name || [firstName, lastName].join(' ').trim() || '';
}

export type AvatarProps = {
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string;
  profileImageFetchSize?: number;
  name?: string | null;
  size?: number;
  className?: string;
  optimize?: boolean;
};

export function Avatar({
  size = 24,
  className,
  firstName,
  lastName,
  profileImageFetchSize = 64,
  profileImageUrl,
  name,
  optimize = false,
}: AvatarProps): JSX.Element {
  const [error, setError] = React.useState(false);
  const initials = getInitials(firstName, lastName, name);
  const fullName = getFullName(firstName, lastName, name);
  const avatarExists = hasAvatar(profileImageUrl);

  if (initials && (!avatarExists || error)) {
    return (
      <InitialsAvatarFallback
        initials={initials}
        className={className}
        fullName={fullName}
        size={size}
      />
    );
  }

  const optimisedHeight =
    Math.max(profileImageFetchSize, size) * (isRetinaDisplay() ? 2 : 1);

  let src;

  if (avatarExists) {
    src = optimize
      ? `${profileImageUrl}?height=${optimisedHeight}`
      : profileImageUrl;
  } else {
    src = GRAVATAR_DEFAULT_AVATAR;
  }

  return (
    <img
      alt={fullName}
      title={fullName}
      src={src}
      className={cn(styles.avatar, className)}
      width={size}
      height={size}
      onError={() => setError(true)}
    />
  );
}

interface InitialsAvatarFallbackProps {
  className?: string;
  size?: number;
  fullName: string;
  initials: string;
}

function InitialsAvatarFallback({
  className,
  size,
  fullName,
  initials,
}: InitialsAvatarFallbackProps) {
  return (
    <svg
      className={className}
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0, 0, 100, 100'
      style={{ width: size, height: size }}
      aria-label={fullName}
    >
      <title>{fullName}</title>
      <circle cx='50' cy='50' r='49' fill='currentColor' strokeWidth='0' />
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
