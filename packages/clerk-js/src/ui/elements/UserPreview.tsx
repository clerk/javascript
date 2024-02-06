import type { ExternalAccountResource, SamlAccountResource, UserPreviewId, UserResource } from '@clerk/types';
import React from 'react';

import { getFullName, getIdentifier } from '../../utils/user';
import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Text, useLocalizations } from '../customizables';
import type { InternalTheme, PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { UserAvatar } from './UserAvatar';

// TODO Make this accept an interface with the superset of fields in:
// - User
// - ExternalAccountResource
// - SamlAccountResource

export type UserPreviewProps = Omit<PropsOfComponent<typeof Flex>, 'title' | 'elementId'> & {
  size?: 'lg' | 'md' | 'sm' | 'xs';
  icon?: React.ReactNode;
  iconSx?: ThemableCssProp;
  badge?: React.ReactNode;
  imageUrl?: string | null;
  rounded?: boolean;
  elementId?: UserPreviewId;
  avatarSx?: ThemableCssProp;
  mainIdentifierSx?: ThemableCssProp;
  mainIdentifierVariant?: PropsOfComponent<typeof Text>['variant'];
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
  showAvatar?: boolean;
} & (
    | {
        user?: Partial<UserResource>;
        externalAccount?: null | undefined;
        samlAccount?: null | undefined;
      }
    | {
        user?: null | undefined;
        externalAccount?: Partial<ExternalAccountResource>;
        samlAccount?: null | undefined;
      }
    | {
        user?: null | undefined;
        externalAccount?: null | undefined;
        samlAccount?: Partial<SamlAccountResource>;
      }
  );

export const UserPreview = (props: UserPreviewProps) => {
  const {
    user,
    externalAccount,
    samlAccount,
    size = 'md',
    showAvatar = true,
    icon,
    iconSx,
    rounded = true,
    imageUrl: imageUrlProp,
    badge,
    elementId,
    sx,
    title,
    subtitle,
    avatarSx,
    mainIdentifierSx,
    mainIdentifierVariant,
    ...rest
  } = props;
  const { t } = useLocalizations();
  const name = getFullName({ ...user }) || getFullName({ ...externalAccount }) || getFullName({ ...samlAccount });
  const identifier = getIdentifier({ ...user }) || externalAccount?.accountIdentifier?.() || samlAccount?.emailAddress;
  const localizedTitle = t(title);

  const imageUrl = imageUrlProp || user?.imageUrl || externalAccount?.imageUrl;

  const getAvatarSizes = (t: InternalTheme) =>
    (({ xs: t.sizes.$5, sm: t.sizes.$8, md: t.sizes.$9, lg: t.sizes.$12 } as const)[size]);

  const mainIdentifierSize =
    mainIdentifierVariant || ({ xs: 'subtitle', sm: 'caption', md: 'subtitle', lg: 'h1' } as const)[size];

  return (
    <Flex
      elementDescriptor={descriptors.userPreview}
      elementId={descriptors.userPreview.setId(elementId)}
      align='center'
      sx={[t => ({ minWidth: '0px', width: 'fit-content', gap: t.space.$4 }), sx]}
      {...rest}
    >
      {/*Do not attempt to render or reserve space based on height if image url is not defined*/}
      {imageUrl ? (
        showAvatar ? (
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
              {...externalAccount}
              {...samlAccount}
              name={name}
              avatarUrl={imageUrl}
              size={getAvatarSizes}
              sx={avatarSx}
              rounded={rounded}
            />

            {icon && (
              <Flex
                elementDescriptor={descriptors.userPreviewAvatarIcon}
                sx={[{ position: 'absolute', left: 0, bottom: 0 }, iconSx]}
              >
                {icon}
              </Flex>
            )}
          </Flex>
        ) : (
          // Reserve layout space when avatar is not visible
          <Flex
            elementDescriptor={descriptors.userPreviewAvatarContainer}
            elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
            justify='center'
            sx={t => ({
              height: getAvatarSizes(t),
            })}
          />
        )
      ) : null}

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
          variant={mainIdentifierSize}
          sx={[theme => ({ display: 'flex', gap: theme.sizes.$1, alignItems: 'center' }), mainIdentifierSx]}
        >
          <Text
            as='span'
            truncate
            sx={{ fontWeight: 'inherit' }}
          >
            {localizedTitle || name || identifier}
          </Text>

          {badge}
        </Text>

        {(subtitle || (name && identifier)) && (
          <Text
            elementDescriptor={descriptors.userPreviewSecondaryIdentifier}
            elementId={descriptors.userPreviewSecondaryIdentifier.setId(elementId)}
            truncate
            localizationKey={subtitle || identifier}
          />
        )}
      </Flex>
    </Flex>
  );
};
