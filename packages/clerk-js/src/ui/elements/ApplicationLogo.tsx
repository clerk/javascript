import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Image, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

type ApplicationLogoProps = PropsOfComponent<typeof Flex>;

export const ApplicationLogo = (props: ApplicationLogoProps) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const { logoImageUrl, applicationName, homeUrl } = useEnvironment().displayConfig;
  const { parsedLayout } = useAppearance();
  const imageSrc = parsedLayout.logoImageUrl || logoImageUrl;
  const logoUrl = parsedLayout.logoLinkUrl || homeUrl;

  if (!imageSrc) {
    return null;
  }

  const image = (
    <Image
      ref={imageRef}
      elementDescriptor={descriptors.logoImage}
      alt={applicationName}
      src={imageSrc}
      size={200}
      sx={{
        display: 'inline-block',
        height: '100%',
        width: 'auto',
      }}
    />
  );

  return (
    <Flex
      elementDescriptor={descriptors.logoBox}
      {...props}
      sx={[
        theme => ({
          height: theme.sizes.$10,
          objectFit: 'cover',
          justifyContent: 'center',
        }),
        props.sx,
      ]}
    >
      {logoUrl ? (
        <RouterLink
          sx={{
            justifyContent: 'center',
          }}
          to={logoUrl}
        >
          {image}
        </RouterLink>
      ) : (
        image
      )}
    </Flex>
  );
};
