import type { LabTool, ToolSettings } from './canvas';
import { CELL_TRAIL_DEFAULTS, CellTrail } from './cell-trail';
import { PIXEL_LOADER_DEFAULTS, PixelLoader } from './pixel-loader';
export type ToolDefinition = {
  defaults: ToolSettings;
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
  'pixel-loader': {
    defaults: { ...PIXEL_LOADER_DEFAULTS },
    create: make(PixelLoader as never),
  },
  'cell-trail': {
    defaults: { ...CELL_TRAIL_DEFAULTS },
    create: make(CellTrail as never),
  },
};
