import { UserResource } from '@clerk/types';
import React from 'react';

import { descriptors, Flex, LocalizationKey, Text, useLocalizations } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { getFullName, getIdentifier } from '../utils';
import { UserAvatar } from './UserAvatar';

export type UserPreviewProps = Omit<PropsOfComponent<typeof Flex>, 'title'> & {
  user?: Partial<UserResource>;
  size?: 'lg' | 'md' | 'sm';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  imageUrl?: string | null;
  rounded?: boolean;
  elementId?: any;
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
  showAvatar?: boolean;
};

export const UserPreview = (props: UserPreviewProps) => {
  const {
    user,
    size = 'md',
    showAvatar = true,
    icon,
    rounded = true,
    imageUrl,
    badge,
    elementId,
    sx,
    title,
    subtitle,
    ...rest
  } = props;
  const { t } = useLocalizations();
  const name = getFullName({ ...user });
  const identifier = getIdentifier({ ...user });
  const localizedTitle = t(title);

  return (
    <Flex
      elementDescriptor={descriptors.userPreview}
      elementId={descriptors.userPreview.setId(elementId)}
      gap={4}
      align='center'
      sx={[{ minWidth: '0px', width: '100%' }, sx]}
      {...rest}
    >
      {showAvatar && (
        <Flex
          elementDescriptor={descriptors.userPreviewAvatarContainer}
          elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
          justify='center'
          sx={{ position: 'relative' }}
        >
          <UserAvatar
            boxElementDescriptor={descriptors.userPreviewAvatarBox}
            imageElementDescriptor={descriptors.userPreviewAvatarImage}
            {...user}
            imageUrl={imageUrl || user?.profileImageUrl}
            size={t => ({ sm: t.sizes.$8, md: t.sizes.$11, lg: t.sizes.$12x5 }[size])}
            optimize
            rounded={rounded}
          />
          {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
        </Flex>
      )}
      <Flex
        elementDescriptor={descriptors.userPreviewTextContainer}
        elementId={descriptors.userPreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          elementDescriptor={descriptors.userPreviewMainIdentifier}
          elementId={descriptors.userPreviewMainIdentifier.setId(elementId)}
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {localizedTitle || name || identifier} {badge}
        </Text>
        {(subtitle || (name && identifier)) && (
          <Text
            elementDescriptor={descriptors.userPreviewSecondaryIdentifier}
            elementId={descriptors.userPreviewSecondaryIdentifier.setId(elementId)}
            variant='smallRegular'
            colorScheme='neutral'
            truncate
            localizationKey={subtitle || identifier}
          />
        )}
      </Flex>
    </Flex>
  );
};
