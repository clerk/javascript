import type { ThemableCssProp } from 'ui/styledSystem';

import { useEnvironment } from '../contexts';
import { Box, Text } from '../customizables';

type DevModeOverlayProps = {
  gradient?: number;
};

export const DevModeOverlay = (props: DevModeOverlayProps) => {
  const { gradient = 60 } = props;
  const { displayConfig } = useEnvironment();

  if (!displayConfig.showDevModeWarning) {
    return null;
  }

  return (
    <Box
      sx={t => ({
        userSelect: 'none',
        pointerEvents: 'none',
        inset: 0,
        position: 'absolute',
        background: `repeating-linear-gradient(-45deg,${t.colors.$warningAlpha100},${t.colors.$warningAlpha100} 6px,${t.colors.$warningAlpha150} 6px,${t.colors.$warningAlpha150} 12px)`,
        maskImage: `linear-gradient(transparent ${gradient}%, black)`,
      })}
    />
  );
};

type DevModeNoticeProps = { sx?: ThemableCssProp };
export const DevModeNotice = (props: DevModeNoticeProps) => {
  const { sx } = props;
  const { displayConfig } = useEnvironment();

  if (!displayConfig.showDevModeWarning) {
    return null;
  }

  return (
    <Text
      sx={[
        t => ({
          color: t.colors.$warning500,
          fontWeight: t.fontWeights.$semibold,
          padding: t.space.$1x5,
        }),
        sx,
      ]}
    >
      Development mode
    </Text>
  );
};
