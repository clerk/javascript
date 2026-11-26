import { AuthMark, useAuthMark } from '@clerk/mosaic/blocks/auth';
import { Button, SubmitButton } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { useState } from 'react';

import { APPLICATION_LOGO_URL } from './auth-config';

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function PasskeyPromptHarness({ onComplete }: { onComplete: () => void }) {
  const mark = useAuthMark(APPLICATION_LOGO_URL);
  const [isPending, setIsPending] = useState(false);

  const create = async () => {
    setIsPending(true);
    await settleAfter(1_200);
    onComplete();
  };

  return (
    <Card.Root
      variant='prominent'
      align='center'
    >
      {mark.logoUrl ? (
        <AuthMark
          key={mark.logoUrl}
          logoUrl={mark.logoUrl}
          shape={mark.shape}
          onShape={mark.onShape}
          onError={mark.onError}
        />
      ) : null}
      <Card.Header>
        <Card.Title>Sign in faster next time</Card.Title>
        <Card.Description>
          Create a passkey to sign in with your fingerprint, face or screen lock. No password or code needed.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className='grid gap-2'>
          <SubmitButton
            type='button'
            fullWidth
            isPending={isPending}
            pendingLabel='Waiting for your passkey'
            onClick={() => void create()}
          >
            Create a passkey
          </SubmitButton>
          <Button
            type='button'
            variant='ghost'
            color='neutral'
            fullWidth
            disabled={isPending}
            onClick={onComplete}
          >
            Not now
          </Button>
        </div>
      </Card.Content>
    </Card.Root>
  );
}
