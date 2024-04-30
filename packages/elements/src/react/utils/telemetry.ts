import { useClerk } from '@clerk/clerk-react';
import type { TelemetryCollector } from '@clerk/shared/telemetry';

export const useTelemetry = () => {
  // @ts-expect-error - The telemetry property is just missing from LoadedClerk :/
  const { telemetry } = useClerk();
  return telemetry as TelemetryCollector | undefined;
};
