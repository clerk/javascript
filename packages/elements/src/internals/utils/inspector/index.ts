import type { InspectionEvent, Observer } from 'xstate';

import { getInspector as getBrowserInspector } from './browser';
import { getInspector as getConsoleInspector } from './console';

export let inspect: Observer<InspectionEvent> | undefined;

if (__DEV__) {
  inspect = getBrowserInspector() ?? getConsoleInspector();
}

const inspector = {
  inspect,
};

export default inspector;
