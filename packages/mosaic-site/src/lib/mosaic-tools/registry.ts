import type { LabTool, ToolSettings } from './canvas';
import { CELL_TRAIL_DEFAULTS, CellTrail } from './cell-trail';
import { DRIFT_SQUARES_DEFAULTS, DriftSquares } from './drift-squares';
import { GRID_RIPPLE_DEFAULTS, GridRipple } from './grid-ripple';
import { LOGO_SHUFFLE_DEFAULTS, LogoShuffle } from './logo-shuffle';
import { MOSAIC_CUBE_DEFAULTS, MosaicCube } from './mosaic-cube';
import { MOSAIC_SHADER_DEFAULTS, MosaicShader } from './mosaic-shader';
import { PIXEL_LOADER_DEFAULTS, PixelLoader } from './pixel-loader';
import { PIXEL_RESOLVE_DEFAULTS, PixelResolve } from './pixel-resolve';
export type Control =
  | {
      type: 'slider';
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
    }
  | {
      type: 'chips';
      key: string;
      label: string;
      options: {
        value: string;
        label: string;
      }[];
    }
  | {
      type: 'toggle';
      key: string;
      label: string;
    }
  | {
      type: 'text';
      key: string;
      label: string;
    };
export type ToolDefinition = {
  defaults: ToolSettings;
  preview?: Partial<ToolSettings>;
  controls: Control[];
  create: (container: HTMLElement, settings: ToolSettings) => LabTool<ToolSettings>;
};
function make<S extends ToolSettings>(
  Tool: new (
    container: HTMLElement,
    settings: S,
  ) => LabTool<S> & {
    start(): void;
  },
) {
  return (container: HTMLElement, settings: ToolSettings) => {
    const tool = new Tool(container, settings as S);
    tool.start();
    return tool as unknown as LabTool<ToolSettings>;
  };
}
export const TOOLS: Record<string, ToolDefinition> = {
  'pixel-resolve': {
    defaults: { ...PIXEL_RESOLVE_DEFAULTS },
    preview: { trigger: 'loop', text: 'Mosaic', fontSize: 90, tileSize: 6 },
    controls: [
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      {
        type: 'chips',
        key: 'shape',
        label: 'Assembles into',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'logo', label: 'Logo' },
        ],
      },
      { type: 'text', key: 'text', label: 'Text' },
      {
        type: 'chips',
        key: 'trigger',
        label: 'Trigger',
        options: [
          { value: 'lens', label: 'Lens' },
          { value: 'hover', label: 'Hover' },
          { value: 'loop', label: 'Loop' },
          { value: 'static', label: 'Static' },
        ],
      },
      { type: 'slider', key: 'fontSize', label: 'Font size', min: 40, max: 260, step: 2 },
      { type: 'slider', key: 'tileSize', label: 'Tile size', min: 4, max: 40, step: 1 },
      { type: 'slider', key: 'grout', label: 'Grout', min: 0, max: 4, step: 0.5 },
      { type: 'slider', key: 'lensRadius', label: 'Lens radius', min: 60, max: 360, step: 5 },
      { type: 'slider', key: 'speed', label: 'Speed', min: 0.3, max: 3, step: 0.05 },
      {
        type: 'chips',
        key: 'color',
        label: 'Colour',
        options: [
          { value: 'white', label: 'White' },
          { value: 'violet', label: 'Violet' },
          { value: 'gradient', label: 'Gradient' },
        ],
      },
    ],
    create: make(PixelResolve as never),
  },
  'pixel-loader': {
    defaults: { ...PIXEL_LOADER_DEFAULTS },
    preview: { cellSize: 8, grid: 4 },
    controls: [
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      { type: 'slider', key: 'grid', label: 'Grid size', min: 2, max: 8, step: 1 },
      { type: 'slider', key: 'cellSize', label: 'Tile size', min: 4, max: 24, step: 1 },
      { type: 'slider', key: 'gap', label: 'Gap', min: 0, max: 6, step: 0.5 },
      { type: 'slider', key: 'contrast', label: 'Contrast', min: 0.1, max: 1, step: 0.05 },
      { type: 'slider', key: 'speed', label: 'Speed', min: 0.3, max: 3, step: 0.05 },
    ],
    create: make(PixelLoader as never),
  },
  'logo-shuffle': {
    defaults: { ...LOGO_SHUFFLE_DEFAULTS },
    preview: { size: 0.34 },
    controls: [
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      {
        type: 'chips',
        key: 'trigger',
        label: 'Shuffles on',
        options: [
          { value: 'loop', label: 'Loop' },
          { value: 'hover', label: 'Hover' },
          { value: 'click', label: 'Click' },
          { value: 'static', label: 'Never' },
        ],
      },
      {
        type: 'chips',
        key: 'color',
        label: 'Colour',
        options: [
          { value: 'white', label: 'Ink' },
          { value: 'violet', label: 'Violet' },
        ],
      },
      { type: 'slider', key: 'moves', label: 'Shuffle moves', min: 1, max: 8, step: 1 },
      { type: 'slider', key: 'speed', label: 'Speed', min: 0.4, max: 3, step: 0.05 },
      { type: 'slider', key: 'size', label: 'Size', min: 0.2, max: 0.9, step: 0.02 },
    ],
    create: make(LogoShuffle as never),
  },
  'mosaic-cube': {
    defaults: { ...MOSAIC_CUBE_DEFAULTS },
    preview: { moves: 10 },
    controls: [
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      {
        type: 'chips',
        key: 'trigger',
        label: 'Twists',
        options: [
          { value: 'loop', label: 'Loop' },
          { value: 'click', label: 'On click' },
          { value: 'static', label: 'Solved' },
        ],
      },
      { type: 'slider', key: 'moves', label: 'Scramble moves', min: 4, max: 30, step: 1 },
      { type: 'slider', key: 'speed', label: 'Speed', min: 0.4, max: 3, step: 0.05 },
    ],
    create: make(MosaicCube as never),
  },
  'drifting-squares': {
    defaults: { ...DRIFT_SQUARES_DEFAULTS },
    preview: { settle: 'never', text: 'Rearrange', count: 16 },
    controls: [
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      { type: 'text', key: 'text', label: 'Headline' },
      {
        type: 'chips',
        key: 'settle',
        label: 'Snap into mosaic',
        options: [
          { value: 'hover', label: 'On hover' },
          { value: 'loop', label: 'Loop' },
          { value: 'never', label: 'Never' },
        ],
      },
      { type: 'slider', key: 'count', label: 'Squares', min: 6, max: 70, step: 1 },
      { type: 'slider', key: 'minSize', label: 'Min size', min: 12, max: 100, step: 1 },
      { type: 'slider', key: 'maxSize', label: 'Max size', min: 40, max: 200, step: 1 },
      { type: 'slider', key: 'speed', label: 'Speed', min: 0.2, max: 3, step: 0.05 },
      { type: 'slider', key: 'dash', label: 'Dash', min: 2, max: 12, step: 1 },
      { type: 'slider', key: 'repel', label: 'Cursor push', min: 0, max: 300, step: 5 },
      { type: 'toggle', key: 'fill', label: 'Fill when settled' },
      { type: 'toggle', key: 'accent', label: 'Violet accents' },
    ],
    create: make(DriftSquares as never),
  },
  'cell-trail': {
    defaults: { ...CELL_TRAIL_DEFAULTS },
    preview: { cellSize: 64, autoplay: true },
    controls: [
      {
        type: 'chips',
        key: 'fillMode',
        label: 'Fill',
        options: [
          { value: 'tones', label: 'Tones' },
          { value: 'solid', label: 'Solid' },
          { value: 'violet', label: 'Violet' },
        ],
      },
      { type: 'slider', key: 'cellSize', label: 'Cell size', min: 20, max: 140, step: 2 },
      { type: 'slider', key: 'gap', label: 'Gap', min: 0, max: 12, step: 0.5 },
      { type: 'slider', key: 'trail', label: 'Trail (s)', min: 0.2, max: 4, step: 0.1 },
      { type: 'slider', key: 'spread', label: 'Spread', min: 0, max: 3.5, step: 0.1 },
      { type: 'slider', key: 'intensity', label: 'Intensity', min: 0.02, max: 1, step: 0.01 },
      { type: 'slider', key: 'gridAlpha', label: 'Grid opacity', min: 0, max: 0.4, step: 0.01 },
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      { type: 'toggle', key: 'pop', label: 'Pop in' },
      { type: 'toggle', key: 'dashedGrid', label: 'Dashed grid' },
      { type: 'toggle', key: 'autoplay', label: 'Autoplay' },
    ],
    create: make(CellTrail as never),
  },
  'grid-ripple': {
    defaults: { ...GRID_RIPPLE_DEFAULTS },
    preview: { cellSize: 40, autoplay: true },
    controls: [
      {
        type: 'chips',
        key: 'emit',
        label: 'Ripples start on',
        options: [
          { value: 'both', label: 'Move + click' },
          { value: 'move', label: 'Move' },
          { value: 'click', label: 'Click' },
        ],
      },
      { type: 'slider', key: 'speed', label: 'Wave speed', min: 2, max: 24, step: 0.5 },
      { type: 'slider', key: 'width', label: 'Ring width', min: 0.4, max: 5, step: 0.1 },
      { type: 'slider', key: 'decay', label: 'Fade', min: 0.2, max: 3, step: 0.05 },
      { type: 'slider', key: 'cellSize', label: 'Cell size', min: 20, max: 140, step: 2 },
      { type: 'slider', key: 'gap', label: 'Gap', min: 0, max: 12, step: 0.5 },
      { type: 'slider', key: 'intensity', label: 'Intensity', min: 0.05, max: 1, step: 0.01 },
      { type: 'slider', key: 'gridAlpha', label: 'Grid opacity', min: 0, max: 0.4, step: 0.01 },
      {
        type: 'chips',
        key: 'fillMode',
        label: 'Fill',
        options: [
          { value: 'tones', label: 'Tones' },
          { value: 'solid', label: 'Solid' },
          { value: 'violet', label: 'Violet' },
        ],
      },
      {
        type: 'chips',
        key: 'theme',
        label: 'Page',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      { type: 'toggle', key: 'pop', label: 'Cells swell' },
      { type: 'toggle', key: 'autoplay', label: 'Autoplay' },
    ],
    create: make(GridRipple as never),
  },
  'mosaic-shader': {
    defaults: { ...MOSAIC_SHADER_DEFAULTS },
    preview: { tiles: 24, material: 'metal', autoplay: true },
    controls: [
      {
        type: 'chips',
        key: 'material',
        label: 'Material',
        options: [
          { value: 'stone', label: 'Stone' },
          { value: 'ceramic', label: 'Ceramic' },
          { value: 'metal', label: 'Metal' },
          { value: 'glass', label: 'Glass' },
          { value: 'gold', label: 'Gold' },
        ],
      },
      {
        type: 'chips',
        key: 'tint',
        label: 'Tint',
        options: [
          { value: 'natural', label: 'Natural' },
          { value: 'violet', label: 'Violet' },
          { value: 'graphite', label: 'Graphite' },
          { value: 'white', label: 'White' },
        ],
      },
      {
        type: 'chips',
        key: 'shape',
        label: 'Icon',
        options: [
          { value: 'clerk', label: 'Clerk' },
          { value: 'mark', label: 'Mosaic mark' },
        ],
      },
      {
        type: 'chips',
        key: 'theme',
        label: 'Mode',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
      },
      { type: 'slider', key: 'tiles', label: 'Tiles across', min: 10, max: 70, step: 1 },
      { type: 'slider', key: 'grout', label: 'Grout', min: 0.02, max: 0.4, step: 0.01 },
      { type: 'slider', key: 'round', label: 'Corner radius', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'bevel', label: 'Bevel', min: 0.05, max: 1, step: 0.02 },
      { type: 'slider', key: 'jitter', label: 'Hand-laid', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'variation', label: 'Tone variation', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'bump', label: 'Texture', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'facet', label: 'Facets', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'roughness', label: 'Roughness', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'light', label: 'Light', min: 0.2, max: 2, step: 0.05 },
      { type: 'slider', key: 'lift', label: 'Hover lift', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'halo', label: 'Scattered tiles', min: 0, max: 1, step: 0.02 },
      { type: 'slider', key: 'size', label: 'Size', min: 0.4, max: 1, step: 0.01 },
      { type: 'toggle', key: 'autoplay', label: 'Wandering light' },
    ],
    create: (container, settings) => new MosaicShader(container, settings as never) as never,
  },
};
