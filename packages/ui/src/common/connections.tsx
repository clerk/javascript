import * as Common from '@clerk/elements/common';

import { PROVIDERS } from '~/constants/providers';
import { useAppearance } from '~/hooks/use-appearance';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import * as Connection from '~/primitives/connection';
import * as Icon from '~/primitives/icon';

export function Connections(props: { disabled?: boolean }) {
  const enabledConnections = useEnabledConnections();
  const { layout } = useAppearance();
  const hasConnection = enabledConnections.length > 0;
  const textVisuallyHidden = enabledConnections.length > 2 || layout?.socialButtonsVariant === 'iconButton';

  return hasConnection ? (
    <Connection.Root>
      {enabledConnections.map(c => {
        const connection = PROVIDERS.find(provider => provider.id === c.provider);
        const iconKey = connection?.icon;
        const IconComponent = iconKey ? Icon[iconKey] : null;
        return (
          <Common.Loading
            key={c.provider}
            scope={`provider:${c.provider}`}
          >
            {isConnectionLoading => {
              return (
                <Common.Connection
                  name={c.provider}
                  asChild
                >
                  <Connection.Button
                    busy={isConnectionLoading}
                    disabled={props?.disabled || isConnectionLoading}
                    icon={IconComponent ? <IconComponent className='text-base' /> : null}
                    textVisuallyHidden={textVisuallyHidden}
                  >
                    {connection?.name || c.provider}
                  </Connection.Button>
                </Common.Connection>
              );
            }}
          </Common.Loading>
        );
      })}
    </Connection.Root>
  ) : null;
}
