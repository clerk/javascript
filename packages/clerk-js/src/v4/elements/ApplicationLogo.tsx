import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { descriptors, Flex, Image, useAppearance } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

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
  const { logoImage, applicationName } = useEnvironment().displayConfig;
  const { parsedLayout } = useAppearance();
  // TODO: Should we throw an error if logoImageUrl is not a valid url?
  const imageSrc = parsedLayout.logoImageUrl || logoImage?.public_url;

  if (!imageSrc) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.logo}
      {...props}
      sx={[
        theme => ({
          height: getContainerHeightForImageRatio(imageRef, theme.sizes.$6),
          objectFit: 'cover',
        }),
        props.sx,
      ]}
    >
      <Image
        ref={imageRef}
        elementDescriptor={descriptors.logoImage}
        alt={applicationName}
        src={imageSrc}
        onLoad={() => setLoaded(true)}
        sx={{
          display: loaded ? 'inline-block' : 'none',
          height: '100%',
        }}
      />
    </Flex>
  );
};
