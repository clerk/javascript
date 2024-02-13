import { createConsoleInspector } from '~/react/utils/xstate';

export const consoleInspector = createConsoleInspector();

export function useConsoleInspector() {
  return consoleInspector;
}
