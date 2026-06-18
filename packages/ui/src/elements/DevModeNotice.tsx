import type { ThemableCssProp } from '@/ui/styledSystem';

import { Box, Text } from '../customizables';
import { useDevMode } from '../hooks/useDevMode';

export const DevModeOverlay = () => {
  const { showDevModeNotice } = useDevMode();

  if (!showDevModeNotice) {
    return null;
  }

  return (
    <Box
      sx={t => ({
        userSelect: 'none',
        pointerEvents: 'none',
        insetInline: 0,
        bottom: 0,
        position: 'absolute',
        backgroundColor: t.colors.$warning500,
        height: 1,
        maskImage: `linear-gradient(to right, transparent, black 60%, transparent)`,
      })}
    />
  );
};

type DevModeNoticeProps = { sx?: ThemableCssProp };
export const DevModeNotice = (props: DevModeNoticeProps) => {
  const { sx } = props;
  const { showDevModeNotice } = useDevMode();

  if (!showDevModeNotice) {
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
