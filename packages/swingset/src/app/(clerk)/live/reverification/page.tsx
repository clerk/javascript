'use client';

import { Destructive } from '@clerk/mosaic/blocks/destructive';
import { useDestructiveController } from '@clerk/mosaic/blocks/destructive/destructive.controller';
import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Flow } from '@clerk/mosaic/components/flow';
import { useReverify } from '@clerk/mosaic/features/reverification';
import { useAction } from '@clerk/mosaic/hooks/useAction';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

const SUCCESS_DELAY_MS = 3000;

async function mockDelete(delaySuccess: boolean) {
  const response = await fetch('/api/live/mock-delete', { method: 'POST' });
  const body = await response.json().catch(() => ({}));

  if (body?.clerk_error?.reason === 'reverification-error') {
    return body;
  }
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : `Mock delete failed (${response.status})`);
  }
  if (delaySuccess) {
    await new Promise(resolve => {
      setTimeout(resolve, SUCCESS_DELAY_MS);
    });
  }
  return body;
}

async function resetMockDelete() {
  await fetch('/api/live/mock-delete', { method: 'DELETE' });
}

function CardHarness() {
  const [outcome, setOutcome] = useState<{ status: 'success' | 'cancelled' | 'error'; message: string } | null>(null);
  const { reverify, prompt } = useReverify();
  const deleteAccount = useAction(async ctx => {
    await resetMockDelete();
    return reverify(ctx, () => mockDelete(false));
  });
  const busy = deleteAccount.state.status === 'running';

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          disabled={busy}
          onClick={() => {
            setOutcome(null);
            void deleteAccount.run().then(async result => {
              if (result.status !== 'done') {
                await resetMockDelete();
              }
              if (result.status === 'done') {
                setOutcome({ status: 'success', message: 'Mock delete completed. The account was not deleted.' });
              } else if (result.status === 'cancelled') {
                setOutcome({ status: 'cancelled', message: 'Reverification cancelled.' });
              } else {
                setOutcome({
                  status: 'error',
                  message: result.error instanceof Error ? result.error.message : 'Mock delete failed.',
                });
              }
            });
          }}
        >
          Delete account
        </Button>
      </div>
      {prompt ? <Card.Root renderBranding={false}>{prompt.content}</Card.Root> : null}
      {outcome ? (
        <p className={outcome.status === 'error' ? 'text-sm text-red-600' : 'text-sm'}>{outcome.message}</p>
      ) : null}
    </div>
  );
}

function DialogHarness() {
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { reverify, prompt } = useReverify();
  const deleteAccount = useAction(async ctx => {
    ctx.onSettled(result => {
      if (result.status === 'done') {
        setSuccessMessage('Mock delete completed. The account was not deleted.');
      }
      if (result.status !== 'failed') {
        setOpen(false);
      }
    });
    setSuccessMessage(null);
    await resetMockDelete();
    try {
      return await reverify(ctx, () => mockDelete(true));
    } catch (error) {
      await resetMockDelete();
      throw error;
    }
  });
  const { state } = deleteAccount;
  const running = state.status === 'running';

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          onClick={() => {
            setSuccessMessage(null);
            setOpen(true);
          }}
          disabled={open || running}
        >
          Delete account
        </Button>
      </div>
      {successMessage ? <p className='text-sm'>{successMessage}</p> : null}
      <Dialog.Root
        open={open}
        onOpenChange={next => {
          if (next) {
            return;
          }
          if (running) {
            prompt?.cancel?.();
            return;
          }
          deleteAccount.reset();
          setOpen(false);
        }}
      >
        <Dialog.Popup>
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          >
            <Flow.Root
              value={prompt ? 'verify' : 'confirm'}
              direction={prompt ? 1 : -1}
              state={prompt}
            >
              {current => (
                <>
                  <Flow.Step ids={['confirm']}>
                    <Card.Header>
                      <Card.Title>Delete account?</Card.Title>
                      <Card.Description>
                        This mock asks for verification, then waits before a fake success. The account is not deleted.
                      </Card.Description>
                    </Card.Header>
                    <Card.Content>
                      {state.status === 'failed' ? (
                        <p className='text-sm text-red-600'>
                          {state.error instanceof Error ? state.error.message : 'Mock delete failed.'}
                        </p>
                      ) : null}
                    </Card.Content>
                    <Card.Footer>
                      <Button
                        color='negative'
                        fullWidth
                        onClick={() => void deleteAccount.run()}
                        disabled={running}
                      >
                        Continue
                      </Button>
                    </Card.Footer>
                  </Flow.Step>
                  <Flow.Step ids={['verify']}>{current?.content}</Flow.Step>
                </>
              )}
            </Flow.Root>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
}

function DestructiveHarness() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { reverify, prompt } = useReverify();
  const destructive = useDestructiveController(async ctx => {
    setSuccessMessage(null);
    await resetMockDelete();
    try {
      await reverify(ctx, () => mockDelete(true));
      setSuccessMessage('Mock delete completed. The account was not deleted.');
    } catch (error) {
      await resetMockDelete();
      throw error;
    }
  }, prompt);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          onClick={() => {
            setSuccessMessage(null);
            destructive.openDestructiveDialog();
          }}
          disabled={destructive.open}
        >
          Delete account
        </Button>
      </div>
      {successMessage ? <p className='text-sm'>{successMessage}</p> : null}
      <Destructive
        {...destructive}
        title='Delete account?'
        description='This mock asks for verification, then waits before a fake success. The account is not deleted.'
        fieldLabel='Type “Delete account” below to continue'
        confirmationValue='Delete account'
        actionLabel='Delete account'
      />
    </div>
  );
}

export default function ReverificationLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const [demoKey, setDemoKey] = useState(0);

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-10 p-3 sm:p-8'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-xl font-semibold'>Reverification</h1>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <p className='text-muted-foreground max-w-xl text-sm'>
              Delete account hits a mock route that returns a reverification hint, then a fake success. The account is
              not deleted. Reset clears the mock state.
            </p>
            <Button
              variant='outline'
              onClick={() => {
                void resetMockDelete();
                setDemoKey(key => key + 1);
              }}
            >
              Reset
            </Button>
          </div>
          {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
          {isLoaded && !isSignedIn ? (
            <p className='text-muted-foreground text-sm'>
              <Link
                href='/sign-in'
                className='text-foreground underline underline-offset-4'
              >
                Sign in
              </Link>{' '}
              to use the live harness.
            </p>
          ) : null}
        </div>
        <section className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-base font-semibold'>Card</h2>
            <p className='text-muted-foreground text-sm'>
              The default is to render Reverification inside its own card.
            </p>
          </div>
          {isLoaded && isSignedIn ? <CardHarness key={demoKey} /> : null}
        </section>
        <section className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-base font-semibold'>Dialog / Flow</h2>
            <p className='text-muted-foreground text-sm'>
              Reverification renders inside the dialog&apos;s card and stays there while the action retries.
            </p>
          </div>
          {isLoaded && isSignedIn ? <DialogHarness key={demoKey} /> : null}
        </section>
        <section className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-base font-semibold'>Destructive</h2>
            <p className='text-muted-foreground text-sm'>
              Destructive keeps its dialog and card while Reverification replaces the confirmation step.
            </p>
          </div>
          {isLoaded && isSignedIn ? <DestructiveHarness key={demoKey} /> : null}
        </section>
      </div>
    </MosaicProvider>
  );
}
