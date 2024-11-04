import type {  NextPage } from 'next';
import { Waitlist, useClerk } from '@clerk/nextjs';

const WaitlistPage: NextPage = () => {
  const clerk = useClerk();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Waitlist />
      </div>
      <div style={{ textAlign: 'center' , marginTop: '1rem' }}>
        <button type='button' onClick={() => clerk.openWaitlist()}>open waitlist</button>
      </div>
    </>
  )
}

export default WaitlistPage;