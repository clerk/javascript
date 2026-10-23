import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import { useEffect } from 'react';

export type ComponentMountedTelemetry = Record<string, boolean | number | string>;

export function useComponentMountedTelemetry(component: string, configuration: ComponentMountedTelemetry): void {
  const { telemetry } = useClerk();

  useEffect(() => {
    telemetry?.record({
      ...eventComponentMounted(component, { source: 'mosaic', ...configuration }),
      eventSamplingRate: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- A mount is recorded once per collector; a later prop change is not a new mount.
  }, [telemetry]);
}
