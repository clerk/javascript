import { getInspector as getBrowserInspector } from './browser';
import { getInspector as getConsoleInspector } from './console';

export const inspect = getBrowserInspector() ?? getConsoleInspector() ?? undefined;

const inspector = {
  inspect,
};

export default inspector;
