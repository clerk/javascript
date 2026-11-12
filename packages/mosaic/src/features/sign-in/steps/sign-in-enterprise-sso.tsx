import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import type { SignInSocialProvider } from '../sign-in.types';

interface SignInEnterpriseSsoProps {
  applicationName: string;
  logo?: { src: string; alt: string };
  connections?: readonly SignInSocialProvider[];
  pendingConnectionId?: string;
  onSelectConnection: (id: string) => void;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInEnterpriseSso({
  applicationName,
  logo,
  connections = [],
  pendingConnectionId,
  onSelectConnection,
  globalErrorMessage,
  isPending,
  onSubmit,
  onCancel,
  focusRef,
}: SignInEnterpriseSsoProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const choosing = connections.length > 1;
  const busy = isPending || Boolean(pendingConnectionId);

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
        <Card.Title>{choosing ? m.enterpriseSso.chooseTitle : fill(m.start.title, { applicationName })}</Card.Title>
        <Card.Description>{choosing ? m.enterpriseSso.chooseDescription : m.start.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        {choosing ? (
          <ProviderButtonGroup
            layout='stacked'
            disabled={Boolean(pendingConnectionId)}
          >
            {connections.map((connection, index) => (
              <ProviderButton
                key={connection.id}
                ref={index === 0 ? ref : undefined}
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
        ) : (
          <SubmitButton
            ref={ref}
            type='button'
            fullWidth
            isPending={isPending}
            pendingLabel={m.enterpriseSso.pending}
            onClick={onSubmit}
          >
            {m.enterpriseSso.continue}
          </SubmitButton>
        )}
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
              disabled={busy}
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
