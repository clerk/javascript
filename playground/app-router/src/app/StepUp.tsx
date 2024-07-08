'use client';

import { useClerk, useSession, useUser } from '@clerk/nextjs';
import { FormEventHandler, useState } from 'react';

export function StepUp({ level }: { level: 'L1.firstFactor' | 'L2.secondFactor' | 'L3.multiFactor' }) {
  const { user } = useUser();
  const { session } = useSession();
  const { setActive } = useClerk();

  const [step, setStep] = useState(level === 'L3.multiFactor' ? 'L1.firstFactor' : level);

  const onSubmitFirstFactor: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await user?.verifySessionAttemptFirstFactor({ password: fd.get('password') });

    if (level === 'L1.firstFactor') {
      await session?.getToken({ skipCache: true });
      await setActive({ session: session?.id });
    }else {
      setStep('L2.secondFactor')
    }
  };

  const onSubmitSecondFactor: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await user?.verifySessionAttemptSecondFactor({ code: fd.get('code') });

    // if (level === 'L2.secondFactor') {
      await session?.getToken({ skipCache: true });
      await setActive({ session: session?.id });
    // }else {
    //   setStep('L2.secondFactor')
    // }
  };

  return (
    <>
      {step === 'L1.firstFactor' && (
        <form
          style={{
            marginTop: '4rem',
          }}
          onSubmit={onSubmitFirstFactor}
        >
          <h2> Verify it's you password </h2>
          <input
            name='password'
            type='password'
            defaultValue={'elef1!23456'}
          />

          <button>Submit</button>
        </form>
      )}

      {step === 'L2.secondFactor' && (
        <form
          style={{
            marginTop: '4rem',
          }}
          onSubmit={onSubmitSecondFactor}
        >
          <h2> Verify it's you code </h2>
          <input name='code' />

          <button>Submit</button>
        </form>
      )}
    </>
  );
}
