import type { ThemableCssProp } from 'ui/styledSystem';

import { useEnvironment } from '../contexts';
import { Box, Text } from '../customizables';

export const DevModeOverlay = () => {
  const { isDevelopmentOrStaging } = useEnvironment();

  if (!isDevelopmentOrStaging()) {
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
        maskImage: 'linear-gradient(transparent 60%, black)',
      })}
    />
  );
};

type DevModeNoticeProps = { sx?: ThemableCssProp };
export const DevModeNotice = (props: DevModeNoticeProps) => {
  const { sx } = props;
  const { isDevelopmentOrStaging } = useEnvironment();

  if (!isDevelopmentOrStaging()) {
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
