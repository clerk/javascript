import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { styles } from '../auth-flow.styles';
import type { AuthFlowProvider } from '../auth-flow.types';

interface EnterpriseConnectionsChoiceProps {
  logo?: { src: string; alt: string };
  connections: readonly AuthFlowProvider[];
  globalErrorMessage?: string;
  pendingConnectionId?: string;
  onSelectConnection: (id: string) => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function EnterpriseConnectionsChoice({
  logo,
  connections,
  globalErrorMessage,
  pendingConnectionId,
  onSelectConnection,
  onCancel,
  focusRef,
}: EnterpriseConnectionsChoiceProps) {
  const m = useMessages('signIn');
  const firstRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const pending = Boolean(pendingConnectionId);

  return (
    <>
      <Card.Header>
        {logo ? (
          <Card.Media>
            <img
              src={logo.src}
              alt={logo.alt}
              {...stylex.props(styles.logo)}
            />
          </Card.Media>
        ) : null}
        <Card.Title>{m.enterpriseConnections.title}</Card.Title>
        <Card.Description>{m.enterpriseConnections.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <ProviderButtonGroup
          layout='stacked'
          disabled={pending}
        >
          {connections.map((connection, index) => (
            <ProviderButton
              key={connection.id}
              ref={index === 0 ? firstRef : undefined}
              icon={
                <img
                  src={connection.iconUrl}
                  alt=''
                  {...stylex.props(styles.providerIcon)}
                />
              }
              longLabel={connection.name}
              shortLabel={connection.name}
              isPending={pendingConnectionId === connection.id}
              pendingLabel={m.enterpriseSso.pending}
              onClick={() => onSelectConnection(connection.id)}
            />
          ))}
        </ProviderButtonGroup>
        {onCancel ? (
          <Text
            size='sm'
            xstyle={styles.footerText}
          >
            <Button
              type='button'
              size='sm'
              variant='link'
              color='neutral'
              disabled={pending}
              onClick={onCancel}
            >
              {m.enterpriseSso.bypass}
            </Button>
          </Text>
        ) : null}
      </Card.Content>
    </>
  );
}
