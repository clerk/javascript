import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { ProviderButton, ProviderButtonGroup } from '../../components/provider-button';
import { Text } from '../../components/text';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import { styles } from './auth.styles';
import type { AuthProvider } from './auth.types';

export interface AuthEnterpriseConnectionsMessages {
  title: string;
  description: string;
  pendingLabel: string;
  secondaryActionLabel?: string;
}

interface AuthEnterpriseConnectionsProps {
  messages: AuthEnterpriseConnectionsMessages;
  logo?: { src: string; alt: string };
  connections: readonly AuthProvider[];
  globalErrorMessage?: string;
  pendingConnectionId?: string;
  onSelectConnection: (id: string) => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function AuthEnterpriseConnections({
  messages,
  logo,
  connections,
  globalErrorMessage,
  pendingConnectionId,
  onSelectConnection,
  onCancel,
  focusRef,
}: AuthEnterpriseConnectionsProps) {
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
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
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
              pendingLabel={messages.pendingLabel}
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
              size='md'
              variant='link'
              color='neutral'
              disabled={pending}
              onClick={onCancel}
            >
              {messages.secondaryActionLabel}
            </Button>
          </Text>
        ) : null}
      </Card.Content>
    </>
  );
}
