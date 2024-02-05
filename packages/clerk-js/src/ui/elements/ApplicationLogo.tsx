import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Image, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

type WidthInRem = `${string}rem`;
const getContainerHeightForImageRatio = (imageRef: React.RefObject<HTMLImageElement>, remWidth: WidthInRem) => {
  const baseFontSize = 16;
  const base = Number.parseFloat(remWidth.replace('rem', '')) * baseFontSize;
  if (!imageRef.current) {
    return base;
  }
  const ratio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
  let newHeight = `${base}px`;
  if (ratio <= 1) {
    // logo is taller than it is wide
    newHeight = `${2 * base}px`;
  } else if (ratio > 1 && ratio <= 2) {
    // logo is up to 2x wider than it is tall
    newHeight = `${(2 * base) / ratio}px`;
  }
  return newHeight;
};

type ApplicationLogoProps = PropsOfComponent<typeof Flex>;

export const ApplicationLogo = (props: ApplicationLogoProps) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
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
      onLoad={() => setLoaded(true)}
      sx={{
        display: loaded ? 'inline-block' : 'none',
        height: '100%',
      }}
    />
  );

  return (
    <Flex
      elementDescriptor={descriptors.logoBox}
      {...props}
      sx={[
        theme => ({
          height: getContainerHeightForImageRatio(imageRef, theme.sizes.$4),
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
