import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import React from 'react';

import { useEnvironment } from '../contexts';
import { Box, descriptors, Flex, Image, useAppearance } from '../customizables';
import { Link } from '../primitives';
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

export type ApplicationLogoProps = PropsOfComponent<typeof Flex> & {
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
  /**
   * Whether the href should be treated as an external link.
   * When true, uses a Link component with target="_blank" and proper security attributes.
   * When false or undefined, uses RouterLink for internal navigation.
   */
  isExternal?: boolean;
};

export const ApplicationLogo: React.FC<ApplicationLogoProps> = (props: ApplicationLogoProps): JSX.Element | null => {
  const { src, alt, href, isExternal, sx, ...rest } = props;
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const { logoImageUrl, applicationName, homeUrl } = useEnvironment().displayConfig;
  const { parsedOptions } = useAppearance();
  const { renderLogoImage } = parsedOptions;
  const imageSrc = src || parsedOptions.logoImageUrl || logoImageUrl;
  const imageAlt = alt || applicationName;
  const logoUrl = href || parsedOptions.logoLinkUrl || homeUrl;

  // Call useRender unconditionally to satisfy React hooks rules
  // When renderLogoImage is undefined, pass undefined and useRender will use the default img element
  const logoElement = useRender({
    defaultTagName: 'img',
    render: renderLogoImage,
    ref: imageRef,
    props: mergeProps<'img'>(
      {
        src: imageSrc || '',
        alt: imageAlt,
        crossOrigin: 'anonymous',
        onLoad: () => setLoaded(true),
        style: {
          height: '100%',
          width: '100%',
          objectFit: 'contain',
        },
      },
      {},
    ),
  });

  // Early return after hooks
  if (!imageSrc && !renderLogoImage) {
    return null;
  }

  let image: React.ReactElement;

  if (renderLogoImage && logoElement) {
    // Use render prop when provided
    image = (
      <Box
        sx={{
          display: loaded ? 'inline-block' : 'none',
          height: '100%',
          width: '100%',
        }}
      >
        {logoElement}
      </Box>
    );
  } else {
    // Fallback to existing Image component behavior
    image = (
      <Image
        ref={imageRef}
        elementDescriptor={descriptors.logoImage}
        alt={imageAlt}
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
  }

  return (
    <Flex
      elementDescriptor={descriptors.logoBox}
      {...rest}
      sx={[
        theme => ({
          height: getContainerHeightForImageRatio(imageRef, theme.sizes.$6),
          justifyContent: 'center',
        }),
        sx,
      ]}
    >
      {logoUrl ? (
        isExternal ? (
          <Link
            focusRing
            href={logoUrl}
            isExternal
          >
            {image}
          </Link>
        ) : (
          <RouterLink
            focusRing
            to={logoUrl}
          >
            {image}
          </RouterLink>
        )
      ) : (
        image
      )}
    </Flex>
  );
};
