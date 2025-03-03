import { eventFrameworkMetadata } from '@clerk/shared/telemetry';

import { useClerk } from '../client-boundary/hooks';
import { usePagesRouter } from '../client-boundary/hooks/usePagesRouter';

const RouterTelemetry = () => {
  const clerk = useClerk();
  const { pagesRouter } = usePagesRouter();

  /**
   * Caching and throttling is handled internally it's safe to execute on every navigation.
   */
  clerk.telemetry?.record(
    eventFrameworkMetadata({
      router: pagesRouter ? 'pages' : 'app',
    }),
  );

  return null;
};

export { RouterTelemetry };
