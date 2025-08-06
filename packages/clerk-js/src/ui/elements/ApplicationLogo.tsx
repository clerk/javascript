import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Image, useAppearance } from '../customizables';
import type { InternalTheme } from '../foundations';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

const logoLoadCache: { [url: string]: boolean } = {};

const getContainerHeightForImageRatio = (imageRef: React.RefObject<HTMLImageElement>, width: string) => {
  if (!imageRef.current) {
    return `calc(${width} * 2)`;
  }
  const ratio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;

  if (ratio <= 1) {
    // logo is taller than it is wide
    return `calc(${width} * 2)`;
  } else if (ratio > 1 && ratio <= 2) {
    // logo is up to 2x wider than it is tall
    return `calc((${width} * 2) / ${ratio})`;
  }
  return width;
};

type ApplicationLogoProps = PropsOfComponent<typeof Flex>;

export const ApplicationLogo = React.memo((props: ApplicationLogoProps) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const { logoImageUrl, applicationName, homeUrl } = useEnvironment().displayConfig;
  const { parsedLayout } = useAppearance();
  const imageSrc = parsedLayout.logoImageUrl || logoImageUrl;
  const logoUrl = parsedLayout.logoLinkUrl || homeUrl;
  const [loaded, setLoaded] = React.useState(() => (imageSrc ? logoLoadCache[imageSrc] || false : false));

  const handleImageLoad = React.useCallback(() => {
    if (imageSrc) {
      logoLoadCache[imageSrc] = true;
      setLoaded(true);
    }
  }, [imageSrc]);

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
      onLoad={handleImageLoad}
      sx={{
        display: loaded ? 'inline-block' : 'none',
        height: '100%',
        width: '100%',
        objectFit: 'contain',
      }}
    />
  );

  return (
    <Flex
      elementDescriptor={descriptors.logoBox}
      {...props}
      sx={[
        (theme: InternalTheme) => ({
          height: getContainerHeightForImageRatio(imageRef, theme.sizes.$6),
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
});
