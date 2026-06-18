import type { ThemableCssProp } from '@/ui/styledSystem';

import { Box, Text } from '../customizables';
import { useDevMode } from '../hooks/useDevMode';

const DEV_MODE_GRID = {
  width: 420,
  height: 25,
  squareSize: 1.5,
  gap: 2,
  minOpacity: 0.15,
  maxOpacity: 0.75,
  contrast: 2,
  fadeWidth: 100,
  fadeHeight: 36,
  edgeFadeStop: 50,
  lineHeight: 2,
} as const;

const cellRandom = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263 + 2246822519) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const buildDevModeGridTile = (options: typeof DEV_MODE_GRID) => {
  const step = options.squareSize + options.gap;
  const tileWidth = Math.max(1, Math.round(options.width / step)) * step;
  const tileHeight = options.height - options.lineHeight;
  let rects = '';

  for (let y = 0; y < tileHeight; y += step) {
    for (let x = 0; x < tileWidth; x += step) {
      const opacity =
        options.minOpacity + (options.maxOpacity - options.minOpacity) * Math.pow(cellRandom(x, y), options.contrast);
      rects += `<rect x="${x}" y="${y}" width="${options.squareSize}" height="${options.squareSize}" fill="#fff" opacity="${opacity.toFixed(2)}"/>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const gridTile = buildDevModeGridTile(DEV_MODE_GRID);
const gridMask = `radial-gradient(ellipse ${DEV_MODE_GRID.fadeWidth}% ${(DEV_MODE_GRID.fadeHeight / DEV_MODE_GRID.height) * 100}% at 50% 100%, #000 0%, transparent 100%)`;
const edgeMask = `linear-gradient(to right, transparent, #000 ${DEV_MODE_GRID.edgeFadeStop}%, #000 ${100 - DEV_MODE_GRID.edgeFadeStop}%, transparent)`;
const lineMask = 'linear-gradient(to right, transparent 2%, #000 50%, transparent 98%)';

export const DevModeOverlay = () => {
  const { showDevModeNotice } = useDevMode();

  if (!showDevModeNotice) {
    return null;
  }

  return (
    <Box
      sx={{
        userSelect: 'none',
        pointerEvents: 'none',
        insetInline: 0,
        bottom: 0,
        position: 'absolute',
        height: DEV_MODE_GRID.height,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          maskImage: edgeMask,
          WebkitMaskImage: edgeMask,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            maskImage: gridMask,
            WebkitMaskImage: gridMask,
          }}
        >
          <Box
            sx={t => ({
              position: 'absolute',
              top: 0,
              insetInline: 0,
              bottom: DEV_MODE_GRID.lineHeight,
              backgroundColor: t.colors.$warning500,
              maskImage: gridTile,
              maskRepeat: 'repeat-x',
              maskPosition: 'left bottom',
              WebkitMaskImage: gridTile,
              WebkitMaskRepeat: 'repeat-x',
              WebkitMaskPosition: 'left bottom',
            })}
          />
        </Box>
      </Box>
      <Box
        sx={t => ({
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: DEV_MODE_GRID.lineHeight,
          backgroundColor: t.colors.$warning500,
          maskImage: lineMask,
          WebkitMaskImage: lineMask,
        })}
      />
    </Box>
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
