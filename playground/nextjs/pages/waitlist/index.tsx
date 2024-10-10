import type {  NextPage } from 'next';
import { Waitlist, useClerk } from '@clerk/nextjs';

const WailistPage: NextPage = () => {
  const clerk = useClerk();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Waitlist />
      </div>
      <div style={{ textAlign: 'center' , marginTop: '1rem' }}>
        <button type='button' onClick={() => clerk.__experimental_openWaitlist()}>open waitlist</button>
      </div>
    </>
  )
}

export default WailistPage;