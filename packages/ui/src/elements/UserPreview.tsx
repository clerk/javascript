import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import type {
  EnterpriseAccountResource,
  ExternalAccountResource,
  UserPreviewId,
  UserResource,
} from '@clerk/shared/types';
import React from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Text, useLocalizations } from '../customizables';
import type { InternalTheme, PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { UserAvatar } from './UserAvatar';

// TODO Make this accept an interface with the superset of fields in:
// - User
// - ExternalAccountResource
// - EnterpriseAccountResource

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
  subtitleProps?: PropsOfComponent<typeof Text>;
  showAvatar?: boolean;
} & (
    | {
        user?: Partial<UserResource>;
        externalAccount?: null | undefined;
        enterpriseAccount?: null | undefined;
      }
    | {
        user?: null | undefined;
        externalAccount?: Partial<ExternalAccountResource>;
        enterpriseAccount?: null | undefined;
      }
    | {
        user?: null | undefined;
        externalAccount?: null | undefined;
        enterpriseAccount?: Partial<EnterpriseAccountResource>;
      }
  );

export const UserPreview = (props: UserPreviewProps) => {
  const {
    user,
    externalAccount,
    enterpriseAccount,
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
    subtitleProps,
    ...rest
  } = props;
  const { t } = useLocalizations();
  const name = getFullName({ ...user }) || getFullName({ ...externalAccount }) || getFullName({ ...enterpriseAccount });
  const identifier =
    getIdentifier({ ...user }) || externalAccount?.accountIdentifier?.() || enterpriseAccount?.emailAddress;
  const localizedTitle = t(title);

  const imageUrl = imageUrlProp || user?.imageUrl || externalAccount?.imageUrl;

  const getAvatarSizes = (t: InternalTheme) =>
    (({ xs: t.sizes.$5, sm: t.sizes.$8, md: t.sizes.$9, lg: t.sizes.$12 }) as const)[size];

  const mainIdentifierSize =
    mainIdentifierVariant || ({ xs: 'subtitle', sm: 'caption', md: 'subtitle', lg: 'h1' } as const)[size];

  const previewTitle = localizedTitle || name || identifier;

  return (
    <Flex
      elementDescriptor={descriptors.userPreview}
      elementId={descriptors.userPreview.setId(elementId)}
      align='center'
      as='span'
      sx={[
        t => ({
          minWidth: '0px',
          width: 'fit-content',
          gap: t.space.$4,
          // We reserve space for the avatar if it is not visible
          minHeight: imageUrl && !showAvatar ? getAvatarSizes(t) : undefined,
        }),
        sx,
      ]}
      {...rest}
    >
      {/*Do not attempt to render or reserve space based on height if image url is not defined*/}
      {imageUrl ? (
        showAvatar ? (
          <Flex
            elementDescriptor={descriptors.userPreviewAvatarContainer}
            elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
            justify='center'
            as='span'
            sx={{ position: 'relative' }}
          >
            <UserAvatar
              boxElementDescriptor={descriptors.userPreviewAvatarBox}
              imageElementDescriptor={descriptors.userPreviewAvatarImage}
              {...user}
              {...externalAccount}
              {...enterpriseAccount}
              name={name}
              avatarUrl={imageUrl}
              size={getAvatarSizes}
              sx={avatarSx}
              rounded={rounded}
            />

            {icon && (
              <Flex
                elementDescriptor={descriptors.userPreviewAvatarIcon}
                sx={[{ position: 'absolute', insetInlineStart: 0, bottom: 0 }, iconSx]}
                as='span'
              >
                {icon}
              </Flex>
            )}
          </Flex>
        ) : null
      ) : null}

      <Flex
        elementDescriptor={descriptors.userPreviewTextContainer}
        elementId={descriptors.userPreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        as='span'
        sx={{ minWidth: '0px', textAlign: 'start' }}
      >
        <Text
          elementDescriptor={descriptors.userPreviewMainIdentifier}
          elementId={descriptors.userPreviewMainIdentifier.setId(elementId)}
          variant={mainIdentifierSize}
          as='span'
          sx={[theme => ({ display: 'flex', gap: theme.sizes.$1, alignItems: 'center' }), mainIdentifierSx]}
        >
          {previewTitle && (
            <Text
              elementDescriptor={descriptors.userPreviewMainIdentifierText}
              elementId={descriptors.userPreviewMainIdentifierText.setId(elementId)}
              as='span'
              truncate
              sx={{ fontWeight: 'inherit' }}
            >
              {previewTitle}
            </Text>
          )}
          {badge}
        </Text>

        {(subtitle || (name && identifier)) && (
          <Text
            elementDescriptor={descriptors.userPreviewSecondaryIdentifier}
            elementId={descriptors.userPreviewSecondaryIdentifier.setId(elementId)}
            truncate
            as='span'
            localizationKey={subtitle || identifier}
            colorScheme='secondary'
            {...subtitleProps}
          />
        )}
      </Flex>
    </Flex>
  );
};
