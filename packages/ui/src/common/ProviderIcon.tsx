import type { OAuthProvider, PhoneCodeChannel, Web3Provider } from '@clerk/shared/types';

import { descriptors, Span } from '../customizables';
import type { InternalTheme, PropsOfComponent } from '../styledSystem';
import { supportsMaskImage } from './providerIconUtils';
import { ProviderInitialIcon } from './ProviderInitialIcon';

const getIconImageStyles = (
  theme: InternalTheme,
  id: OAuthProvider | Web3Provider | PhoneCodeChannel,
  iconUrl: string,
) => {
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
  id: OAuthProvider | Web3Provider | PhoneCodeChannel;
  iconUrl?: string | null;
  name: string;
  size?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  alt?: string;
  elementDescriptor?: any;
  elementId?: any;
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

  // If no iconUrl or empty string, fallback to ProviderInitialIcon
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

  // Normalize elementDescriptor to array
  const normalizedElementDescriptor = Array.isArray(elementDescriptor) ? elementDescriptor : [elementDescriptor];

  // Use Span with maskImage or backgroundImage based on provider support
  return (
    <Span
      elementDescriptor={normalizedElementDescriptor as any}
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
