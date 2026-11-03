import { FormSubmitError, useForm } from '@clerk/mosaic/components/form';
import type { WaitlistStep, WaitlistValues } from '@clerk/mosaic/features/waitlist/waitlist.types';
import { WaitlistView } from '@clerk/mosaic/features/waitlist/waitlist.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './waitlist.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'Waitlist',
  status: 'stable',
  source: 'packages/mosaic/src/features/waitlist/waitlist.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function joinWaitlist({ emailAddress }: WaitlistValues) {
  await settleAfter(800);
  if (!emailAddress.includes('@')) {
    throw new FormSubmitError<WaitlistValues>({
      fields: { emailAddress: 'Email address must be a valid email address.' },
    });
  }
  if (emailAddress.startsWith('closed@')) {
    throw new FormSubmitError<WaitlistValues>({ message: 'The waitlist is not accepting new entries.' });
  }
}

function useWaitlistPrototype(initialStep: WaitlistStep = 'form') {
  const [step, setStep] = useState<WaitlistStep>(initialStep);
  const form = useForm<WaitlistValues>({
    initialValues: { emailAddress: '' },
    canSubmit: values => values.emailAddress.trim() !== '',
    onSubmit: async values => {
      await joinWaitlist(values);
      setStep('joined');
    },
  });
  return { step, form };
}

export function Default(_args: Record<string, unknown>) {
  const { step, form } = useWaitlistPrototype();

  return (
    <WaitlistView
      step={step}
      form={form}
      renderBranding
      isRedirecting={false}
      onSignIn={() => {}}
    />
  );
}

export function Joined(_args: Record<string, unknown>) {
  const { step, form } = useWaitlistPrototype('joined');

  return (
    <WaitlistView
      step={step}
      form={form}
      renderBranding
      isRedirecting={false}
      onSignIn={() => {}}
    />
  );
}

export function Redirecting(_args: Record<string, unknown>) {
  const { step, form } = useWaitlistPrototype('joined');

  return (
    <WaitlistView
      step={step}
      form={form}
      renderBranding
      isRedirecting
      onSignIn={() => {}}
    />
  );
}
