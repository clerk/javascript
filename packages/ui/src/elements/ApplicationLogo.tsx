import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Image, useAppearance } from '../customizables';
import { Link } from '../primitives';
import type { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

const getContainerHeightForImageRatio = (imageRef: React.RefObject<HTMLImageElement>, width: string) => {
  if (!imageRef.current) {
    return `calc(${width} * 2)`;
  }
  const ratio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;

  if (ratio <= 1) {
    return `calc(${width} * 2)`;
  } else if (ratio > 1 && ratio <= 2) {
    return `calc((${width} * 2) / ${ratio})`;
  }
  return width;
};

function resolveColorScheme(el: Element): 'light' | 'dark' {
  const computed = getComputedStyle(el).colorScheme;
  if (computed === 'dark') {
    return 'dark';
  }
  if (computed === 'light dark' || computed === 'dark light') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function useResolvedColorScheme(ref: React.RefObject<Element>): 'light' | 'dark' {
  const [scheme, setScheme] = React.useState<'light' | 'dark'>('light');

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const update = () => setScheme(resolveColorScheme(el));
    update();

    // Watch system preference changes (for color-scheme: normal / light dark)
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', update);

    // Watch ancestors for style/class changes that might affect inherited color-scheme
    const observer = new MutationObserver(update);
    let ancestor: Element | null = el;
    while (ancestor) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] });
      ancestor = ancestor.parentElement;
    }

    return () => {
      mql.removeEventListener('change', update);
      observer.disconnect();
    };
  }, [ref]);

  return scheme;
}

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const { logoImageUrl, darkLogoImageUrl, applicationName, homeUrl } = useEnvironment().displayConfig;
  const { parsedOptions } = useAppearance();
  const imageSrc = src || parsedOptions.logoImageUrl || logoImageUrl;
  const darkImageSrc =
    src || parsedOptions.logoImageUrl ? undefined : parsedOptions.darkLogoImageUrl || darkLogoImageUrl;
  const imageAlt = alt || applicationName;
  const logoUrl = href || parsedOptions.logoLinkUrl || homeUrl;
  const colorScheme = useResolvedColorScheme(containerRef);
  const showDark = darkImageSrc && colorScheme === 'dark';

  if (!imageSrc) {
    return null;
  }

  const sharedImageStyles = {
    height: '100%',
    width: '100%',
    objectFit: 'contain' as const,
  };

  const image = (
    <Image
      ref={imageRef}
      elementDescriptor={descriptors.logoImage}
      alt={imageAlt}
      src={showDark ? darkImageSrc : imageSrc}
      size={200}
      onLoad={() => setLoaded(true)}
      sx={{
        display: loaded ? 'inline-block' : 'none',
        ...sharedImageStyles,
      }}
    />
  );

  return (
    <Flex
      ref={containerRef}
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
