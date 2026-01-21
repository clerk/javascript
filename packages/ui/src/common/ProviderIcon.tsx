import type { OAuthProvider, PhoneCodeChannel, Web3Provider } from '@clerk/shared/types';
import React from 'react';

import { descriptors, Span } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { ProviderInitialIcon } from './ProviderInitialIcon';
import { supportsMaskImage } from './providerIconUtils';

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
    return (
      <ProviderInitialIcon
        id={id}
        value={name}
        isLoading={isLoading}
        isDisabled={isDisabled}
        sx={sx}
        {...rest}
      />
    );
  }

  // Use Span with maskImage or backgroundImage based on provider support
  return (
    <Span
      elementDescriptor={Array.isArray(elementDescriptor) ? elementDescriptor : ([elementDescriptor] as any)}
      elementId={elementId as any}
      aria-label={alt || `${name} icon`}
      sx={theme => ({
        display: 'inline-block',
        width: theme.sizes[size as keyof typeof theme.sizes] || size,
        height: theme.sizes[size as keyof typeof theme.sizes] || size,
        maxWidth: '100%',
        opacity: isLoading || isDisabled ? 0.5 : 1,
        ...(supportsMaskImage(id)
          ? {
              '--cl-icon-fill': theme.colors.$colorForeground,
              backgroundColor: 'var(--cl-icon-fill)',
              maskImage: `url(${iconUrl})`,
              maskSize: 'cover',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
            }
          : {
              backgroundImage: `url(${iconUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }),
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
      {...rest}
    />
  );
};
