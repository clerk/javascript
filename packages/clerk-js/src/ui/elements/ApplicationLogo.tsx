import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Image, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

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

type ApplicationLogoProps = PropsOfComponent<typeof Flex> & {
  /**
   * The URL of the image to display.
   */
  src?: string;
  /**
   * The alt text for the image.
   */
  alt?: string;
  /**
   * The URL to navigate to when the logo is clicked.
   */
  href?: string;
};

export const ApplicationLogo = (props: ApplicationLogoProps) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const { logoImageUrl, applicationName, homeUrl } = useEnvironment().displayConfig;
  const { parsedLayout } = useAppearance();
  const imageSrc = props.src || parsedLayout.logoImageUrl || logoImageUrl;
  const logoUrl = props.href || parsedLayout.logoLinkUrl || homeUrl;

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
      onLoad={() => setLoaded(true)}
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
        theme => ({
          height: getContainerHeightForImageRatio(imageRef, theme.sizes.$6),
          justifyContent: 'center',
        }),
        props.sx,
      ]}
    >
      {logoUrl ? (
        <RouterLink
          focusRing
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
