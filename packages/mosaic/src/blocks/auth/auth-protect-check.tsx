import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';
import { Spinner } from '../../components/spinner';
import { useSpinDelay } from '../../hooks/use-spin-delay';
import { styles } from './auth.styles';

export interface AuthProtectCheckMessages {
  title: string;
  description: string;
  retry: string;
  loading: string;
}

interface AuthProtectCheckProps {
  messages: AuthProtectCheckMessages;
  challenge: boolean;
  logo?: { src: string; alt: string };
  globalErrorMessage?: string;
  isPending: boolean;
  containerRef?: Ref<HTMLDivElement>;
  onRetry?: () => void;
}

export function AuthProtectCheck({
  messages,
  challenge,
  logo,
  globalErrorMessage,
  isPending,
  containerRef,
  onRetry,
}: AuthProtectCheckProps) {
  const retryRef = useFlowAutoFocus<HTMLButtonElement>();
  const spinning = useSpinDelay(isPending ? true : null, { delay: 300 });

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
      <Card.Content xstyle={styles.protectCheck}>
        <div
          ref={containerRef}
          id='clerk-protect-check'
          aria-busy={isPending}
          {...stylex.props(styles.protectCheckContainer, !challenge && styles.protectCheckContainerEmpty)}
        />
        {spinning && !globalErrorMessage && !challenge ? <Spinner label={messages.loading} /> : null}
        {globalErrorMessage && onRetry ? (
          <Button
            ref={retryRef}
            type='button'
            fullWidth
            onClick={onRetry}
          >
            {messages.retry}
          </Button>
        ) : null}
      </Card.Content>
    </>
  );
}
