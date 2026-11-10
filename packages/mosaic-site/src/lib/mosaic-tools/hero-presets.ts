import { CELL_TRAIL_DEFAULTS, type CellTrailSettings } from './cell-trail';
export const LIGHT_HERO_CELL_TRAIL: CellTrailSettings = {
  ...CELL_TRAIL_DEFAULTS,
  theme: 'light',
  cellSize: 64,
  gap: 0,
  trail: 1.1,
  spread: 0.9,
  fillMode: 'solid',
  pop: false,
  dashedGrid: false,
  autoplay: false,
  intensity: 0.07,
  gridAlpha: 0.07,
};
