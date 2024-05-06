import { useClerk } from '@clerk/clerk-react';

export const useTelemetry = () => {
  const { telemetry } = useClerk();
  return telemetry;
};
