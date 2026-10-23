import { vi } from 'vitest';

export const debugTelemetry = { telemetry: { debug: true } };

export function captureTelemetry() {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

  return {
    mounts: (component: string) =>
      log.mock.calls
        .map(([entry]: unknown[]) => entry)
        .filter(isComponentMounted)
        .map(entry => entry.payload)
        .filter(payload => payload.component === component),
  };
}

interface ComponentMountedEntry {
  event: 'COMPONENT_MOUNTED';
  payload: Record<string, unknown>;
}

function isComponentMounted(entry: unknown): entry is ComponentMountedEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'event' in entry &&
    entry.event === 'COMPONENT_MOUNTED' &&
    'payload' in entry &&
    typeof entry.payload === 'object' &&
    entry.payload !== null
  );
}
