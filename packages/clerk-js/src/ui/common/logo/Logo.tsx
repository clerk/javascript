import React from 'react';
import { useEnvironment } from 'ui/contexts';
import { fitTextInOneLine } from 'ui/signIn/utils';

const LOGO_HEIGHT_BASE = 48;

const calculateLogoRatio = (width: number, height: number, container: HTMLElement) => {
  const ratio = width / height;
  let newHeight = `${LOGO_HEIGHT_BASE}px`;
  if (ratio <= 1) {
    // logo is taller than it is wide
    newHeight = `${2 * LOGO_HEIGHT_BASE}px`;
  } else if (ratio > 1 && ratio <= 2) {
    // logo is up to 2x wider than it is tall
    newHeight = `${(2 * LOGO_HEIGHT_BASE) / ratio}px`;
  }
  container.style.height = newHeight;
};

export function Logo(): JSX.Element {
  const logoImgRef = React.useRef<HTMLImageElement>(null);
  const [logoLoaded, setLogoLoaded] = React.useState(false);

  const { displayConfig } = useEnvironment();
  const logoContainerRef = React.useRef<HTMLDivElement | null>(null);

  const hasLogoImage = !!displayConfig.logoImage;
  const name = displayConfig.applicationName;

  React.useLayoutEffect(() => {
    const logoContainer = logoContainerRef.current;
    if (hasLogoImage || !logoContainer || !name) {
      return;
    }

    if (typeof window === 'undefined' || !window.ResizeObserver) {
      fitTextInOneLine(name, logoContainer, '48px');
      return;
    }

    const ro = new ResizeObserver(() => fitTextInOneLine(name, logoContainer, '48px'));
    ro.observe(logoContainer);
    return () => ro.disconnect();
  }, [hasLogoImage, name]);

  const handleLogoLoaded = () => {
    const container = logoContainerRef.current;
    const logo = logoImgRef.current;
    if (!container || !logo) {
      return;
    }
    calculateLogoRatio(logo.naturalWidth, logo.naturalHeight, container);
    setLogoLoaded(true);
  };

  return (
    <div
      className='cl-logo'
      title={displayConfig.applicationName}
      ref={logoContainerRef}
    >
      {hasLogoImage ? (
        <img
          style={{ display: logoLoaded ? 'unset' : 'none' }}
          onLoad={handleLogoLoaded}
          ref={logoImgRef}
          alt={displayConfig.applicationName}
          src={displayConfig.logoImage.public_url}
        />
      ) : (
        name
      )}
    </div>
  );
}
