import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Spinner } from '../../../components/spinner';
import { useSpinDelay } from '../../../hooks/use-spin-delay';
import { useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';

interface SignInProtectCheckProps {
  challenge: boolean;
  logo?: { src: string; alt: string };
  globalErrorMessage?: string;
  isPending: boolean;
  containerRef?: Ref<HTMLDivElement>;
  onRetry?: () => void;
}

export function SignInProtectCheck({
  challenge,
  logo,
  globalErrorMessage,
  isPending,
  containerRef,
  onRetry,
}: SignInProtectCheckProps) {
  const m = useMessages('signIn');
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
        <Card.Title>{m.protectCheck.title}</Card.Title>
        <Card.Description>{m.protectCheck.description}</Card.Description>
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
        {spinning && !globalErrorMessage && !challenge ? <Spinner label={m.loading} /> : null}
        {globalErrorMessage && onRetry ? (
          <Button
            ref={retryRef}
            type='button'
            fullWidth
            onClick={onRetry}
          >
            {m.protectCheck.retry}
          </Button>
        ) : null}
      </Card.Content>
    </>
  );
}
