import type { SessionResource } from '@clerk/types';
import { useEffect } from 'react';

import { eventBus, events } from '../../core/events';
import { buildRedirectUrl } from '../common';
import { useRouter } from '../router';

type UseNavigateOnEventOptions = Pick<Parameters<typeof buildRedirectUrl>[0], 'routing' | 'baseUrl' | 'path'>;

/**
 * Custom hook to trigger internal component navigation by a event.
 */
export const useNavigateOnEvent = ({ routing, baseUrl, path }: UseNavigateOnEventOptions) => {
  const { navigate } = useRouter();

  useEffect(() => {
    const handleNavigation = ({
      resolveNavigation,
      session,
    }: {
      resolveNavigation: () => void;
      session: SessionResource;
    }) => {
      if (!session.currentTask) {
        return;
      }

      void navigate(
        buildRedirectUrl({
          routing,
          baseUrl,
          path,
          endpoint: session.currentTask.__internal_getUrlPath(),
          authQueryString: null,
        }),
      ).then(resolveNavigation);
    };

    eventBus.on(events.InternalComponentNavigate, handleNavigation);

    return () => {
      eventBus.off(events.InternalComponentNavigate, handleNavigation);
    };
  }, []);
};
