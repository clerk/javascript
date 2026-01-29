import type { OAuthProvider, PhoneCodeChannel, Web3Provider } from '@clerk/shared/types';

import { descriptors, Span } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import type { InternalTheme, PropsOfComponent } from '../styledSystem';
import { ProviderInitialIcon } from './ProviderInitialIcon';

type ProviderId = OAuthProvider | Web3Provider | PhoneCodeChannel;

const SUPPORTS_MASK_IMAGE = ['apple', 'github', 'okx_wallet', 'vercel'] as const;

const supportsMaskImage = (id: ProviderId): boolean => {
  return (SUPPORTS_MASK_IMAGE as readonly string[]).includes(id);
};

const getIconImageStyles = (theme: InternalTheme, id: ProviderId, iconUrl: string) => {
  if (supportsMaskImage(id)) {
    return {
      '--cl-icon-fill': theme.colors.$colorForeground,
      backgroundColor: 'var(--cl-icon-fill)',
      maskImage: `url(${iconUrl})`,
      maskSize: 'cover',
      maskPosition: 'center',
      maskRepeat: 'no-repeat',
    };
  }

  return {
    backgroundImage: `url(${iconUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
};

const getThemeSize = (theme: InternalTheme, size: string): string => {
  return theme.sizes[size as keyof typeof theme.sizes] || size;
};

export type ProviderIconProps = Omit<
  PropsOfComponent<typeof Span>,
  'elementDescriptor' | 'elementId' | 'aria-label'
> & {
  id: ProviderId;
  iconUrl?: string | null;
  name: string;
  size?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  alt?: string;
  elementDescriptor?: ElementDescriptor | Array<ElementDescriptor | undefined>;
  elementId?: ElementId;
};

export const ProviderIcon = (props: ProviderIconProps) => {
  const {
    id,
    iconUrl,
    name,
    size = '$4',
    isLoading,
    isDisabled,
    alt,
    elementDescriptor = descriptors.providerIcon,
    elementId,
    sx,
    ...rest
  } = props;

  if (!iconUrl || iconUrl.trim() === '') {
    const { ref, ...initialIconProps } = rest;
    return (
      <ProviderInitialIcon
        id={id}
        value={name}
        isLoading={isLoading}
        isDisabled={isDisabled}
        sx={sx}
        {...initialIconProps}
      />
    );
  }

  return (
    <Span
      elementDescriptor={elementDescriptor}
      elementId={elementId}
      aria-label={alt || `${name} icon`}
      sx={theme => {
        const iconSize = getThemeSize(theme, size);
        return [
          {
            display: 'inline-block',
            width: iconSize,
            height: iconSize,
            maxWidth: '100%',
            opacity: isLoading || isDisabled ? 0.5 : 1,
            ...getIconImageStyles(theme, id, iconUrl),
          },
          sx,
        ];
      }}
      {...rest}
    />
  );
};
