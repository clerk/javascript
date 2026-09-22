'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Flow, type FlowDirection } from '@clerk/mosaic/components/flow';
import { Reverification, useReverificationWithState } from '@clerk/mosaic/features/reverification';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import { isClerkRuntimeError, isReverificationCancelledError } from '@clerk/shared/error';
import Link from 'next/link';
import { useRef, useState } from 'react';

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
  const [status, setStatus] = useState<'idle' | 'success' | 'cancelled' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [requestPending, setRequestPending] = useState(false);
  const [deleteAccount, reverification] = useReverificationWithState(() => mockDelete(false));
  const busy = requestPending || reverification.phase !== 'inactive';

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          disabled={busy}
          onClick={() => {
            if (busy) {
              return;
            }
            setRequestPending(true);
            setStatus('idle');
            setMessage(null);
            void (async () => {
              try {
                await resetMockDelete();
                await deleteAccount();
                setStatus('success');
                setMessage('Mock delete completed. The account was not deleted.');
              } catch (error) {
                if (isClerkRuntimeError(error) && error.code === 'request_already_in_progress') {
                  return;
                }
                await resetMockDelete();
                if (isReverificationCancelledError(error)) {
                  setStatus('cancelled');
                  setMessage('Reverification cancelled.');
                  return;
                }
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Mock delete failed.');
              } finally {
                setRequestPending(false);
              }
            })();
          }}
        >
          Delete account
        </Button>
      </div>
      <Card.Root renderBranding={false}>
        <Reverification {...reverification} />
      </Card.Root>
      {message ? <p className={status === 'error' ? 'text-sm text-red-600' : 'text-sm'}>{message}</p> : null}
    </div>
  );
}

type Presentation = 'retain' | 'replace';
type OuterStep = 'confirm' | 'verify' | 'finalizing';

function DialogHarness() {
  const [deleteAccount, reverification] = useReverificationWithState(() => mockDelete(true));
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState<Presentation>('retain');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requestPending, setRequestPending] = useState(false);
  const [direction, setDirection] = useState<FlowDirection>(1);
  const [step, setStep] = useState<OuterStep>('confirm');
  const runRef = useRef(false);

  const nextStep: OuterStep | null =
    reverification.phase === 'retrying' && presentation === 'replace'
      ? 'finalizing'
      : reverification.phase === 'active' || reverification.phase === 'retrying'
        ? 'verify'
        : null;

  if (nextStep && nextStep !== step) {
    setStep(nextStep);
    setDirection(1);
  }

  const continueDelete = () => {
    if (runRef.current || reverification.phase !== 'inactive') {
      return;
    }
    runRef.current = true;
    setRequestPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    void (async () => {
      try {
        await resetMockDelete();
        await deleteAccount();
        setSuccessMessage('Mock delete completed. The account was not deleted.');
        setOpen(false);
      } catch (error) {
        if (isClerkRuntimeError(error) && error.code === 'request_already_in_progress') {
          return;
        }
        await resetMockDelete();
        if (isReverificationCancelledError(error)) {
          setErrorMessage(null);
          setOpen(false);
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Mock delete failed.');
        setStep('confirm');
        setDirection(-1);
        setOpen(true);
      } finally {
        runRef.current = false;
        setRequestPending(false);
      }
    })();
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          onClick={() => {
            setErrorMessage(null);
            setSuccessMessage(null);
            setStep('confirm');
            setDirection(1);
            setOpen(true);
          }}
          disabled={open || requestPending}
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
          if (requestPending && reverification.phase === 'inactive') {
            return;
          }
          if (reverification.phase === 'active') {
            reverification.cancel();
          }
          setOpen(false);
          if (reverification.phase !== 'retrying') {
            setErrorMessage(null);
            void resetMockDelete();
          }
        }}
      >
        <Dialog.Popup>
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          >
            <Flow.Root
              value={step}
              direction={direction}
              state={{ step }}
            >
              {() => (
                <>
                  <Flow.Step ids={['confirm']}>
                    <Card.Header>
                      <Card.Title>Delete account?</Card.Title>
                      <Card.Description>
                        This mock asks for verification, then waits before a fake success. The account is not deleted.
                      </Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <fieldset className='flex flex-col gap-2 text-sm'>
                        <legend className='mb-1 font-medium'>While the mock delete finishes</legend>
                        <label className='flex items-center gap-2'>
                          <input
                            type='radio'
                            name='reverification-presentation'
                            checked={presentation === 'retain'}
                            onChange={() => setPresentation('retain')}
                            disabled={requestPending}
                          />
                          Keep the verification step
                        </label>
                        <label className='flex items-center gap-2'>
                          <input
                            type='radio'
                            name='reverification-presentation'
                            checked={presentation === 'replace'}
                            onChange={() => setPresentation('replace')}
                            disabled={requestPending}
                          />
                          Show a finalizing step
                        </label>
                      </fieldset>
                      {errorMessage ? <p className='mt-3 text-sm text-red-600'>{errorMessage}</p> : null}
                    </Card.Content>
                    <Card.Footer>
                      <Button
                        color='negative'
                        fullWidth
                        onClick={continueDelete}
                        disabled={requestPending}
                      >
                        Continue
                      </Button>
                    </Card.Footer>
                  </Flow.Step>
                  <Flow.Step ids={['verify']}>
                    <Reverification {...reverification} />
                  </Flow.Step>
                  <Flow.Step ids={['finalizing']}>
                    <Card.Header>
                      <Card.Title>Finalizing</Card.Title>
                      <Card.Description>Completing the mock delete. The account is not deleted.</Card.Description>
                    </Card.Header>
                  </Flow.Step>
                </>
              )}
            </Flow.Root>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
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
              Reverification renders inside the dialog&apos;s card. This dialog showcases two different pending states:
              the action retry can either be merged with the reverification pending state, or be its own flow step
              after.
            </p>
          </div>
          {isLoaded && isSignedIn ? <DialogHarness key={demoKey} /> : null}
        </section>
      </div>
    </MosaicProvider>
  );
}
