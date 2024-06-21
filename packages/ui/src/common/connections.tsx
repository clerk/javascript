import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import type { EnvironmentResource } from '@clerk/types';

import { PROVIDERS } from '~/constants';
import * as Connection from '~/primitives/connection';
import * as Icon from '~/primitives/icon';
import { getEnabledSocialConnectionsFromEnvironment } from '~/utils/getEnabledSocialConnectionsFromEnvironment';

export function Connections(props: { disabled?: boolean }) {
  const clerk = useClerk();
  const enabledConnections = getEnabledSocialConnectionsFromEnvironment(
    (clerk as any)?.__unstable__environment as EnvironmentResource,
  );
  const hasConnection = enabledConnections.length > 0;

  return hasConnection ? (
    <Connection.Root>
      {enabledConnections.map(c => {
        const connection = PROVIDERS.find(provider => provider.id === c.provider);
        const iconKey = connection?.icon;
        const IconComponent = iconKey ? Icon[iconKey] : null;
        return (
          <Common.Connection
            key={c.provider}
            name={c.provider}
            asChild
          >
            <Common.Loading scope={`provider:${c.provider}`}>
              {isConnectionLoading => {
                return (
                  <Connection.Button
                    busy={isConnectionLoading}
                    disabled={props?.disabled || isConnectionLoading}
                    icon={IconComponent ? <IconComponent className='text-base' /> : null}
                    textVisuallyHidden={enabledConnections.length > 2}
                  >
                    {connection?.name || c.provider}
                  </Connection.Button>
                );
              }}
            </Common.Loading>
          </Common.Connection>
        );
      })}
    </Connection.Root>
  ) : null;
}
