import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Card } from '../../components/card';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import type { LogoShape } from './auth.utils';
import { logoShape } from './auth.utils';
import { logoShapes, markStyles } from './auth-mark.styles';

interface AuthMarkProps {
  logoUrl: string;
  shape?: LogoShape;
  onShape: (shape: LogoShape) => void;
  onError: () => void;
}

interface AuthMarkState {
  logoUrl?: string;
  shape?: LogoShape;
  onShape: (shape: LogoShape) => void;
  onError: () => void;
}

export function useAuthMark(applicationLogoUrl?: string): AuthMarkState {
  const [measuredLogo, setMeasuredLogo] = React.useState<{ url: string; shape: LogoShape }>();
  const [failedLogoUrl, setFailedLogoUrl] = React.useState<string>();
  const onShape = React.useCallback(
    (shape: LogoShape) =>
      setMeasuredLogo(previous => {
        if (!applicationLogoUrl || (previous && previous.url === applicationLogoUrl && previous.shape === shape)) {
          return previous;
        }
        return { url: applicationLogoUrl, shape };
      }),
    [applicationLogoUrl],
  );
  const onError = React.useCallback(() => setFailedLogoUrl(applicationLogoUrl), [applicationLogoUrl]);
  const logoUrl = applicationLogoUrl && failedLogoUrl !== applicationLogoUrl ? applicationLogoUrl : undefined;
  const shape = measuredLogo && measuredLogo.url === logoUrl ? measuredLogo.shape : undefined;
  return { logoUrl, shape, onShape, onError };
}

function measuredShape(image: HTMLImageElement): LogoShape | undefined {
  if (!image.complete) {
    return undefined;
  }
  if (image.naturalWidth > 0 && image.naturalHeight > 0) {
    return logoShape(image.naturalWidth, image.naturalHeight);
  }
  const { width, height } = image.getBoundingClientRect();
  return width > 0 ? logoShape(width, height) : undefined;
}

export function AuthMark({ logoUrl, shape = 'wide', onShape, onError }: AuthMarkProps) {
  const measure = React.useCallback(
    (image: HTMLImageElement | null) => {
      const next = image ? measuredShape(image) : undefined;
      if (next) {
        onShape(next);
      }
    },
    [onShape],
  );

  return (
    <Card.Lead aria-hidden>
      <span {...mergeStyleProps(themeProps('auth-mark'), stylex.props(reset.base, markStyles.root))}>
        <span
          {...mergeStyleProps(
            themeProps('auth-mark-logo', { shape }),
            stylex.props(reset.base, markStyles.logo, logoShapes[shape]),
          )}
        >
          <img
            ref={measure}
            src={logoUrl}
            alt=''
            onLoad={event => measure(event.currentTarget)}
            onError={onError}
            {...stylex.props(markStyles.logoImage)}
          />
        </span>
      </span>
    </Card.Lead>
  );
}
